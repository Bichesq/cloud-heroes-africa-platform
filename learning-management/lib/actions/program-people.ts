"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type LpAuthoringAuditAction } from "@prisma/client";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requireProgramCapability, type Capability } from "@/lib/program-access";
import {
  addContributorSchema,
  changeRoleSchema,
  personListChangeSchema,
  personSchema,
} from "@/lib/validation";
import { GENERIC_ERROR, type FormState } from "@/lib/actions/form-state";

/* People on a program: Instructors (Program Setup, §6.1), Directors, Owners
 * and Contributors (Settings & Access, §6.5). Rules (plan §7):
 *  - Instructors: Owner / Director / Editor (same as editing Program Setup).
 *  - Directors and Owners: Director only; the last Director can't be removed.
 *  - Contributors: Owner / Director.
 * Every input is attacker-controlled (SECURITY.md §3): validated with zod,
 * then the capability is checked for THAT programId. Each change and its
 * audit entry commit in one transaction. */

type PersonList = "director" | "owner" | "instructor";

const LIST_CAPABILITY: Record<PersonList, Capability> = {
  director: "manageDirectorsOwners",
  owner: "manageDirectorsOwners",
  instructor: "editSetup",
};

const LIST_ACTIONS: Record<PersonList, { added: LpAuthoringAuditAction; removed: LpAuthoringAuditAction }> = {
  director: { added: "director_added", removed: "director_removed" },
  owner: { added: "owner_added", removed: "owner_removed" },
  instructor: { added: "instructor_added", removed: "instructor_removed" },
};

class LastDirectorError extends Error {}

async function guard(programId: string, capability: Capability) {
  try {
    return await requireProgramCapability(programId, capability);
  } catch (e) {
    if (e instanceof AccessDeniedError) return null;
    throw e;
  }
}

function revalidateProgram(programId: string) {
  revalidatePath("/");
  revalidatePath(`/programs/${programId}`, "layout");
}

async function authorExists(id: string): Promise<boolean> {
  return (await prisma.lpAuthor.count({ where: { id } })) === 1;
}

const isUniqueViolation = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function addPerson(input: unknown): Promise<FormState> {
  const parsed = personListChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const { programId, authorId, list } = parsed.data;

  const access = await guard(programId, LIST_CAPABILITY[list]);
  if (!access) return { ok: false, error: GENERIC_ERROR };
  if (!(await authorExists(authorId))) return { ok: false, error: "Choose someone from the list." };

  const data = { programId, authorId, addedById: access.author.id };
  try {
    await prisma.$transaction(async (tx) => {
      if (list === "director") await tx.lpProgramDirector.create({ data });
      else if (list === "owner") await tx.lpProgramOwner.create({ data });
      else await tx.lpProgramInstructor.create({ data });
      await recordAudit(tx, { programId, actorAuthorId: access.author.id, action: LIST_ACTIONS[list].added, subjectAuthorId: authorId });
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: "They're already on this list." };
    console.error("lm.person_add_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateProgram(programId);
  return { ok: true };
}

export async function removePerson(input: unknown): Promise<FormState> {
  const parsed = personListChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const { programId, authorId, list } = parsed.data;

  const access = await guard(programId, LIST_CAPABILITY[list]);
  if (!access) return { ok: false, error: GENERIC_ERROR };

  const where = { programId_authorId: { programId, authorId } };
  try {
    await prisma.$transaction(
      async (tx) => {
        if (list === "director") {
          await tx.lpProgramDirector.delete({ where });
          // Serializable: two concurrent removals can't both pass this check.
          if ((await tx.lpProgramDirector.count({ where: { programId } })) === 0) throw new LastDirectorError();
        } else if (list === "owner") {
          await tx.lpProgramOwner.delete({ where });
        } else {
          await tx.lpProgramInstructor.delete({ where });
        }
        await recordAudit(tx, { programId, actorAuthorId: access.author.id, action: LIST_ACTIONS[list].removed, subjectAuthorId: authorId });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (e) {
    if (e instanceof LastDirectorError) {
      return { ok: false, error: "A program needs at least one Director. Add another Director first." };
    }
    console.error("lm.person_remove_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateProgram(programId);
  return { ok: true };
}

export async function addContributor(input: unknown): Promise<FormState> {
  const parsed = addContributorSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const { programId, authorId, role } = parsed.data;

  const access = await guard(programId, "manageContributors");
  if (!access) return { ok: false, error: GENERIC_ERROR };
  if (!(await authorExists(authorId))) return { ok: false, error: "Choose someone from the list." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.lpProgramContributor.create({ data: { programId, authorId, role, addedById: access.author.id } });
      await recordAudit(tx, { programId, actorAuthorId: access.author.id, action: "contributor_added", subjectAuthorId: authorId, details: { role } });
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, error: "They're already a contributor. Change their role in the table instead." };
    console.error("lm.contributor_add_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateProgram(programId);
  return { ok: true };
}

export async function changeContributorRole(input: unknown): Promise<FormState> {
  const parsed = changeRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const { programId, authorId, role } = parsed.data;

  const access = await guard(programId, "manageContributors");
  if (!access) return { ok: false, error: GENERIC_ERROR };

  try {
    await prisma.$transaction(async (tx) => {
      const where = { programId_authorId: { programId, authorId } };
      const current = await tx.lpProgramContributor.findUnique({ where, select: { role: true } });
      if (!current) throw new Error("not a contributor");
      if (current.role === role) return;
      await tx.lpProgramContributor.update({ where, data: { role } });
      await recordAudit(tx, {
        programId,
        actorAuthorId: access.author.id,
        action: "contributor_role_changed",
        subjectAuthorId: authorId,
        details: { before: current.role, after: role },
      });
    });
  } catch (e) {
    console.error("lm.contributor_role_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateProgram(programId);
  return { ok: true };
}

export async function removeContributor(input: unknown): Promise<FormState> {
  const parsed = personSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: GENERIC_ERROR };
  const { programId, authorId } = parsed.data;

  const access = await guard(programId, "manageContributors");
  if (!access) return { ok: false, error: GENERIC_ERROR };

  try {
    await prisma.$transaction(async (tx) => {
      const removed = await tx.lpProgramContributor.delete({
        where: { programId_authorId: { programId, authorId } },
        select: { role: true },
      });
      await recordAudit(tx, {
        programId,
        actorAuthorId: access.author.id,
        action: "contributor_removed",
        subjectAuthorId: authorId,
        details: { role: removed.role },
      });
    });
  } catch (e) {
    console.error("lm.contributor_remove_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }
  revalidateProgram(programId);
  return { ok: true };
}
