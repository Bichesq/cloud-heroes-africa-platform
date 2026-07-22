"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Circle,
  LifeBuoy,
  Lock,
  RotateCcw,
  XCircle,
} from "lucide-react";
import type { KnowledgeCheck, StudentUnitStatus, TicketContext } from "@/types";
import HelpModal from "@/components/help/HelpModal";
import type { KcClientState } from "./UnitShell";

/* Knowledge Check runner — canonical assessment pattern from the approved
 * mockup (question card, options with correct-state feedback, right Result/
 * Explanation panel), modernized per 2026-07-16 with a progress bar and a
 * "Skip" option. End states implement the failure flow: pass →
 * Competent/Verified, fail → Retake, second fail → team escalation notice.
 *
 * Per-question feedback grades locally for immediacy (POC tradeoff: question
 * data includes the key); the attempts API re-scores server-side and its
 * verdict is the one that moves unit status. */

type Phase = "locked" | "intro" | "question" | "submitting" | "result";

type SubmitResponse = {
  attemptNo: number;
  correctCount: number;
  total: number;
  score: number;
  passed: boolean;
  outcome: "verified" | "retake" | "escalate";
  unitStatus: StudentUnitStatus;
  pointsAwarded: number;
};

const ORDINALS = [
  "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
];

export default function KnowledgeCheckRunner({
  kcItemId,
  kc,
  initialState,
  unlocked,
  helpContext,
  onResult,
  onExit,
}: {
  kcItemId: string;
  kc: KnowledgeCheck;
  initialState: KcClientState;
  unlocked: boolean;
  unitStatus: StudentUnitStatus | null;
  helpContext: TicketContext;
  onResult: (kcItemId: string, passed: boolean, status: StudentUnitStatus) => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(!unlocked ? "locked" : "intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = kc.questions[questionIndex];
  const isLastQuestion = questionIndex === kc.questions.length - 1;
  const progressPct = Math.round((questionIndex / kc.questions.length) * 100);

  function pick(optionId: string) {
    if (picked !== null) return; // answer is final until next question
    setPicked(optionId);
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  }

  async function advance(skip = false) {
    const nextAnswers = skip
      ? { ...answers, [question.id]: null }
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
      body: JSON.stringify({ answers: nextAnswers }),
    });
    if (!res.ok) {
      setPhase("question");
      setError("Couldn't submit your answers. Please try again.");
      return;
    }
    const data = (await res.json()) as SubmitResponse;
    setResult(data);
    setPhase("result");
    onResult(kcItemId, data.passed, data.unitStatus);
  }

  function restart() {
    setQuestionIndex(0);
    setAnswers({});
    setPicked(null);
    setResult(null);
    setPhase("question");
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
            {kc.questions.length} questions · pass mark{" "}
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
          <button
            onClick={() => setPhase("question")}
            className="flex items-center gap-2 rounded-full bg-cha-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cha-orange-strong"
          >
            {initialState.attemptCount > 0 ? "Start retake" : "Start Knowledge Check"}
            <ArrowRight size={16} />
          </button>
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
                {result.pointsAwarded > 0 && (
                  <> and earned <span className="font-bold text-cha-orange">+{result.pointsAwarded} points</span></>
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
            {!result.passed && (
              <button
                onClick={restart}
                className="rounded-full bg-cha-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cha-orange-strong"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-2 rounded-full border border-cha-border bg-cha-surface px-6 py-3 text-sm font-bold text-cha-ink transition-colors hover:bg-cha-surface-2"
            >
              <LifeBuoy size={16} />
              Get help
            </button>
            <button
              onClick={onExit}
              className="rounded-full px-6 py-3 text-sm font-semibold text-cha-muted transition-colors hover:bg-cha-surface-2"
            >
              Back to program
            </button>
          </div>
        </div>

        <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
      </div>
    );
  }

  /* ------------------------- question phase ------------------------- */

  const showFeedback = picked !== null;
  const isCorrect = picked === question.correctOptionId;

  return (
    <div className="flex flex-1 flex-col px-8 pb-6 pt-7 sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">
          <span className="text-cha-ocean">Knowledge Check: </span>
          {kc.title}
        </h1>
        <span className="shrink-0 rounded-full bg-cha-orange px-4 py-1.5 text-xs font-bold text-white">
          Knowledge Check
        </span>
      </div>

      {/* Progress bar (2026-07-16 modernization) */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-cha-muted">
          <span>
            Question {questionIndex + 1} of {kc.questions.length}
          </span>
          <span>{progressPct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cha-surface-2">
          <div
            className="h-full rounded-full bg-cha-orange transition-all"
            style={{ width: `${Math.max(progressPct, 3)}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-1 gap-6">
        {/* Question card */}
        <div className="min-w-0 flex-1 rounded-2xl bg-cha-surface-2/60 p-6 sm:p-8">
          <span className="inline-block rounded-full bg-cha-orange px-4 py-1.5 text-xs font-bold text-white">
            Question {ORDINALS[questionIndex] ?? questionIndex + 1}
          </span>

          <p className="mt-5 font-display text-xl font-bold leading-snug">
            {question.prompt}
          </p>

          <div className="mt-6 flex flex-col gap-2.5" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, oi) => {
              const chosen = picked === option.id;
              const correct = option.id === question.correctOptionId;
              const showAsCorrect = showFeedback && correct;
              const showAsWrong = showFeedback && chosen && !correct;
              return (
                <button
                  key={option.id}
                  role="radio"
                  aria-checked={chosen}
                  disabled={showFeedback}
                  onClick={() => pick(option.id)}
                  className={`flex items-center gap-3 rounded-xl border-2 bg-cha-surface px-4 py-3 text-left text-sm font-medium transition-colors ${
                    showAsCorrect
                      ? "border-cha-success"
                      : showAsWrong
                        ? "border-cha-danger"
                        : chosen
                          ? "border-cha-blue"
                          : "border-cha-border hover:border-cha-faint"
                  } ${showFeedback && !chosen && !correct ? "opacity-60" : ""}`}
                >
                  {showAsCorrect ? (
                    <CheckCircle2 size={18} className="shrink-0 fill-cha-success text-white" />
                  ) : showAsWrong ? (
                    <XCircle size={18} className="shrink-0 fill-cha-danger text-white" />
                  ) : (
                    <Circle size={17} className="shrink-0 text-cha-faint" />
                  )}
                  <span>
                    {String.fromCharCode(65 + oi)}.) {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-500">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-end gap-3">
            {!showFeedback && (
              <button
                onClick={() => advance(true)}
                disabled={phase === "submitting"}
                className="flex items-center gap-1.5 rounded-lg bg-cha-eclipse/70 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cha-eclipse disabled:opacity-60 dark:bg-cha-surface-2 dark:text-cha-muted"
              >
                Skip
                <ArrowRight size={15} />
              </button>
            )}
            {showFeedback && (
              <button
                onClick={() => advance()}
                disabled={phase === "submitting"}
                className="flex items-center gap-2 rounded-lg bg-cha-ocean px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cha-ocean/90 disabled:opacity-60"
              >
                {phase === "submitting"
                  ? "Submitting…"
                  : isLastQuestion
                    ? "Finish Knowledge Check"
                    : "Go to Next Question"}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Result / Explanation panel (mockup right column) */}
        <div className="hidden w-[260px] shrink-0 lg:block">
          {showFeedback ? (
            <div className="rounded-2xl bg-cha-surface-2/60 p-5">
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

          <button
            onClick={() => setHelpOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cha-border px-4 py-2.5 text-[13px] font-semibold text-cha-muted transition-colors hover:bg-cha-surface-2 hover:text-cha-ink"
          >
            <LifeBuoy size={15} />
            Stuck? Get help
          </button>
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
