"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Chip, ProgressCircle } from "@heroui/react";
import { ArrowRight, Gauge, LifeBuoy, RotateCcw } from "lucide-react";
import type { KcOption, ReadinessLevel, TicketContext } from "@/types";
import type { ReadinessSummary } from "@/lib/lp-utils";
import HelpModal from "@/components/help/HelpModal";
import AssessmentHeader from "@/app/(learner)/programs/[programId]/assessments/[assessmentId]/components/AssessmentHeader";
import QuestionStage from "@/app/(learner)/programs/[programId]/assessments/[assessmentId]/components/QuestionStage";
import QuestionPalette from "@/app/(learner)/programs/[programId]/assessments/[assessmentId]/components/QuestionPalette";
import SubmitReviewModal from "@/app/(learner)/programs/[programId]/assessments/[assessmentId]/components/SubmitReviewModal";
import type { AttemptQuestion } from "@/app/(learner)/programs/[programId]/assessments/[assessmentId]/components/types";

/* Exam Readiness runner. Unlike Knowledge Checks it gives NO per-question
 * feedback — readiness measures where you stand against the real exam, it
 * doesn't teach — and it never touches unit status or points. Result =
 * score + categorical level (config.levels), plus attempt history so
 * students can watch their trend.
 *
 * 2026-09-24 (plan step 5): no Figma frames of its own, so it's rebuilt from
 * the step-4 Assessment View components — header, question stage, palette,
 * submit-review modal — on HeroUI v3. Navigation is now free (Previous /
 * palette jumps) instead of forward-only; unanswered questions are still
 * submitted as null. Flags are a local review aid only — the readiness API
 * has no flag or report fields, so nothing extra is sent. The submit call is
 * unchanged: POST /api/readiness/:id/results { answers }. */

/** What the client receives — the page strips correctOptionId/explanation
 * (the server grades from its own config; see page.tsx). */
export type ReadinessQuestionView = { id: string; prompt: string; options: KcOption[] };

type Phase = "intro" | "question" | "result";

type SubmitResponse = {
  score: number;
  level: string | null;
  correctCount: number;
  total: number;
};

const toStageQuestion = (
  q: ReadinessQuestionView,
  i: number,
  selected: string | null,
  flagged: boolean
): AttemptQuestion => ({
  attemptQuestionId: q.id,
  orderIndex: i,
  id: q.id,
  type: "single_choice",
  prompt: q.prompt,
  options: q.options,
  pointsPossible: 1,
  selectedOptionIds: selected ? [selected] : [],
  flagged,
});

export default function ReadinessRunner({
  assessmentId,
  programId,
  title,
  description,
  questions,
  levels,
  summary,
  helpContext,
}: {
  assessmentId: string;
  programId: string;
  title: string;
  description: string;
  questions: ReadinessQuestionView[];
  levels: ReadinessLevel[];
  summary: ReadinessSummary;
  helpContext: TicketContext;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const programHref = `/programs/${programId}`;
  const sortedLevels = [...levels].sort((a, b) => a.min - b.min);
  const answeredCount = questions.filter((q) => answers[q.id]).length;

  function start() {
    setAnswers({});
    setFlags(new Set());
    setIndex(0);
    setResult(null);
    setError(null);
    setPhase("question");
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    // Every question is sent; unanswered ones as null (same shape as before).
    const payload = Object.fromEntries(questions.map((q) => [q.id, answers[q.id] ?? null]));
    const res = await fetch(`/api/readiness/${assessmentId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Couldn't submit your answers. Please try again.");
      return;
    }
    setResult((await res.json()) as SubmitResponse);
    setReviewOpen(false);
    setPhase("result");
  }

  function exit() {
    if (phase === "question") setPhase("intro");
    else router.push(programHref);
  }

  const question = questions[index];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AssessmentHeader
        title={title}
        kind="Exam Readiness"
        status={phase === "intro" ? null : phase === "result" ? "Ended" : "Ongoing"}
        exitLabel={phase === "intro" ? "Back to Program" : "Exit"}
        onExit={exit}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {phase === "intro" && (
          <div className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10 lg:grid-cols-[1fr_340px]">
            <section>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cha-blue/10 text-cha-blue">
                <Gauge size={28} />
              </span>
              <p className="mt-5 font-display text-lg font-bold text-cha-orange">Exam Readiness:</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight">{title}</h2>
              {description && <p className="mt-3 max-w-xl text-cha-muted">{description}</p>}

              {summary.latest && (
                <p className="mt-4 text-sm text-cha-muted">
                  Your latest result:{" "}
                  <span className="font-bold text-cha-ink">
                    {summary.latest.level ?? `${Math.round(summary.latest.score * 100)}%`}
                  </span>{" "}
                  ({Math.round(summary.latest.score * 100)}%) across {summary.history.length} attempt
                  {summary.history.length === 1 ? "" : "s"}.
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" isDisabled={questions.length === 0} onPress={start}>
                  {summary.latest ? "Retake Readiness Assessment" : "Start Readiness Assessment"}
                  <ArrowRight size={16} />
                </Button>
                <Button size="lg" variant="outline" onPress={() => setHelpOpen(true)}>
                  <LifeBuoy size={16} />
                  Report an Issue
                </Button>
              </div>
            </section>

            <Card>
              <Card.Header>
                <Card.Title className="font-display text-lg font-extrabold">Instructions:</Card.Title>
                <Card.Description>
                  {questions.length} exam-style questions. There&apos;s no feedback until the end —
                  your result is a readiness level, not a pass/fail.
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <p className="text-[13px] font-bold">Readiness levels</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {sortedLevels.map((l) => (
                    <li key={l.label}>
                      <Chip size="sm" variant="soft">
                        <Chip.Label>
                          {l.label} ≥ {Math.round(l.min * 100)}%
                        </Chip.Label>
                      </Chip>
                    </li>
                  ))}
                </ul>
              </Card.Content>
            </Card>
          </div>
        )}

        {phase === "question" && question && (
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-start">
            <QuestionStage
              question={toStageQuestion(question, index, answers[question.id] ?? null, flags.has(question.id))}
              index={index}
              total={questions.length}
              onSelect={(ids) => setAnswers((prev) => ({ ...prev, [question.id]: ids[0] ?? null }))}
              onToggleFlag={() =>
                setFlags((prev) => {
                  const next = new Set(prev);
                  if (next.has(question.id)) next.delete(question.id);
                  else next.add(question.id);
                  return next;
                })
              }
              onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
              onNext={() => {
                if (index === questions.length - 1) {
                  setError(null);
                  setReviewOpen(true);
                } else setIndex((i) => i + 1);
              }}
            />
            <QuestionPalette
              states={questions.map((q) => ({ answered: Boolean(answers[q.id]), flagged: flags.has(q.id) }))}
              currentIndex={index}
              onJump={setIndex}
            />
          </div>
        )}

        {phase === "result" && result && (
          <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <Card>
              <Card.Content className="flex flex-col items-center gap-6 py-10 text-center">
                <h2 className="font-display text-3xl font-extrabold">Readiness Check Complete!</h2>
                <ProgressCircle
                  aria-label="Readiness score"
                  value={Math.round(result.score * 100)}
                  size="lg"
                  className="size-32"
                >
                  <ProgressCircle.Track>
                    <ProgressCircle.TrackCircle />
                    <ProgressCircle.FillCircle />
                  </ProgressCircle.Track>
                </ProgressCircle>
                <div>
                  <p className="font-display text-3xl font-extrabold">
                    {result.level ?? `${Math.round(result.score * 100)}%`}
                  </p>
                  <p className="mt-2 text-cha-muted">
                    You answered {result.correctCount} of {result.total} correctly (
                    {Math.round(result.score * 100)}%). This result now feeds your Exam Readiness
                    widget on the Student Hub dashboard.
                  </p>
                </div>

                {summary.history.length > 0 && (
                  <section className="w-full max-w-sm text-left">
                    <h3 className="text-[13px] font-bold">Previous attempts</h3>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {summary.history
                        .slice(-5)
                        .reverse()
                        .map((h, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-xl bg-cha-surface-2/70 px-4 py-2 text-sm"
                          >
                            <span className="font-semibold">{h.level ?? `${Math.round(h.score * 100)}%`}</span>
                            <span className="text-xs text-cha-faint">
                              {Math.round(h.score * 100)}% · {h.submittedAt.slice(0, 10)}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </section>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button onPress={() => router.push(programHref)}>Back to Program</Button>
                  <Button variant="outline" onPress={start}>
                    <RotateCcw size={15} />
                    Retake
                  </Button>
                  <Button variant="ghost" onPress={() => setHelpOpen(true)}>
                    <LifeBuoy size={15} />
                    Get help
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}
      </div>

      <SubmitReviewModal
        isOpen={reviewOpen}
        onOpenChange={setReviewOpen}
        answered={answeredCount}
        flagged={flags.size}
        unanswered={questions.length - answeredCount}
        submitting={submitting}
        error={error}
        onReview={() => {
          const target = questions.findIndex((q) => flags.has(q.id) || !answers[q.id]);
          setIndex(target === -1 ? 0 : target);
          setReviewOpen(false);
        }}
        onSubmit={submit}
      />

      <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
    </div>
  );
}
