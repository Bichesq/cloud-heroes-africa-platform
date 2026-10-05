"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { recordAudit } from "@/lib/audit";
import { kcDraftSchema, planQuestionChanges, type BankQuestion, type KcDraftQuestion } from "@/lib/kc-editor";
import { prisma } from "@/lib/prisma";
import { AccessDeniedError, requireProgramCapability } from "@/lib/program-access";
import { programId as programIdSchema, unitId as unitIdSchema } from "@/lib/validation";
import { GENERIC_ERROR, type FormState } from "@/lib/actions/form-state";

/* Knowledge Check Editor (plan §10). Owner / Director / Editor
 * (`editStructure`); KCs publish directly — no review gate (§6.3).
 *
 *  - Save as Draft writes only LpKcDraft (learners never read it).
 *  - Save & Publish creates or updates the unit's KC, bumps its version, and
 *    applies question changes without ever editing a question an attempt has
 *    used (lib/kc-editor.ts#planQuestionChanges), in one Serializable
 *    transaction — so an attempt starting at the same moment can't pin a
 *    question that's being edited in place.
 *
 * Every id is checked against the programId the capability was granted for
 * (SECURITY.md §3); the whole payload is validated with a strict zod schema
 * (§10). */

async function guard(programId: string) {
  try {
    return await requireProgramCapability(programId, "editStructure");
  } catch (e) {
    if (e instanceof AccessDeniedError) return null;
    throw e;
  }
}

function issuesToFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const i of error.issues) {
    const key = i.path.length ? i.path.map(String).join(".") : "form";
    out[key] ??= i.message;
  }
  return out;
}

const bankToQuestion = (row: {
  prompt: string;
  options: unknown;
  correctOptionId: string;
  explanation: string | null;
  pointsPossible: Prisma.Decimal;
}): BankQuestion => ({
  prompt: row.prompt,
  options: row.options as BankQuestion["options"],
  correctOptionId: row.correctOptionId,
  explanation: row.explanation,
  points: Number(row.pointsPossible),
});

export async function saveKnowledgeCheck(input: {
  programId: string;
  unitId: string;
  intent: "draft" | "publish";
  draft: unknown;
}): Promise<FormState> {
  const pid = programIdSchema.safeParse(input?.programId);
  const uid = unitIdSchema.safeParse(input?.unitId);
  if (!pid.success || !uid.success || (input.intent !== "draft" && input.intent !== "publish")) {
    return { ok: false, error: GENERIC_ERROR };
  }
  const programId = pid.data;
  const unitId = uid.data;

  const access = await guard(programId);
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const actorId = access.author.id;

  const unit = await prisma.lpUnit.findFirst({
    where: { id: unitId, module: { programId } },
    select: { id: true, knowledgeChecks: { select: { id: true, version: true } } },
  });
  if (!unit) return { ok: false, error: GENERIC_ERROR };
  const kc = unit.knowledgeChecks[0] ?? null;

  const parsed = kcDraftSchema.safeParse(input.draft);
  if (!parsed.success) {
    const fieldErrors = issuesToFieldErrors(parsed.error);
    return { ok: false, error: Object.values(fieldErrors)[0] ?? "Check the highlighted fields.", fieldErrors };
  }
  const draft = parsed.data;

  // Question ids must belong to THIS unit's KC; anything else becomes new.
  const ownIds = new Set(
    kc ? (await prisma.lpKcQuestionBankItem.findMany({ where: { kcId: kc.id, retiredAt: null }, select: { id: true } })).map((r) => r.id) : [],
  );
  const questions: KcDraftQuestion[] = draft.questions.map((q) =>
    q.bankItemId && ownIds.has(q.bankItemId) ? q : { ...q, bankItemId: undefined },
  );

  const draftData = {
    title: draft.title,
    passThreshold: new Prisma.Decimal(draft.passPercent).div(100),
    questionsPerAttempt: draft.questionsPerAttempt,
    questions: questions as unknown as Prisma.InputJsonArray,
    updatedById: actorId,
  };

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.lpKcDraft.upsert({ where: { unitId }, create: { unitId, ...draftData }, update: draftData });
        if (input.intent === "draft") {
          await recordAudit(tx, { programId, actorAuthorId: actorId, action: "kc_draft_saved", details: { unitId, questions: questions.length } });
          return;
        }

        // ---- publish ----
        const kcId = kc?.id ?? `kc-${unitId}`;
        const version = kc ? kc.version + 1 : 1;
        if (kc) {
          await tx.lpKnowledgeCheck.update({
            where: { id: kcId },
            data: { title: draft.title, passThreshold: draftData.passThreshold, questionsPerAttempt: draft.questionsPerAttempt, version },
          });
        } else {
          await tx.lpKnowledgeCheck.create({
            data: { id: kcId, unitId, title: draft.title, passThreshold: draftData.passThreshold, questionsPerAttempt: draft.questionsPerAttempt, version },
          });
        }

        const liveRows = await tx.lpKcQuestionBankItem.findMany({ where: { kcId, retiredAt: null } });
        const live = liveRows.map((r) => ({ id: r.id, question: bankToQuestion(r) }));
        const usedRows = await tx.lpKcAttemptQuestion.findMany({
          where: { kcQuestionBankItemId: { in: live.map((l) => l.id) } },
          select: { kcQuestionBankItemId: true },
          distinct: ["kcQuestionBankItemId"],
        });
        // Re-check ids against the live bank inside the transaction: a question
        // retired since the draft was saved is published as a new one.
        const liveIds = new Set(live.map((l) => l.id));
        const pub: KcDraftQuestion[] = questions.map((q) => (q.bankItemId && liveIds.has(q.bankItemId) ? q : { ...q, bankItemId: undefined }));
        const plan = planQuestionChanges(live, pub, new Set(usedRows.map((u) => u.kcQuestionBankItemId)));
        const now = new Date();
        const data = (q: BankQuestion, position: number) => ({
          prompt: q.prompt,
          options: q.options as unknown as Prisma.InputJsonArray,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
          pointsPossible: q.points,
          position,
        });

        // Positions follow the draft's order.
        const positionOf = new Map<KcDraftQuestion, number>(pub.map((q, i) => [q, i + 1]));
        const byId = new Map(pub.filter((q) => q.bankItemId).map((q) => [q.bankItemId!, q]));

        for (const id of plan.unchanged) {
          await tx.lpKcQuestionBankItem.update({ where: { id }, data: { position: positionOf.get(byId.get(id)!)! } });
        }
        for (const u of plan.updateInPlace) {
          await tx.lpKcQuestionBankItem.update({ where: { id: u.id }, data: data(u.question, positionOf.get(byId.get(u.id)!)!) });
        }
        for (const r of plan.retireAndReplace) {
          await tx.lpKcQuestionBankItem.update({ where: { id: r.id }, data: { retiredAt: now } });
          await tx.lpKcQuestionBankItem.create({ data: { kcId, ...data(r.question, positionOf.get(byId.get(r.id)!)!) } });
        }
        const newOnes = pub.filter((q) => !q.bankItemId); // same order as plan.create
        for (const [i, c] of plan.create.entries()) {
          await tx.lpKcQuestionBankItem.create({ data: { kcId, ...data(c, positionOf.get(newOnes[i])!) } });
        }
        if (plan.retire.length) await tx.lpKcQuestionBankItem.updateMany({ where: { id: { in: plan.retire } }, data: { retiredAt: now } });
        if (plan.remove.length) await tx.lpKcQuestionBankItem.deleteMany({ where: { id: { in: plan.remove } } });

        // Safety net: the bank learners draw from must match what was published.
        const active = await tx.lpKcQuestionBankItem.count({ where: { kcId, retiredAt: null } });
        if (active !== pub.length) throw new Error(`active ${active} != ${pub.length}`);

        await tx.lpKcDraft.delete({ where: { unitId } });
        await tx.lpProgram.update({ where: { id: programId }, data: { updatedAt: now } });
        await recordAudit(tx, {
          programId,
          actorAuthorId: actorId,
          action: "kc_published",
          details: {
            unitId,
            kcId,
            version,
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
    console.error("lm.kc_save_failed", e);
    return { ok: false, error: GENERIC_ERROR };
  }

  revalidatePath(`/programs/${programId}`, "layout");
  return {
    ok: true,
    message:
      input.intent === "publish"
        ? "Published. New attempts use this version; attempts already started keep their questions."
        : "Draft saved. Learners keep the published version until you publish.",
  };
}

export async function discardKnowledgeCheckDraft(input: { programId: string; unitId: string }): Promise<FormState> {
  const pid = programIdSchema.safeParse(input?.programId);
  const uid = unitIdSchema.safeParse(input?.unitId);
  if (!pid.success || !uid.success) return { ok: false, error: GENERIC_ERROR };
  const access = await guard(pid.data);
  if (!access) return { ok: false, error: GENERIC_ERROR };
  const draft = await prisma.lpKcDraft.findFirst({ where: { unitId: uid.data, unit: { module: { programId: pid.data } } }, select: { unitId: true } });
  if (!draft) return { ok: false, error: GENERIC_ERROR };
  await prisma.$transaction(async (tx) => {
    await tx.lpKcDraft.delete({ where: { unitId: draft.unitId } });
    await recordAudit(tx, { programId: pid.data, actorAuthorId: access.author.id, action: "kc_draft_saved", details: { unitId: draft.unitId, discarded: true } });
  });
  revalidatePath(`/programs/${pid.data}`, "layout");
  return { ok: true, message: "Draft discarded." };
}
