"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  assessmentDraftSchema,
  planQuestionChanges,
  submissionProblems,
  type AssessmentDraftInput,
  type AssessmentDraftQuestion,
  type BankQuestion,
} from "@/lib/assessment-editor";
import { recordAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requireProgramCapability, type Capability } from "@/lib/program-access";
import { moduleId as moduleIdSchema, programId as programIdSchema, unitId as unitIdSchema } from "@/lib/validation";
import { GENERIC_ERROR, type FormState } from "@/lib/actions/form-state";

/* Module Assessment editor (plan §11; review states decision #3).
 *
 *  - Save Draft / Submit for Review: Owner / Director / Editor
 *    (`editStructure`). Saving an in-review draft withdraws it to `draft`.
 *  - Approve / Reject: Reviewer / Owner / Director (`reviewAssessments`),
 *    never the person who submitted it. Reject needs a comment and returns
 *    the draft to `draft`. Approve publishes in one Serializable transaction:
 *    a question an attempt has used is retired and replaced, never edited
 *    (grading reads the live question).
 *
 * Every id (module, Module Area topic, bank question) is checked against the
 * programId the capability was granted for (SECURITY.md §3); payloads are
 * strict zod objects (§10). Learners only read LpStandaloneAssessment. */

class Refused extends Error {}

async function guard(programId: string, capability: Capability) {
  try {
    return await requireProgramCapability(programId, capability);
  } catch (e) {
    if (e instanceof AccessDeniedError) return null;
    throw e;
  }
}

function fieldErrorsOf(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const i of error.issues) out[i.path.length ? i.path.map(String).join(".") : "form"] ??= i.message;
  return out;
}

const fail = (fieldErrors: Record<string, string>): FormState => ({
  ok: false,
  error: Object.values(fieldErrors)[0] ?? "Check the highlighted fields.",
  fieldErrors,
});

/** The module (in this program), its live assessment, and its valid Module Areas. */
async function loadContext(programId: string, moduleId: string) {
  const mod = await prisma.lpModule.findFirst({
    where: { id: moduleId, programId },
    select: {
      id: true,
      standaloneAssessments: { select: { id: true, version: true }, take: 1 },
      units: { select: { id: true, topics: { where: { order: null }, select: { id: true } } } },
      assessmentDraft: { select: { status: true, submittedById: true } },
    },
  });
  if (!mod) return null;
  const assessment = mod.standaloneAssessments[0] ?? null;
  const areaIds = new Set(mod.units.flatMap((u) => u.topics.map((t) => t.id)));
  const liveIds = new Set(
    assessment
      ? (await prisma.lpQuestionBankItem.findMany({ where: { assessmentId: assessment.id, retiredAt: null }, select: { id: true } })).map((r) => r.id)
      : [],
  );
  return { mod, assessment, areaIds, liveIds };
}

/** Server-side checks zod can't do: Module Areas must belong to this module;
 * question ids not live in this module's assessment become new questions. */
function scope(draft: AssessmentDraftInput, areaIds: Set<string>, liveIds: Set<string>) {
  const errors: Record<string, string> = {};
  const questions: AssessmentDraftQuestion[] = draft.questions.map((q, i) => {
    if (q.topicId && !areaIds.has(q.topicId)) errors[`questions.${i}.topicId`] = "Choose a Module Area from this module.";
    return q.bankItemId && liveIds.has(q.bankItemId) ? q : { ...q, bankItemId: undefined };
  });
  return { errors, draft: { ...draft, questions } };
}

const toDraftRow = (d: AssessmentDraftInput) => ({
  title: d.title,
  description: d.description,
  passThreshold: new Prisma.Decimal(d.passPercent).div(100),
  maxAttempts: d.maxAttempts,
  timeLimitSeconds: d.timeLimitMinutes === null ? null : d.timeLimitMinutes * 60,
  difficultyMix: d.mix,
  questions: d.questions as unknown as Prisma.InputJsonArray,
});

function parseIds(programIdIn: unknown, moduleIdIn: unknown) {
  const pid = programIdSchema.safeParse(programIdIn);
  const mid = moduleIdSchema.safeParse(moduleIdIn);
  return pid.success && mid.success ? { programId: pid.data, moduleId: mid.data } : null;
}

/* ------------------------- save / submit (authors) ------------------------ */

export async function saveAssessment(input: { programId: string; moduleId: string; intent: "draft" | "submit"; draft: unknown }): Promise<FormState> {
  const ids = parseIds(input?.programId, input?.moduleId);
  if (!ids || (input.intent !== "draft" && input.intent !== "submit")) return { ok: false, error: GENERIC_ERROR };
  const access = await guard(ids.programId, "editStructure");
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const ctx = await loadContext(ids.programId, ids.moduleId);
  if (!ctx) return { ok: false, error: GENERIC_ERROR };

  const parsed = assessmentDraftSchema.safeParse(input.draft);
  if (!parsed.success) return fail(fieldErrorsOf(parsed.error));
  const scoped = scope(parsed.data, ctx.areaIds, ctx.liveIds);
  if (Object.keys(scoped.errors).length) return fail(scoped.errors);
  if (input.intent === "submit") {
    const problems = submissionProblems(scoped.draft);
    if (Object.keys(problems).length) return fail(problems);
  }

  const submitting = input.intent === "submit";
  const row = {
    ...toDraftRow(scoped.draft),
    status: submitting ? ("in_review" as const) : ("draft" as const),
    submittedById: submitting ? access.author.id : null,
    submittedAt: submitting ? new Date() : null,
    // A new submission clears the last review; a draft save keeps the
    // reviewer's comment visible while the author works on it.
    ...(submitting ? { reviewComment: null, reviewedById: null, reviewedAt: null } : {}),
    updatedById: access.author.id,
  };
  await prisma.$transaction(async (tx) => {
    await tx.lpAssessmentDraft.upsert({ where: { moduleId: ids.moduleId }, create: { moduleId: ids.moduleId, ...row }, update: row });
    await recordAudit(tx, {
      programId: ids.programId,
      actorAuthorId: access.author.id,
      action: submitting ? "assessment_submitted" : "assessment_draft_saved",
      details: { moduleId: ids.moduleId, questions: scoped.draft.questions.length, withdrew: !submitting && ctx.mod.assessmentDraft?.status === "in_review" },
    });
  });
  revalidatePath(`/programs/${ids.programId}`, "layout");
  return {
    ok: true,
    message: submitting
      ? "Submitted for review. A Reviewer, Owner or Director (not you) can approve it."
      : "Draft saved. Learners keep the published version.",
  };
}

export async function discardAssessmentDraft(input: { programId: string; moduleId: string }): Promise<FormState> {
  const ids = parseIds(input?.programId, input?.moduleId);
  if (!ids) return { ok: false, error: GENERIC_ERROR };
  const access = await guard(ids.programId, "editStructure");
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const ctx = await loadContext(ids.programId, ids.moduleId);
  if (!ctx?.mod.assessmentDraft) return { ok: false, error: GENERIC_ERROR };
  await prisma.$transaction(async (tx) => {
    await tx.lpAssessmentDraft.delete({ where: { moduleId: ids.moduleId } });
    await recordAudit(tx, { programId: ids.programId, actorAuthorId: access.author.id, action: "assessment_draft_saved", details: { moduleId: ids.moduleId, discarded: true } });
  });
  revalidatePath(`/programs/${ids.programId}`, "layout");
  return { ok: true, message: "Draft discarded." };
}

/* ---------------------------- review (reviewers) --------------------------- */

const reviewSchema = z.strictObject({
  programId: z.string(),
  moduleId: z.string(),
  decision: z.enum(["approve", "reject"]),
  comment: z.string().trim().max(2000, "Keep the comment under 2,000 characters.").refine((s) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s), "Remove unsupported characters."),
});

const bankToQuestion = (r: {
  type: string;
  difficulty: string;
  prompt: string;
  options: unknown;
  correctOptionIds: unknown;
  explanation: string | null;
  pointsPossible: Prisma.Decimal;
  topicId: string | null;
}): BankQuestion => ({
  type: r.type as BankQuestion["type"],
  difficulty: r.difficulty as BankQuestion["difficulty"],
  prompt: r.prompt,
  options: r.options as BankQuestion["options"],
  correctOptionIds: r.correctOptionIds as string[],
  explanation: r.explanation,
  points: Number(r.pointsPossible),
  topicId: r.topicId,
});

export async function reviewAssessment(input: unknown): Promise<FormState> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return fail(fieldErrorsOf(parsed.error));
  const ids = parseIds(parsed.data.programId, parsed.data.moduleId);
  if (!ids) return { ok: false, error: GENERIC_ERROR };
  const { decision, comment } = parsed.data;

  const access = await guard(ids.programId, "reviewAssessments");
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const actorId = access.author.id;
  const ctx = await loadContext(ids.programId, ids.moduleId);
  if (!ctx) return { ok: false, error: GENERIC_ERROR };
  if (decision === "reject" && comment.length === 0) return fail({ comment: "Say what needs to change before it can be approved." });

  try {
    await prisma.$transaction(
      async (tx) => {
        const draftRow = await tx.lpAssessmentDraft.findUnique({ where: { moduleId: ids.moduleId } });
        if (!draftRow || draftRow.status !== "in_review") throw new Refused("This assessment isn't waiting for review.");
        // Decision 2026-10-05: never your own submission.
        if (draftRow.submittedById === actorId) throw new Refused("You can't review your own submission. Ask another Reviewer, Owner or Director.");

        if (decision === "reject") {
          await tx.lpAssessmentDraft.update({
            where: { moduleId: ids.moduleId },
            data: { status: "draft", reviewComment: comment, reviewedById: actorId, reviewedAt: new Date() },
          });
          await recordAudit(tx, { programId: ids.programId, actorAuthorId: actorId, action: "assessment_rejected", subjectAuthorId: draftRow.submittedById, details: { moduleId: ids.moduleId, comment } });
          return;
        }

        // ---- approve: re-validate what's stored, then publish ----
        const stored = assessmentDraftSchema.safeParse({
          title: draftRow.title,
          description: draftRow.description,
          passPercent: Math.round(Number(draftRow.passThreshold) * 100),
          maxAttempts: draftRow.maxAttempts,
          timeLimitMinutes: draftRow.timeLimitSeconds === null ? null : Math.round(draftRow.timeLimitSeconds / 60),
          mix: draftRow.difficultyMix,
          questions: draftRow.questions,
        });
        if (!stored.success) throw new Refused("The submission is no longer valid. Return it to the author.");
        const liveRows = ctx.assessment ? await tx.lpQuestionBankItem.findMany({ where: { assessmentId: ctx.assessment.id, retiredAt: null } }) : [];
        const scoped = scope(stored.data, ctx.areaIds, new Set(liveRows.map((r) => r.id)));
        if (Object.keys(scoped.errors).length || Object.keys(submissionProblems(scoped.draft)).length) {
          throw new Refused("The submission is no longer valid (a Module Area or question changed). Return it to the author.");
        }
        const d = scoped.draft;
        const now = new Date();
        const fields = {
          title: d.title,
          description: d.description,
          passThreshold: new Prisma.Decimal(d.passPercent).div(100),
          maxAttempts: d.maxAttempts,
          timeLimitSeconds: d.timeLimitMinutes === null ? null : d.timeLimitMinutes * 60,
          difficultyMix: d.mix,
          questionsPerAttempt: d.mix.easy + d.mix.medium + d.mix.difficult,
        };
        const assessmentId = ctx.assessment?.id ?? `ma-${ids.moduleId}`;
        const version = ctx.assessment ? ctx.assessment.version + 1 : 1;
        if (ctx.assessment) {
          // An existing (e.g. seeded) assessment keeps its firstPublishedAt —
          // setting it now would wrongly un-gate learners (plan §11, rule 4).
          await tx.lpStandaloneAssessment.update({ where: { id: assessmentId }, data: { ...fields, version } });
        } else {
          await tx.lpStandaloneAssessment.create({ data: { id: assessmentId, moduleId: ids.moduleId, ...fields, version, firstPublishedAt: now } });
        }

        const live = liveRows.map((r) => ({ id: r.id, question: bankToQuestion(r) }));
        const used = await tx.lpAttemptQuestion.findMany({
          where: { questionBankItemId: { in: live.map((l) => l.id) } },
          select: { questionBankItemId: true },
          distinct: ["questionBankItemId"],
        });
        const plan = planQuestionChanges(live, d.questions, new Set(used.map((u) => u.questionBankItemId)));
        const position = new Map<AssessmentDraftQuestion, number>(d.questions.map((q, i) => [q, i + 1]));
        const byId = new Map(d.questions.filter((q) => q.bankItemId).map((q) => [q.bankItemId!, q]));
        const data = (q: BankQuestion, pos: number) => ({
          type: q.type,
          difficulty: q.difficulty,
          prompt: q.prompt,
          options: q.options as unknown as Prisma.InputJsonArray,
          correctOptionIds: q.correctOptionIds,
          explanation: q.explanation,
          pointsPossible: q.points,
          topicId: q.topicId,
          position: pos,
        });
        for (const id of plan.unchanged) await tx.lpQuestionBankItem.update({ where: { id }, data: { position: position.get(byId.get(id)!)! } });
        for (const u of plan.updateInPlace) await tx.lpQuestionBankItem.update({ where: { id: u.id }, data: data(u.question, position.get(byId.get(u.id)!)!) });
        for (const r of plan.retireAndReplace) {
          await tx.lpQuestionBankItem.update({ where: { id: r.id }, data: { retiredAt: now } });
          await tx.lpQuestionBankItem.create({ data: { assessmentId, ...data(r.question, position.get(byId.get(r.id)!)!) } });
        }
        const newOnes = d.questions.filter((q) => !q.bankItemId); // same order as plan.create
        for (const [i, c] of plan.create.entries()) await tx.lpQuestionBankItem.create({ data: { assessmentId, ...data(c, position.get(newOnes[i])!) } });
        if (plan.retire.length) await tx.lpQuestionBankItem.updateMany({ where: { id: { in: plan.retire } }, data: { retiredAt: now } });
        if (plan.remove.length) await tx.lpQuestionBankItem.deleteMany({ where: { id: { in: plan.remove } } });

        const active = await tx.lpQuestionBankItem.count({ where: { assessmentId, retiredAt: null } });
        if (active !== d.questions.length) throw new Error(`active ${active} != ${d.questions.length}`);

        await tx.lpAssessmentDraft.delete({ where: { moduleId: ids.moduleId } });
        await tx.lpProgram.update({ where: { id: ids.programId }, data: { updatedAt: now } });
        await recordAudit(tx, {
          programId: ids.programId,
          actorAuthorId: actorId,
          action: "assessment_approved",
          subjectAuthorId: draftRow.submittedById,
          details: {
            moduleId: ids.moduleId,
            assessmentId,
            version,
            comment,
            unchanged: plan.unchanged.length,
            updated: plan.updateInPlace.length,
            replaced: plan.retireAndReplace.length,
            added: plan.create.length,
            retired: plan.retire.length,
            removed: plan.remove.length,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (e) {
    if (e instanceof Refused) return { ok: false, error: e.message };
    console.error("lm.assessment_review_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath(`/programs/${ids.programId}`, "layout");
  return {
    ok: true,
    message: decision === "approve" ? "Approved and published. New attempts use this version." : "Returned to the author with your comment.",
  };
}

/* ------------------------------ Module Areas ------------------------------ */

const areaSchema = z.strictObject({
  programId: z.string(),
  moduleId: z.string(),
  unitId: z.string(),
  name: z.string().trim().min(2, "Name the area (at least 2 characters).").max(120, "Keep the name under 120 characters.").refine((s) => !/[\u0000-\u001f\u007f]/.test(s), "Remove unsupported characters."),
});

/** A Module Area is a tag-only topic (order null) linked to one of the
 * module's units, so weak-topic feedback can point learners back to it. */
export async function createModuleArea(input: unknown): Promise<{ ok: true; area: { id: string; name: string; unitId: string } } | { ok: false; error: string }> {
  const parsed = areaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  const ids = parseIds(parsed.data.programId, parsed.data.moduleId);
  const uid = unitIdSchema.safeParse(parsed.data.unitId);
  if (!ids || !uid.success) return { ok: false, error: GENERIC_ERROR };
  const access = await guard(ids.programId, "editStructure");
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const unit = await prisma.lpUnit.findFirst({ where: { id: uid.data, moduleId: ids.moduleId, module: { programId: ids.programId } }, select: { id: true } });
  if (!unit) return { ok: false, error: GENERIC_ERROR };
  const existing = await prisma.lpTopic.findFirst({ where: { unitId: unit.id, order: null, name: { equals: parsed.data.name, mode: "insensitive" } }, select: { id: true, name: true } });
  if (existing) return { ok: true, area: { ...existing, unitId: unit.id } };
  const area = await prisma.lpTopic.create({ data: { name: parsed.data.name, unitId: unit.id, order: null }, select: { id: true, name: true } });
  revalidatePath(`/programs/${ids.programId}/assessments/${ids.moduleId}`);
  return { ok: true, area: { ...area, unitId: unit.id } };
}
