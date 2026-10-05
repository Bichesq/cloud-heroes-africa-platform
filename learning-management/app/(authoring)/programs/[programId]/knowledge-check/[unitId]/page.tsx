import { notFound } from "next/navigation";
import KcEditorShell from "@/components/kc-editor/KcEditor";
import { displayName, formatUpdated } from "@/lib/format";
import { fromBankQuestion, type BankQuestion, type KcDraftQuestion } from "@/lib/kc-editor";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";
import { unitId as unitIdSchema } from "@/lib/validation";

/* Knowledge Check Editor (plan §10) — Figma "Knowledge Check Editor".
 * One KC per unit. Shows the pending draft when there is one, otherwise the
 * published KC's active (non-retired) questions in author order. Anyone with
 * a role can view; Owner / Director / Editor can save and publish. */

export default async function KnowledgeCheckPage({ params }: { params: Promise<{ programId: string; unitId: string }> }) {
  const { programId, unitId } = await params;
  const { can } = await requireProgramPage(programId);
  if (!unitIdSchema.safeParse(unitId).success) notFound();

  const unit = await prisma.lpUnit.findFirst({
    where: { id: unitId, module: { programId } },
    select: {
      id: true,
      title: true,
      knowledgeChecks: {
        select: {
          title: true,
          passThreshold: true,
          questionsPerAttempt: true,
          version: true,
          questionBank: {
            where: { retiredAt: null },
            orderBy: [{ position: "asc" }, { id: "asc" }],
            select: { id: true, prompt: true, options: true, correctOptionId: true, explanation: true, pointsPossible: true },
          },
        },
      },
      kcDraft: { select: { title: true, passThreshold: true, questionsPerAttempt: true, questions: true, updatedAt: true, updatedBy: { select: { name: true, email: true } } } },
      module: {
        select: {
          program: {
            select: {
              title: true,
              modules: {
                orderBy: [{ order: "asc" }, { id: "asc" }],
                select: {
                  units: {
                    orderBy: [{ order: "asc" }, { id: "asc" }],
                    select: { id: true, title: true, _count: { select: { knowledgeChecks: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!unit) notFound();

  const kc = unit.knowledgeChecks[0] ?? null;
  const draft = unit.kcDraft;
  const units = unit.module.program.modules.flatMap((m, mi) =>
    m.units.map((u, ui) => ({ id: u.id, label: `Unit ${mi + 1}.${ui + 1}: ${u.title}`, hasKc: u._count.knowledgeChecks > 0 })),
  );

  const initial = draft
    ? {
        title: draft.title,
        passPercent: Math.round(Number(draft.passThreshold) * 100),
        questionsPerAttempt: draft.questionsPerAttempt,
        questions: draft.questions as unknown as KcDraftQuestion[],
      }
    : kc
      ? {
          title: kc.title,
          passPercent: Math.round(Number(kc.passThreshold) * 100),
          questionsPerAttempt: kc.questionsPerAttempt,
          questions: kc.questionBank.map((q) =>
            fromBankQuestion(q.id, {
              prompt: q.prompt,
              options: q.options as BankQuestion["options"],
              correctOptionId: q.correctOptionId,
              explanation: q.explanation,
              points: Number(q.pointsPossible),
            }),
          ),
        }
      : { title: unit.title, passPercent: 70, questionsPerAttempt: 1, questions: [] };

  return (
    <div className="max-w-[1096px]">
      <header>
        <p className="text-xs font-bold tracking-wide text-cha-faint uppercase">{unit.module.program.title}</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">Knowledge Check Editor</h1>
        <p className="mt-1.5 text-sm text-cha-muted">
          Design quizzes, formulate questions, and define correct key values for module units.
        </p>
      </header>
      <KcEditorShell
        version={`${kc?.version ?? 0}:${draft?.updatedAt.getTime() ?? "none"}`}
        programId={programId}
        unitId={unit.id}
        units={units}
        canEdit={can.editStructure}
        published={kc ? { version: kc.version } : null}
        hasDraft={draft !== null}
        draftNote={draft ? `saved ${formatUpdated(draft.updatedAt)}${draft.updatedBy ? ` by ${displayName(draft.updatedBy)}` : ""}` : null}
        initial={initial}
      />
    </div>
  );
}
