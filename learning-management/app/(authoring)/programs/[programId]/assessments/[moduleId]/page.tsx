import { notFound } from "next/navigation";
import AssessmentEditorShell from "@/components/assessment-editor/AssessmentEditor";
import { fromBankQuestion, type AssessmentDraftQuestion, type BankQuestion, type Difficulty } from "@/lib/assessment-editor";
import { displayName, formatUpdated } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireProgramPage } from "@/lib/program-access";
import { moduleId as moduleIdSchema } from "@/lib/validation";

/* Module Assessment Configuration (plan §11). One assessment per module.
 * Shows the pending draft (draft / in review / returned) when there is one,
 * otherwise the published assessment's active questions in author order.
 * Editors save and submit; Reviewers / Owners / Directors (not the submitter)
 * approve or return it. Everyone with a role can view. */

type Person = { name: string; email: string } | null;
const who = (p: Person) => (p ? ` by ${displayName(p)}` : "");

export default async function ModuleAssessmentPage({ params }: { params: Promise<{ programId: string; moduleId: string }> }) {
  const { programId, moduleId } = await params;
  const { author, can } = await requireProgramPage(programId);
  if (!moduleIdSchema.safeParse(moduleId).success) notFound();

  const mod = await prisma.lpModule.findFirst({
    where: { id: moduleId, programId },
    select: {
      id: true,
      title: true,
      program: {
        select: {
          title: true,
          modules: {
            orderBy: [{ order: "asc" }, { id: "asc" }],
            select: { id: true, title: true, _count: { select: { standaloneAssessments: true } } },
          },
        },
      },
      units: {
        orderBy: [{ order: "asc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
          topics: { where: { order: null }, orderBy: { name: "asc" }, select: { id: true, name: true } },
          knowledgeChecks: {
            select: {
              questionBank: {
                where: { retiredAt: null },
                orderBy: [{ position: "asc" }, { id: "asc" }],
                select: { id: true, prompt: true, options: true, correctOptionId: true, explanation: true, pointsPossible: true },
              },
            },
          },
        },
      },
      standaloneAssessments: {
        take: 1,
        select: {
          title: true,
          description: true,
          passThreshold: true,
          maxAttempts: true,
          timeLimitSeconds: true,
          difficultyMix: true,
          version: true,
          questionBankItems: {
            where: { retiredAt: null },
            orderBy: [{ position: "asc" }, { id: "asc" }],
            select: { id: true, type: true, difficulty: true, prompt: true, options: true, correctOptionIds: true, explanation: true, pointsPossible: true, topicId: true },
          },
        },
      },
      assessmentDraft: {
        select: {
          status: true,
          title: true,
          description: true,
          passThreshold: true,
          maxAttempts: true,
          timeLimitSeconds: true,
          difficultyMix: true,
          questions: true,
          submittedById: true,
          submittedAt: true,
          reviewComment: true,
          reviewedAt: true,
          updatedAt: true,
          submittedBy: { select: { name: true, email: true } },
          reviewedBy: { select: { name: true, email: true } },
          updatedBy: { select: { name: true, email: true } },
        },
      },
    },
  });
  if (!mod) notFound();

  const moduleIndex = mod.program.modules.findIndex((m) => m.id === mod.id);
  const live = mod.standaloneAssessments[0] ?? null;
  const d = mod.assessmentDraft;
  const units = mod.units.map((u, i) => ({ id: u.id, label: `Unit ${moduleIndex + 1}.${i + 1}: ${u.title}` }));
  const areas = mod.units.flatMap((u) => u.topics.map((t) => ({ id: t.id, name: t.name, unitId: u.id })));
  const mixOf = (raw: unknown): Record<Difficulty, number> => {
    const m = (raw ?? {}) as Partial<Record<Difficulty, number>>;
    return { easy: Number(m.easy ?? 0), medium: Number(m.medium ?? 0), difficult: Number(m.difficult ?? 0) };
  };

  const initial = d
    ? {
        title: d.title,
        description: d.description,
        passPercent: Math.round(Number(d.passThreshold) * 100),
        maxAttempts: d.maxAttempts,
        timeLimitMinutes: d.timeLimitSeconds === null ? null : Math.round(d.timeLimitSeconds / 60),
        mix: mixOf(d.difficultyMix),
        questions: d.questions as unknown as AssessmentDraftQuestion[],
      }
    : live
      ? {
          title: live.title,
          description: live.description,
          passPercent: Math.round(Number(live.passThreshold) * 100),
          maxAttempts: live.maxAttempts,
          timeLimitMinutes: live.timeLimitSeconds === null ? null : Math.round(live.timeLimitSeconds / 60),
          mix: mixOf(live.difficultyMix),
          questions: live.questionBankItems.map((q) =>
            fromBankQuestion(q.id, {
              type: q.type as BankQuestion["type"],
              difficulty: q.difficulty as Difficulty,
              prompt: q.prompt,
              options: q.options as BankQuestion["options"],
              correctOptionIds: q.correctOptionIds as string[],
              explanation: q.explanation,
              points: Number(q.pointsPossible),
              topicId: q.topicId,
            }),
          ),
        }
      : {
          title: `Module ${moduleIndex + 1} Assessment`,
          description: "",
          passPercent: 75,
          maxAttempts: 3,
          timeLimitMinutes: 45,
          mix: { easy: 0, medium: 0, difficult: 0 },
          questions: [],
        };

  return (
    <div className="max-w-[1096px]">
      <header>
        <p className="text-xs font-bold tracking-wide text-cha-faint uppercase">{mod.program.title}</p>
        <h1 className="mt-1 font-display text-2xl font-extrabold">Module Assessment Configuration</h1>
        <p className="mt-1.5 text-sm text-cha-muted">
          Setup end-of-module grading structures, passing scores, limits, and question weighting.
        </p>
      </header>
      <AssessmentEditorShell
        version={`${live?.version ?? 0}:${d?.status ?? "none"}:${d?.updatedAt.getTime() ?? 0}`}
        programId={programId}
        moduleId={mod.id}
        modules={mod.program.modules.map((m, i) => ({ id: m.id, label: `Module ${i + 1}: ${m.title}`, hasAssessment: m._count.standaloneAssessments > 0 }))}
        units={units}
        areas={areas}
        importable={mod.units.map((u, i) => ({
          unitId: u.id,
          unitLabel: units[i].label,
          areaId: u.topics[0]?.id ?? null,
          questions: (u.knowledgeChecks[0]?.questionBank ?? []).map((q) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options as { id: string; label: string }[],
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
            points: Number(q.pointsPossible),
          })),
        }))}
        canEdit={can.editStructure}
        canReview={can.reviewAssessments}
        currentAuthorId={author.id}
        published={live ? { version: live.version } : null}
        draft={
          d
            ? {
                status: d.status,
                submittedById: d.submittedById,
                submittedNote: d.submittedAt ? `Submitted ${formatUpdated(d.submittedAt)}${who(d.submittedBy)}.` : null,
                reviewComment: d.reviewComment,
                reviewedNote: d.reviewedAt ? `${formatUpdated(d.reviewedAt)}${who(d.reviewedBy)}` : null,
                savedNote: `Saved ${formatUpdated(d.updatedAt)}${who(d.updatedBy)}.`,
              }
            : null
        }
        initial={initial}
      />
    </div>
  );
}
