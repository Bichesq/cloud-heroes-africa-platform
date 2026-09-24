"use client";

import { useState } from "react";
import { Button, Chip, Label, ProgressBar, Radio, RadioGroup } from "@heroui/react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  LifeBuoy,
  Lock,
  PartyPopper,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { KcAttemptQuestionView, KnowledgeCheck, StudentUnitStatus, TicketContext } from "@/types";
import HelpModal from "@/components/help/HelpModal";
import type { KcClientState } from "./UnitShell";

/* Knowledge Check runner — canonical assessment pattern from the approved
 * mockup (question card, options with correct-state feedback, right Result/
 * Explanation panel), modernized per 2026-07-16 with a progress bar and a
 * "Skip" option. End states implement the failure flow: pass →
 * Competent/Verified, fail → Retake, second fail → team escalation notice.
 *
 * 2026-09-21 (plan Phase 3): the question list is no longer a static prop —
 * each attempt is started via POST .../attempts/start, which randomly draws
 * from the KC's question bank server-side and snapshots the selection
 * against a new attempt row *before* returning it here (see that route's
 * comment for why — it's what lets the submit route grade authoritatively
 * against a server-pinned set instead of trusting the client). Per-question
 * feedback still grades locally for immediacy (POC tradeoff, kept as-is:
 * the started attempt's questions ship with `correctOptionId` inline, same
 * as the old fixed list did); the submit call re-scores server-side against
 * the snapshot and its verdict is the one that moves unit status. */

type Phase = "locked" | "intro" | "starting" | "question" | "submitting" | "result" | "error";

type SubmitResponse = {
  attemptNo: number;
  correctCount: number;
  total: number;
  score: number;
  passed: boolean;
  outcome: "verified" | "retake" | "escalate";
  unitStatus: StudentUnitStatus;
  tokensAwarded: number;
};

const ORDINALS = [
  "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
];

export default function KnowledgeCheckRunner({
  kc,
  initialState,
  unlocked,
  helpContext,
  onResult,
  onExit,
}: {
  kc: KnowledgeCheck;
  initialState: KcClientState;
  unlocked: boolean;
  helpContext: TicketContext;
  onResult: (kcId: string, passed: boolean, status: StudentUnitStatus) => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(!unlocked ? "locked" : "intro");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<KcAttemptQuestionView[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const progressPct =
    questions.length === 0 ? 0 : Math.round((questionIndex / questions.length) * 100);

  /** Starts (or resumes) an attempt: draws a random question set server-side
   * and snapshots it before anything is shown here — see the route/file
   * comments above for why. */
  async function start() {
    setPhase("starting");
    setError(null);
    const res = await fetch(`/api/knowledge-checks/${kc.id}/attempts/start`, {
      method: "POST",
    });
    if (!res.ok) {
      setError(
        res.status === 409
          ? "This Knowledge Check has no questions authored yet."
          : "Couldn't start the Knowledge Check. Please try again."
      );
      setPhase("error");
      return;
    }
    const data = (await res.json()) as { attemptId: string; questions: KcAttemptQuestionView[] };
    setAttemptId(data.attemptId);
    setQuestions(data.questions);
    setQuestionIndex(0);
    setAnswers({});
    setPicked(null);
    setPhase("question");
  }

  function pick(optionId: string) {
    if (picked !== null) return; // answer is final until next question
    setPicked(optionId);
    setAnswers((prev) => ({ ...prev, [question.attemptQuestionId]: optionId }));
  }

  async function advance(skip = false) {
    const nextAnswers = skip
      ? { ...answers, [question.attemptQuestionId]: null }
      : answers;
    if (skip) setAnswers(nextAnswers);

    if (!isLastQuestion) {
      setQuestionIndex((i) => i + 1);
      setPicked(null);
      return;
    }

    // Last question — submit the attempt for authoritative scoring.
    setPhase("submitting");
    setError(null);
    const res = await fetch(`/api/knowledge-checks/${kc.id}/attempts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, answers: nextAnswers }),
    });
    if (!res.ok) {
      setPhase("question");
      setError("Couldn't submit your answers. Please try again.");
      return;
    }
    const data = (await res.json()) as SubmitResponse;
    setResult(data);
    setPhase("result");
    onResult(kc.id, data.passed, data.unitStatus);
  }

  function restart() {
    setResult(null);
    void start();
  }

  /* ---------------- locked / intro / result states ---------------- */

  if (phase === "locked") {
    return (
      <CenterState
        icon={<Lock size={36} className="text-cha-faint" />}
        title="Finish the unit content first"
        body="Knowledge Checks unlock once you've completed all the readings in this unit — work through the learning material, then come back to verify what you've learned."
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="flex flex-1 flex-col px-8 pb-6 pt-7 sm:px-10">
        <h1 className="font-display text-2xl font-extrabold">
          <span className="text-cha-ocean">Knowledge Check: </span>
          {kc.title}
        </h1>
        <div className="mt-6 max-w-xl">
          <p className="text-cha-muted">
            {kc.questionsPerAttempt} questions · pass mark{" "}
            {Math.round(kc.passThreshold * 100)}%. Passing marks this unit{" "}
            <span className="font-semibold text-cha-success">Competent / Verified</span>.
            You can skip a question and it will simply count as unanswered.
          </p>
          {initialState.passed && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-cha-success">
              <BadgeCheck size={18} />
              You&apos;ve already passed this Knowledge Check — retaking won&apos;t
              remove your verification.
            </p>
          )}
          {!initialState.passed && initialState.failRun === 1 && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-cha-warning">
              <RotateCcw size={18} />
              This is a retake. If it doesn&apos;t go your way this time, a team
              member will reach out to help.
            </p>
          )}
        </div>
        <div className="mt-8">
          <Button size="lg" onPress={() => void start()}>
            {initialState.attemptCount > 0 ? "Start retake" : "Start Knowledge Check"}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "starting") {
    return (
      <CenterState
        icon={<RotateCcw size={36} className="animate-spin text-cha-faint" />}
        title="Preparing your Knowledge Check…"
        body="Selecting a fresh set of questions."
      />
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-1 flex-col px-8 pb-6 pt-7 sm:px-10">
        <h1 className="font-display text-2xl font-extrabold">
          <span className="text-cha-ocean">Knowledge Check: </span>
          {kc.title}
        </h1>
        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-500">
            {error}
          </p>
        )}
        <div className="mt-6 flex items-center gap-3">
          <Button onPress={() => void start()}>Try again</Button>
          <Button variant="ghost" onPress={onExit}>
            Back to program
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="flex flex-1 flex-col px-8 pb-6 pt-7 sm:px-10">
        <h1 className="font-display text-2xl font-extrabold">
          <span className="text-cha-ocean">Knowledge Check: </span>
          {kc.title}
        </h1>

        <div className="mx-auto mt-10 w-full max-w-md text-center">
          {result.passed ? (
            <>
              <BadgeCheck size={48} className="mx-auto text-cha-success" />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-cha-success">
                Competent / Verified
              </h2>
              <p className="mt-2 text-cha-muted">
                You scored {result.correctCount}/{result.total} (
                {Math.round(result.score * 100)}%)
                {result.tokensAwarded > 0 && (
                  <> and earned <span className="font-bold text-cha-orange">+{result.tokensAwarded} tokens</span></>
                )}
                . This unit is now verified — nice work.
              </p>
            </>
          ) : result.outcome === "escalate" ? (
            <>
              <LifeBuoy size={48} className="mx-auto text-cha-warning" />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-cha-warning">
                Let&apos;s get you some support
              </h2>
              <p className="mt-2 text-cha-muted">
                You scored {result.correctCount}/{result.total}. That&apos;s two
                attempts that didn&apos;t go your way, so a Cloud Heroes team member
                has been notified and will reach out to help you through this
                unit. The unit stays in{" "}
                <span className="font-semibold text-cha-warning">Retake</span>.
              </p>
            </>
          ) : (
            <>
              <RotateCcw size={48} className="mx-auto text-cha-warning" />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-cha-warning">
                Not this time — unit set to Retake
              </h2>
              <p className="mt-2 text-cha-muted">
                You scored {result.correctCount}/{result.total} (
                {Math.round(result.score * 100)}%); the pass mark is{" "}
                {Math.round(kc.passThreshold * 100)}%. Review the readings and
                try again when you&apos;re ready.
              </p>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {!result.passed && <Button onPress={restart}>Try again</Button>}
            <Button variant="outline" onPress={() => setHelpOpen(true)}>
              <LifeBuoy size={16} />
              Get help
            </Button>
            <Button variant="ghost" onPress={onExit}>
              Back to program
            </Button>
          </div>
        </div>

        <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
      </div>
    );
  }

  /* ------------------------- question phase ------------------------- */

  if (!question) {
    return (
      <CenterState
        icon={<RotateCcw size={36} className="animate-spin text-cha-faint" />}
        title="Preparing your Knowledge Check…"
        body="Selecting a fresh set of questions."
      />
    );
  }

  const showFeedback = picked !== null;
  const isCorrect = picked === question.correctOptionId;

  return (
    <div className="flex flex-1 flex-col px-8 pb-6 pt-7 sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">
          <span className="text-cha-ocean">Knowledge Check: </span>
          {kc.title}
        </h1>
        <Chip color="accent" variant="primary" className="shrink-0">
          <Chip.Label>Knowledge Check</Chip.Label>
        </Chip>
      </div>

      {/* Progress bar (2026-07-16 modernization) */}
      <ProgressBar value={progressPct} size="sm" className="mt-4 w-full">
        <Label className="text-xs font-semibold text-cha-muted">
          Question {questionIndex + 1} of {questions.length}
        </Label>
        <ProgressBar.Output className="text-xs font-semibold text-cha-muted" />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>

      <div className="mt-6 flex flex-1 gap-6">
        {/* Question card */}
        <div className="min-w-0 flex-1 rounded-2xl bg-cha-surface-2/60 p-6 sm:p-8">
          <Chip color="accent" variant="primary">
            <Chip.Label>Question {ORDINALS[questionIndex] ?? questionIndex + 1}</Chip.Label>
          </Chip>

          <p className="mt-5 font-display text-xl font-bold leading-snug">
            {question.prompt}
          </p>

          <RadioGroup
            aria-label="Answer options"
            value={picked}
            onChange={pick}
            isReadOnly={showFeedback}
            className="mt-6 flex flex-col gap-2.5"
          >
            {question.options.map((option, oi) => {
              const chosen = picked === option.id;
              const correct = option.id === question.correctOptionId;
              const showAsCorrect = showFeedback && correct;
              const showAsWrong = showFeedback && chosen && !correct;
              return (
                <Radio
                  key={option.id}
                  value={option.id}
                  className={`rounded-xl border-2 bg-cha-surface px-4 py-3 text-sm font-medium transition-colors ${
                    showAsCorrect
                      ? "border-cha-success"
                      : showAsWrong
                        ? "border-cha-danger"
                        : "border-cha-border hover:border-cha-faint"
                  } ${showFeedback && !chosen && !correct ? "opacity-60" : ""}`}
                >
                  <Radio.Content className="flex items-center gap-3">
                    {showAsCorrect ? (
                      <CheckCircle2 size={18} className="shrink-0 fill-cha-success text-white" />
                    ) : showAsWrong ? (
                      <XCircle size={18} className="shrink-0 fill-cha-danger text-white" />
                    ) : (
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                    )}
                    {String.fromCharCode(65 + oi)}.) {option.label}
                  </Radio.Content>
                </Radio>
              );
            })}
          </RadioGroup>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            {!showFeedback && (
              <Button
                variant="secondary"
                isDisabled={phase === "submitting"}
                onPress={() => advance(true)}
              >
                Skip
                <ArrowRight size={15} />
              </Button>
            )}
            {showFeedback && (
              <Button isPending={phase === "submitting"} onPress={() => advance()}>
                {phase === "submitting"
                  ? "Submitting…"
                  : isLastQuestion
                    ? "Finish Knowledge Check"
                    : "Go to Next Question"}
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Result / Explanation panel (mockup right column) */}
        <div className="hidden w-[260px] shrink-0 lg:block">
          {showFeedback ? (
            <div className="rounded-2xl bg-cha-surface-2/60 p-5">
              {/* Figma "Knowledge Check done" frame: confetti on a correct answer */}
              {isCorrect && (
                <PartyPopper size={40} aria-hidden className="mb-3 text-cha-orange" />
              )}
              <h3
                className={`font-display text-lg font-extrabold ${
                  isCorrect ? "text-cha-success" : "text-cha-danger"
                }`}
              >
                Result: {isCorrect ? "Correct!" : "Incorrect"}
              </h3>
              <p className="mt-3 text-[13px] font-semibold">Explanation</p>
              <p className="mt-2 text-[13px] leading-relaxed text-cha-muted">
                {question.explanation}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-cha-border p-5 text-[13px] text-cha-faint">
              Pick an answer to see whether it&apos;s correct and why.
            </div>
          )}

          <Button fullWidth variant="outline" className="mt-4" onPress={() => setHelpOpen(true)}>
            <LifeBuoy size={15} />
            Stuck? Get help
          </Button>
        </div>
      </div>

      <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
    </div>
  );
}

function CenterState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-10 py-16 text-center">
      {icon}
      <h2 className="mt-4 font-display text-xl font-extrabold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-cha-muted">{body}</p>
    </div>
  );
}
