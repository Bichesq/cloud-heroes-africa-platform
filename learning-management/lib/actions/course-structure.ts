"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma, type LpAuthoringAuditAction } from "@prisma/client";
import { recordAudit } from "@/lib/audit";
import { mediaStorage } from "@/lib/storage";
import { moveOneStep, nextOrder, sortSiblings } from "@/lib/ordering";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requireProgramCapability } from "@/lib/program-access";
import {
  addModuleSchema,
  addUnitSchema,
  deleteModuleSchema,
  deleteUnitSchema,
  moveModuleSchema,
  moveUnitSchema,
  updateModuleSchema,
} from "@/lib/validation";
import { GENERIC_ERROR, type FormState } from "@/lib/actions/form-state";

/* Course Structure (§6.2) writes — plan §8. Owner / Director / Editor
 * (`editStructure`). Every module and unit id is attacker-controlled
 * (SECURITY.md §3): each one is looked up *within the programId* the
 * capability was checked for, so an id from another program is "not found".
 *
 * New units are drafts (publishedAt null) and never reach learners until
 * Publish Unit. Unit names and content are edited in the Unit Editor (via its
 * draft); module renames and all moves apply immediately. Each change
 * bumps the program's updatedAt and writes an audit entry in the same
 * transaction. */

type Tx = Prisma.TransactionClient;
class NotFound extends Error {}
class Refused extends Error {}

const newId = (prefix: "m" | "u") => `${prefix}-${randomBytes(5).toString("hex")}`;

/** Rewrite sibling orders as 1..n (after a delete leaves a gap). */
async function renumber(tx: Tx, kind: "module" | "unit", parentId: string) {
  if (kind === "module") {
    const rows = sortSiblings(await tx.lpModule.findMany({ where: { programId: parentId }, select: { id: true, order: true } }));
    for (const [i, r] of rows.entries()) if (r.order !== i + 1) await tx.lpModule.update({ where: { id: r.id }, data: { order: i + 1 } });
  } else {
    const rows = sortSiblings(await tx.lpUnit.findMany({ where: { moduleId: parentId }, select: { id: true, order: true } }));
    for (const [i, r] of rows.entries()) if (r.order !== i + 1) await tx.lpUnit.update({ where: { id: r.id }, data: { order: i + 1 } });
  }
}

async function guard(programId: string) {
  try {
    return await requireProgramCapability(programId, "editStructure");
  } catch (e) {
    if (e instanceof AccessDeniedError) return null;
    throw e;
  }
}

async function finish(
  tx: Tx,
  programId: string,
  actorAuthorId: string,
  action: LpAuthoringAuditAction,
  details: Prisma.InputJsonObject,
) {
  await tx.lpProgram.update({ where: { id: programId }, data: { updatedAt: new Date() } });
  await recordAudit(tx, { programId, actorAuthorId, action, details });
}

/** Runs a structure change; maps failures to generic, non-leaky messages. */
async function run(programId: string, label: string, fn: (actorId: string) => Promise<void>): Promise<FormState> {
  const access = await guard(programId);
  if (!access) return { ok: false, error: GENERIC_ERROR };
  try {
    await fn(access.author.id);
  } catch (e) {
    if (e instanceof Refused) return { ok: false, error: e.message };
    if (!(e instanceof NotFound)) console.error(`lm.${label}_failed`, e);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidatePath("/");
  revalidatePath(`/programs/${programId}`, "layout");
  return { ok: true };
}

async function findModule(tx: Tx, programId: string, moduleId: string) {
  const m = await tx.lpModule.findFirst({ where: { id: moduleId, programId }, select: { id: true, title: true } });
  if (!m) throw new NotFound();
  return m;
}

async function findUnit(tx: Tx, programId: string, unitId: string) {
  const u = await tx.lpUnit.findFirst({
    where: { id: unitId, module: { programId } },
    select: { id: true, moduleId: true, title: true, publishedAt: true },
  });
  if (!u) throw new NotFound();
  return u;
}

/** Title/description problems get their own (author-written) message; any
 * other invalid field — ids, direction — is attacker territory: generic. */
function invalid(error: { issues: { path: PropertyKey[]; message: string }[] }): FormState {
  const field = error.issues.find((i) => i.path[0] === "title" || i.path[0] === "description");
  if (field && error.issues.every((i) => i.path[0] === "title" || i.path[0] === "description")) {
    return { ok: false, error: field.message, fieldErrors: { [String(field.path[0])]: field.message } };
  }
  return { ok: false, error: GENERIC_ERROR };
}

/* ------------------------------- modules ------------------------------- */

export async function addModule(input: unknown): Promise<FormState> {
  const parsed = addModuleSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, title, description } = parsed.data;
  return run(programId, "module_add", (actor) =>
    prisma.$transaction(async (tx) => {
      const siblings = await tx.lpModule.findMany({ where: { programId }, select: { id: true, order: true } });
      const id = newId("m");
      await tx.lpModule.create({ data: { id, programId, title, description, order: nextOrder(siblings) } });
      await finish(tx, programId, actor, "module_created", { moduleId: id, title });
    }),
  );
}

export async function updateModule(input: unknown): Promise<FormState> {
  const parsed = updateModuleSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, moduleId, title, description } = parsed.data;
  return run(programId, "module_update", (actor) =>
    prisma.$transaction(async (tx) => {
      const before = await findModule(tx, programId, moduleId);
      await tx.lpModule.update({ where: { id: moduleId }, data: { title, description } });
      await finish(tx, programId, actor, "module_updated", { moduleId, before: before.title, after: title });
    }),
  );
}

export async function moveModule(input: unknown): Promise<FormState> {
  const parsed = moveModuleSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, moduleId, direction } = parsed.data;
  return run(programId, "module_move", (actor) =>
    prisma.$transaction(async (tx) => {
      const siblings = await tx.lpModule.findMany({ where: { programId }, select: { id: true, order: true } });
      const sequence = moveOneStep(siblings, moduleId, direction);
      if (!sequence) throw new NotFound();
      for (const [i, id] of sequence.entries()) {
        await tx.lpModule.update({ where: { id }, data: { order: i + 1 } });
      }
      await finish(tx, programId, actor, "module_reordered", { moduleId, direction });
    }),
  );
}

export async function deleteModule(input: unknown): Promise<FormState> {
  const parsed = deleteModuleSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, moduleId } = parsed.data;
  return run(programId, "module_delete", (actor) =>
    prisma.$transaction(async (tx) => {
      const m = await findModule(tx, programId, moduleId);
      if ((await tx.lpUnit.count({ where: { moduleId } })) > 0) {
        throw new Refused("Only an empty module can be deleted. Move or delete its units first.");
      }
      if ((await tx.lpStandaloneAssessment.count({ where: { moduleId } })) > 0) {
        throw new Refused("This module has a Module Assessment, so it can't be deleted.");
      }
      await tx.lpModule.delete({ where: { id: moduleId } });
      await renumber(tx, "module", programId);
      await finish(tx, programId, actor, "module_deleted", { moduleId, title: m.title });
    }),
  );
}

/* -------------------------------- units -------------------------------- */

export async function addUnit(input: unknown): Promise<FormState> {
  const parsed = addUnitSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, moduleId, title, description } = parsed.data;
  return run(programId, "unit_add", (actor) =>
    prisma.$transaction(async (tx) => {
      await findModule(tx, programId, moduleId);
      const siblings = await tx.lpUnit.findMany({ where: { moduleId }, select: { id: true, order: true } });
      const id = newId("u");
      await tx.lpUnit.create({
        // publishedAt stays null: a draft, hidden from learners (plan §8).
        data: { id, moduleId, title, description, order: nextOrder(siblings), creatorAuthorId: actor, tokensAward: 10 },
      });
      await finish(tx, programId, actor, "unit_created", { unitId: id, moduleId, title });
    }),
  );
}

export async function moveUnit(input: unknown): Promise<FormState> {
  const parsed = moveUnitSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, unitId, direction } = parsed.data;
  return run(programId, "unit_move", (actor) =>
    prisma.$transaction(async (tx) => {
      const unit = await findUnit(tx, programId, unitId);
      const siblings = await tx.lpUnit.findMany({ where: { moduleId: unit.moduleId }, select: { id: true, order: true } });
      const sequence = moveOneStep(siblings, unitId, direction);
      if (!sequence) throw new NotFound();
      for (const [i, id] of sequence.entries()) {
        await tx.lpUnit.update({ where: { id }, data: { order: i + 1 } });
      }
      await finish(tx, programId, actor, "unit_reordered", { unitId, direction });
    }),
  );
}

export async function deleteUnit(input: unknown): Promise<FormState> {
  const parsed = deleteUnitSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const { programId, unitId } = parsed.data;
  const files: string[] = [];
  const result = await run(programId, "unit_delete", (actor) =>
    prisma.$transaction(async (tx) => {
      const unit = await findUnit(tx, programId, unitId);
      // Only drafts: a unit that was ever published may carry learner progress.
      if (unit.publishedAt) throw new Refused("Published units can't be deleted.");
      const media = await tx.lpUnit.findUniqueOrThrow({
        where: { id: unitId },
        select: { thumbnailKey: true, draft: { select: { thumbnailKey: true } } },
      });
      // Topics would be orphaned (optional relation), so remove them first.
      // Learner rows (progress, notes, goals) restrict the delete, so one
      // that somehow exists makes the whole transaction fail instead. The
      // draft row cascades.
      await tx.lpTopic.deleteMany({ where: { unitId } });
      await tx.lpUnit.delete({ where: { id: unitId } });
      await renumber(tx, "unit", unit.moduleId);
      await finish(tx, programId, actor, "unit_deleted", { unitId, moduleId: unit.moduleId, title: unit.title });
      for (const key of [media.thumbnailKey, media.draft?.thumbnailKey]) if (key) files.push(key);
    }),
  );
  if (result?.ok) for (const key of files) await mediaStorage.delete(key);
  return result;
}
