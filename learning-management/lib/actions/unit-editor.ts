"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { recordAudit } from "@/lib/audit";
import { checkImage, MAX_IMAGE_BYTES } from "@/lib/image-upload";
import {
  decodeMarkdown,
  MAX_MD_BYTES,
  parseMarkdown,
  planTopicMatch,
  type ImportTopic,
  type ImportWarning,
} from "@/lib/markdown-import";
import { sortSiblings } from "@/lib/ordering";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requireProgramCapability } from "@/lib/program-access";
import { mediaStorage } from "@/lib/storage";
import { programId as programIdSchema, safeFileName, unitEditorSchema, unitId as unitIdSchema } from "@/lib/validation";
import { GENERIC_ERROR, type FormState } from "@/lib/actions/form-state";

/* Unit Editor (plan §9; decision #8 per-unit publishing).
 *
 *  - Save Draft writes only LpUnitDraft. Learners never read it.
 *  - Publish Unit writes the draft, then copies it onto the live unit — its
 *    fields, thumbnail, and (if a .md was imported) its topics and content
 *    blocks — in one transaction, and deletes the draft.
 *  - The Module field is structural (like Course Structure moves): saving
 *    moves the unit at once.
 *
 * Owner / Director / Editor (`editStructure`); changing the unit Creator also
 * needs `changeCreator` (decision #9). Every id is checked against the
 * programId the capability was granted for (SECURITY.md §3). Uploads are
 * checked by content, never by name or MIME type (SECURITY.md §10). */

type Tx = Prisma.TransactionClient;
class Refused extends Error {}

type DraftContent = { topics: ImportTopic[] };

export type ImportPreview = {
  fileName: string;
  bytes: number;
  topics: { name: string; blocks: number; status: "kept" | "new" }[];
  removed: string[];
  warnings: ImportWarning[];
  estimatedMinutes: number;
};
export type PreviewState = { ok: true; preview: ImportPreview } | { ok: false; error: string };

async function guard(programId: string) {
  try {
    return await requireProgramCapability(programId, "editStructure");
  } catch (e) {
    if (e instanceof AccessDeniedError) return null;
    throw e;
  }
}

async function findUnitInProgram(programId: string, unitId: string) {
  return prisma.lpUnit.findFirst({
    where: { id: unitId, module: { programId } },
    select: {
      id: true,
      moduleId: true,
      title: true,
      publishedAt: true,
      creatorAuthorId: true,
      thumbnailKey: true,
      draft: { select: { thumbnailKey: true, creatorAuthorId: true, content: true } },
    },
  });
}

/** Reads and checks the uploaded .md. `none` when no file was chosen. */
async function readMarkdown(formData: FormData) {
  const file = formData.get("content");
  if (file === null || typeof file === "string" || file.size === 0) return { kind: "none" as const };
  const name = safeFileName(file.name);
  if (!name) return { kind: "error" as const, error: "Choose a Markdown file ending in .md." };
  if (file.size > MAX_MD_BYTES) return { kind: "error" as const, error: "Markdown files must be 1 MB or smaller." };
  const decoded = decodeMarkdown(new Uint8Array(await file.arrayBuffer()));
  if (!decoded.ok) return { kind: "error" as const, error: decoded.error };
  const result = parseMarkdown(decoded.text);
  if (!result.ok) return { kind: "error" as const, error: result.error };
  return { kind: "file" as const, name, bytes: file.size, parsed: result.value };
}

async function liveTopics(unitId: string) {
  return prisma.lpTopic.findMany({
    where: { unitId, order: { not: null } },
    select: { id: true, name: true },
    orderBy: { order: "asc" },
  });
}

/* ------------------------------ preview ------------------------------ */

/** Dry run (decision #6): parses the file on the server and writes nothing. */
export async function previewImport(programIdIn: string, unitIdIn: string, formData: FormData): Promise<PreviewState> {
  const programId = programIdSchema.safeParse(programIdIn);
  const unitId = unitIdSchema.safeParse(unitIdIn);
  if (!programId.success || !unitId.success) return { ok: false, error: GENERIC_ERROR };
  if (!(await guard(programId.data))) return { ok: false, error: GENERIC_ERROR };
  if (!(await findUnitInProgram(programId.data, unitId.data))) return { ok: false, error: GENERIC_ERROR };

  const md = await readMarkdown(formData);
  if (md.kind === "none") return { ok: false, error: "Choose a Markdown file." };
  if (md.kind === "error") return { ok: false, error: md.error };

  const plan = planTopicMatch(await liveTopics(unitId.data), md.parsed.topics.map((t) => t.name));
  const keptNames = new Set(plan.kept.map((k) => k.name));
  return {
    ok: true,
    preview: {
      fileName: md.name,
      bytes: md.bytes,
      topics: md.parsed.topics.map((t) => ({ name: t.name, blocks: t.blocks.length, status: keptNames.has(t.name) ? "kept" : "new" })),
      removed: plan.removed.map((r) => r.name),
      warnings: md.parsed.warnings,
      estimatedMinutes: md.parsed.estimatedMinutes,
    },
  };
}

/* --------------------------- save / publish -------------------------- */

function readFields(formData: FormData): unknown {
  const fields: Record<string, unknown> = {};
  for (const key of ["title", "description", "moduleId", "durationMin", "tokensAward", "tokensRequired"]) {
    fields[key] = formData.get(key) ?? "";
  }
  if (formData.has("creatorAuthorId")) fields.creatorAuthorId = formData.get("creatorAuthorId");
  return fields;
}

function fieldErrorsOf(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= key === "creatorAuthorId" || key === "moduleId" ? "Choose an option from the list." : issue.message;
  }
  return out;
}

const newBlockId = () => `cb-${randomBytes(8).toString("hex")}`;

/** Copies the draft onto the live unit (decision #8). */
async function publishDraft(tx: Tx, unitId: string) {
  const draft = await tx.lpUnitDraft.findUnique({ where: { unitId } });
  if (!draft) throw new Error("no draft");
  const content = draft.content as DraftContent | null;

  // Never show learners an empty unit.
  if (!content && (await tx.lpContentBlock.count({ where: { unitId } })) === 0) {
    throw new Refused("Import the unit's content (a .md file) before publishing.");
  }

  let summary: Prisma.InputJsonObject = { content: "unchanged" };
  if (content) {
    const existing = await tx.lpTopic.findMany({ where: { unitId, order: { not: null } }, select: { id: true, name: true } });
    const plan = planTopicMatch(existing, content.topics.map((t) => t.name));
    const idByName = new Map(plan.kept.map((k) => [k.name, k.id]));

    await tx.lpContentBlock.deleteMany({ where: { unitId } });
    // Removed topics go; learners' progress on them goes with them (cascade),
    // which decision #8 accepts: removed topics are ignored, and a completed
    // unit is never downgraded.
    if (plan.removed.length > 0) await tx.lpTopic.deleteMany({ where: { id: { in: plan.removed.map((r) => r.id) } } });

    let blockOrder = 1;
    for (const [i, t] of content.topics.entries()) {
      let topicId = idByName.get(t.name);
      if (topicId) {
        await tx.lpTopic.update({ where: { id: topicId }, data: { name: t.name, order: i + 1 } });
      } else {
        topicId = (await tx.lpTopic.create({ data: { unitId, name: t.name, order: i + 1 }, select: { id: true } })).id;
      }
      await tx.lpContentBlock.createMany({
        data: t.blocks.map((b) => ({ id: newBlockId(), unitId, topicId, order: blockOrder++, type: b.type, payload: b.payload })),
      });
    }
    summary = { topicsKept: plan.kept.length, topicsAdded: plan.added.length, topicsRemoved: plan.removed.length };
  }

  const before = await tx.lpUnit.findUniqueOrThrow({ where: { id: unitId }, select: { publishedAt: true, thumbnailKey: true } });
  await tx.lpUnit.update({
    where: { id: unitId },
    data: {
      title: draft.title,
      description: draft.description,
      durationMin: draft.durationMin,
      tokensAward: draft.tokensAward,
      tokensRequired: draft.tokensRequired,
      creatorAuthorId: draft.creatorAuthorId,
      ...(draft.thumbnailKey ? { thumbnailKey: draft.thumbnailKey } : {}),
      ...(content ? { contentSourceName: draft.contentSourceName, contentSourceBytes: draft.contentSourceBytes } : {}),
      ...(before.publishedAt ? {} : { publishedAt: new Date() }),
    },
  });
  await tx.lpUnitDraft.delete({ where: { unitId } });
  return {
    summary: { ...summary, firstPublish: before.publishedAt === null },
    replacedThumbnail: draft.thumbnailKey && before.thumbnailKey ? before.thumbnailKey : null,
  };
}

export async function saveUnit(
  programIdIn: string,
  unitIdIn: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const pid = programIdSchema.safeParse(programIdIn);
  const uid = unitIdSchema.safeParse(unitIdIn);
  if (!pid.success || !uid.success) return { ok: false, error: GENERIC_ERROR };
  const programId = pid.data;
  const unitId = uid.data;
  const intent = formData.get("intent") === "publish" ? "publish" : "draft";

  const access = await guard(programId);
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const actorId = access.author.id;

  const unit = await findUnitInProgram(programId, unitId);
  if (!unit) return { ok: false, error: GENERIC_ERROR };

  const parsed = unitEditorSchema.safeParse(readFields(formData));
  if (!parsed.success) return { ok: false, error: "Check the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  const input = parsed.data;

  // Creator (decision #9): compare with what's pending, else live.
  const currentCreator = unit.draft ? unit.draft.creatorAuthorId : unit.creatorAuthorId;
  let creator = currentCreator;
  if (input.creatorAuthorId !== undefined) {
    const requested = input.creatorAuthorId === "" ? null : input.creatorAuthorId;
    if (requested !== currentCreator) {
      if (!access.can.changeCreator) {
        console.warn(JSON.stringify({ event: "lm.authz_denied", authorId: actorId, programId, capability: "changeCreator" }));
        return { ok: false, error: GENERIC_ERROR };
      }
      if (requested && (await prisma.lpAuthor.count({ where: { id: requested } })) !== 1) {
        return { ok: false, error: "Check the highlighted fields.", fieldErrors: { creatorAuthorId: "Choose an option from the list." } };
      }
      creator = requested;
    }
  }

  // Target module must be in this program.
  if (input.moduleId !== unit.moduleId) {
    const target = await prisma.lpModule.count({ where: { id: input.moduleId, programId } });
    if (target !== 1) return { ok: false, error: "Check the highlighted fields.", fieldErrors: { moduleId: "Choose an option from the list." } };
  }

  // Thumbnail: content-checked image.
  let newThumb: string | null = null;
  const thumb = formData.get("thumbnail");
  if (thumb !== null && typeof thumb !== "string" && thumb.size > 0) {
    if (thumb.size > MAX_IMAGE_BYTES) return { ok: false, error: "Images must be 2 MB or smaller.", fieldErrors: { thumbnail: "Images must be 2 MB or smaller." } };
    const bytes = new Uint8Array(await thumb.arrayBuffer());
    const check = checkImage(bytes);
    if (!check.ok) return { ok: false, error: check.error, fieldErrors: { thumbnail: check.error } };
    newThumb = await mediaStorage.put(bytes, check.kind);
  }

  const md = await readMarkdown(formData);
  if (md.kind === "error") {
    if (newThumb) await mediaStorage.delete(newThumb);
    return { ok: false, error: md.error, fieldErrors: { content: md.error } };
  }

  const pendingThumb = unit.draft?.thumbnailKey ?? null;
  let published: Awaited<ReturnType<typeof publishDraft>> | null = null;
  try {
    published = await prisma.$transaction(async (tx) => {
      // Structural: move to the end of the chosen module now.
      if (input.moduleId !== unit.moduleId) {
        const last = await tx.lpUnit.aggregate({ where: { moduleId: input.moduleId }, _max: { order: true } });
        await tx.lpUnit.update({ where: { id: unitId }, data: { moduleId: input.moduleId, order: (last._max.order ?? 0) + 1 } });
        const rest = sortSiblings(await tx.lpUnit.findMany({ where: { moduleId: unit.moduleId }, select: { id: true, order: true } }));
        for (const [i, r] of rest.entries()) if (r.order !== i + 1) await tx.lpUnit.update({ where: { id: r.id }, data: { order: i + 1 } });
        await recordAudit(tx, { programId, actorAuthorId: actorId, action: "unit_reordered", details: { unitId, fromModule: unit.moduleId, toModule: input.moduleId } });
      }

      const draftData = {
        title: input.title,
        description: input.description,
        durationMin: input.durationMin,
        tokensAward: input.tokensAward,
        tokensRequired: input.tokensRequired,
        creatorAuthorId: creator,
        updatedById: actorId,
        ...(newThumb ? { thumbnailKey: newThumb } : {}),
        ...(md.kind === "file"
          ? { content: { topics: md.parsed.topics } as unknown as Prisma.InputJsonObject, contentSourceName: md.name, contentSourceBytes: md.bytes }
          : {}),
      };
      await tx.lpUnitDraft.upsert({ where: { unitId }, create: { unitId, ...draftData }, update: draftData });

      if (intent === "publish") {
        const result = await publishDraft(tx, unitId);
        await recordAudit(tx, { programId, actorAuthorId: actorId, action: "unit_published", details: { unitId, ...result.summary } });
        await tx.lpProgram.update({ where: { id: programId }, data: { updatedAt: new Date() } });
        return result;
      }
      await recordAudit(tx, {
        programId,
        actorAuthorId: actorId,
        action: "unit_draft_saved",
        details: { unitId, contentImported: md.kind === "file", thumbnailChanged: Boolean(newThumb) },
      });
      return null;
    });
  } catch (e) {
    if (!(e instanceof Refused)) console.error("lm.unit_save_failed", e);
    if (newThumb) await mediaStorage.delete(newThumb);
    return { ok: false, error: e instanceof Refused ? e.message : GENERIC_ERROR };
  }

  // Files no longer referenced by anything.
  if (newThumb && pendingThumb) await mediaStorage.delete(pendingThumb);
  if (published?.replacedThumbnail) await mediaStorage.delete(published.replacedThumbnail);

  revalidatePath("/");
  revalidatePath(`/programs/${programId}`, "layout");
  return {
    ok: true,
    message: intent === "publish" ? "Published. Learners now see this version of the unit." : "Draft saved. Learners won't see these changes until you publish.",
  };
}

/** Throws away pending changes; the live unit is untouched. */
export async function discardDraft(input: { programId: string; unitId: string }): Promise<FormState> {
  const pid = programIdSchema.safeParse(input?.programId);
  const uid = unitIdSchema.safeParse(input?.unitId);
  if (!pid.success || !uid.success) return { ok: false, error: GENERIC_ERROR };
  const access = await guard(pid.data);
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const unit = await findUnitInProgram(pid.data, uid.data);
  if (!unit?.draft) return { ok: false, error: GENERIC_ERROR };
  if (!unit.publishedAt) return { ok: false, error: "This unit has never been published, so there's nothing to go back to." };

  await prisma.$transaction(async (tx) => {
    await tx.lpUnitDraft.delete({ where: { unitId: unit.id } });
    await recordAudit(tx, { programId: pid.data, actorAuthorId: access.author.id, action: "unit_draft_saved", details: { unitId: unit.id, discarded: true } });
  });
  if (unit.draft.thumbnailKey) await mediaStorage.delete(unit.draft.thumbnailKey);
  revalidatePath(`/programs/${pid.data}`, "layout");
  return { ok: true, message: "Unpublished changes discarded." };
}
