"use client";

import { Button, Card, Chip, Label, TextArea } from "@heroui/react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { LetterTile } from "./QuestionStage";
import { optionLetter, type AttemptQuestion } from "./types";

/* Figma "assessment-end-confirmation-v2" ("Reported Question Feedback"):
 * after submitting, each question the learner marked with "Report Question"
 * is shown read-only with a textarea for the issue, "Question i of n
 * reported", then Skip feedback submission / Submit All Reports. The server
 * route validates and length-limits every report (reports/route.ts, zod,
 * 1–2000 chars); maxLength here just mirrors that limit for the learner. */

const MAX_DETAIL = 2000;

export default function ReportingStage({
  reported,
  total,
  reportIndex,
  details,
  submitted,
  submitting,
  error,
  onDetailChange,
  onIndexChange,
  onSkip,
  onSubmit,
  onDone,
}: {
  reported: AttemptQuestion[];
  total: number;
  reportIndex: number;
  details: Record<string, string>;
  submitted: boolean;
  submitting: boolean;
  error: string | null;
  onDetailChange: (attemptQuestionId: string, detail: string) => void;
  onIndexChange: (index: number) => void;
  onSkip: () => void;
  onSubmit: () => void;
  onDone: () => void;
}) {
  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Card>
          <Card.Content className="flex flex-col items-center gap-3 py-12 text-center">
            <CheckCircle2 size={40} className="text-cha-success" />
            <h2 className="font-display text-2xl font-extrabold">Thanks — reports submitted</h2>
            <p className="text-cha-muted">
              Each report is vetted by our systems administrators.
            </p>
            <Button className="mt-3" onPress={onDone}>
              View Assessment Results
            </Button>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const question = reported[reportIndex];
  if (!question) return null;
  const detail = details[question.attemptQuestionId] ?? "";
  const anyDetail = reported.some((q) => (details[q.attemptQuestionId] ?? "").trim().length > 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h2 className="font-display text-3xl font-extrabold">Reported Question Feedback</h2>
      <p className="mt-2 max-w-2xl text-cha-muted">
        Provide feedback on specific problems encountered during your assessment. Each report is
        vetted by our systems administrators.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header className="gap-2">
            <Chip color="accent" variant="soft" size="sm" className="self-start">
              <Chip.Label>
                Question {question.orderIndex + 1} of {total}
              </Chip.Label>
            </Chip>
            <Card.Description className="font-semibold">Reported Question</Card.Description>
            <Card.Title className="font-display text-lg font-bold leading-snug">
              {question.prompt}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul className="flex flex-col gap-2 text-sm">
              {question.options.map((o, oi) => (
                <li key={o.id} className="flex items-center gap-3 rounded-xl border border-cha-border px-3 py-2">
                  <LetterTile letter={optionLetter(oi)} active={question.selectedOptionIds.includes(o.id)} />
                  {o.label}
                </li>
              ))}
            </ul>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="font-display text-lg font-extrabold">Report Issue Details</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-2">
            <Label htmlFor={`report-${question.attemptQuestionId}`}>
              Please describe the issue with this question:
            </Label>
            <TextArea
              id={`report-${question.attemptQuestionId}`}
              rows={7}
              maxLength={MAX_DETAIL}
              value={detail}
              onChange={(e) => onDetailChange(question.attemptQuestionId, e.target.value)}
              placeholder="Describe the issue you encountered with this question..."
              className="w-full"
            />
            <p className="self-end text-[11px] text-cha-faint">
              {detail.length}/{MAX_DETAIL}
            </p>
          </Card.Content>
        </Card>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-cha-danger">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            isIconOnly
            aria-label="Previous reported question"
            isDisabled={reportIndex === 0}
            onPress={() => onIndexChange(reportIndex - 1)}
          >
            <ArrowLeft size={15} />
          </Button>
          <span className="text-sm font-semibold text-cha-muted">
            Question {reportIndex + 1} of {reported.length} reported
          </span>
          <Button
            size="sm"
            variant="outline"
            isIconOnly
            aria-label="Next reported question"
            isDisabled={reportIndex === reported.length - 1}
            onPress={() => onIndexChange(reportIndex + 1)}
          >
            <ArrowRight size={15} />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" isDisabled={submitting} onPress={onSkip}>
            Skip feedback submission
          </Button>
          <Button isPending={submitting} isDisabled={!anyDetail} onPress={onSubmit}>
            Submit All Reports
          </Button>
        </div>
      </div>
    </div>
  );
}
