"use client";

import { Button, Card, Chip, Label, ProgressBar, ProgressCircle } from "@heroui/react";
import { MessageSquareWarning, RotateCcw } from "lucide-react";
import type { SubmitResult, TopicBreakdown } from "./types";

/* Figma "assessment-end-confirmation-performance-review": "Assessment
 * Complete!" with a score ring + Passed chip, four stat tiles (Total /
 * Correct / Incorrect / Time Taken) and "Performance by Topic" bars, then
 * View Detailed Feedback / Return to Course. The fail state keeps the same
 * layout with honest copy, plus Retake (subject to the cooldown). */

export default function ResultsStage({
  title,
  result,
  topics,
  timeTaken,
  canRetake,
  pendingReports,
  onViewFeedback,
  onRetake,
  onReport,
  onReturn,
}: {
  title: string;
  result: SubmitResult;
  topics: TopicBreakdown[];
  timeTaken: string;
  canRetake: boolean;
  pendingReports: number;
  onViewFeedback: () => void;
  onRetake: () => void;
  onReport: () => void;
  onReturn: () => void;
}) {
  const scorePct = Math.round(result.score * 100);
  const correct = result.review
    ? result.review.filter((r) => r.pointsEarned >= r.pointsPossible).length
    : null;
  const incorrect = correct !== null ? result.totalQuestions - correct : null;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <Card>
        <Card.Content className="flex flex-col items-center gap-8 py-10 text-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold">Assessment Complete!</h2>
            <p className="mt-2 text-cha-muted">
              {result.passed
                ? `Good Job! You've successfully completed the ${title} assessment.`
                : `You've completed the ${title} assessment, but didn't reach the pass mark this time.`}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <ProgressCircle
              aria-label="Assessment score"
              value={scorePct}
              size="lg"
              color={result.passed ? "success" : "danger"}
              className="size-32"
            >
              <ProgressCircle.Track>
                <ProgressCircle.TrackCircle />
                <ProgressCircle.FillCircle />
              </ProgressCircle.Track>
            </ProgressCircle>
            <p className="font-display text-3xl font-extrabold">{scorePct}%</p>
            <Chip color={result.passed ? "success" : "danger"} variant="soft">
              <Chip.Label>{result.passed ? "Passed" : "Not passed"}</Chip.Label>
            </Chip>
          </div>

          <dl className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Total Questions" value={String(result.totalQuestions)} />
            {correct !== null && (
              <StatTile label="Correct Answers" value={String(correct)} className="text-cha-success" />
            )}
            {incorrect !== null && (
              <StatTile label="Incorrect Answers" value={String(incorrect)} className="text-cha-danger" />
            )}
            <StatTile label="Time Taken" value={timeTaken} />
          </dl>

          {topics.length > 0 && (
            <section className="w-full text-left">
              <h3 className="font-display text-lg font-extrabold">Performance by Topic</h3>
              <ul className="mt-3 flex flex-col gap-4">
                {topics.map((t) => (
                  <li key={t.name}>
                    <ProgressBar
                      value={t.pct}
                      size="sm"
                      color={t.pct >= 75 ? "success" : t.pct >= 50 ? "warning" : "danger"}
                      className="w-full"
                      valueLabel={`${t.pct}% (${t.correct}/${t.total} Correct)`}
                    >
                      <Label className="font-semibold">{t.name}</Label>
                      <ProgressBar.Output className="text-cha-muted" />
                      <ProgressBar.Track>
                        <ProgressBar.Fill />
                      </ProgressBar.Track>
                    </ProgressBar>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {result.review && <Button onPress={onViewFeedback}>View Detailed Feedback</Button>}
            {!result.passed && (
              <Button variant="outline" isDisabled={!canRetake} onPress={onRetake}>
                <RotateCcw size={15} />
                Retake Assessment
              </Button>
            )}
            {pendingReports > 0 && (
              <Button variant="outline" onPress={onReport}>
                <MessageSquareWarning size={15} />
                Report question issues ({pendingReports})
              </Button>
            )}
            <Button variant="ghost" onPress={onReturn}>
              Return to Course
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

function StatTile({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-2xl bg-cha-surface-2/70 px-4 py-4">
      <dt className="text-xs font-semibold text-cha-muted">{label}</dt>
      <dd className={`mt-1 font-display text-2xl font-extrabold ${className ?? "text-cha-ink"}`}>
        {value}
      </dd>
    </div>
  );
}
