"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Circle, Gauge, LifeBuoy } from "lucide-react";
import type { KcQuestion, ReadinessLevel, TicketContext } from "@/types";
import type { ReadinessSummary } from "@/lib/lp-utils";
import HelpModal from "@/components/help/HelpModal";

/* Exam Readiness runner. Unlike Knowledge Checks it gives NO per-question
 * feedback — readiness measures where you stand against the real exam, it
 * doesn't teach — and it never touches unit status or points. Result =
 * score + categorical level (config.levels), plus attempt history so
 * students can watch their trend. */

type Phase = "intro" | "question" | "submitting" | "result";

type SubmitResponse = {
  score: number;
  level: string | null;
  correctCount: number;
  total: number;
};

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
  questions: KcQuestion[];
  levels: ReadinessLevel[];
  summary: ReadinessSummary;
  helpContext: TicketContext;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progressPct = Math.round((index / Math.max(questions.length, 1)) * 100);

  async function advance(skip = false) {
    const next = { ...answers, [question.id]: skip ? null : picked };
    setAnswers(next);
    setPicked(null);

    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }

    setPhase("submitting");
    setError(null);
    const res = await fetch(`/api/readiness/${assessmentId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: next }),
    });
    if (!res.ok) {
      setPhase("question");
      setError("Couldn't submit your answers. Please try again.");
      return;
    }
    setResult((await res.json()) as SubmitResponse);
    setPhase("result");
  }

  /* ------------------------------ states ------------------------------ */

  if (phase === "intro") {
    return (
      <div className="mx-auto w-full max-w-3xl px-8 pb-16 pt-10">
        <div className="cha-card px-8 py-10">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cha-blue/10 text-cha-blue">
            <Gauge size={28} />
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 text-cha-muted">{description}</p>

          <div className="mt-6 rounded-2xl bg-cha-surface-2/70 p-5 text-sm text-cha-muted">
            <p>
              {questions.length} exam-style questions · no feedback until the end ·
              your result is a readiness level, not a pass/fail:
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {[...levels]
                .sort((a, b) => a.min - b.min)
                .map((l) => (
                  <li
                    key={l.label}
                    className="rounded-full bg-cha-surface px-3 py-1 text-xs font-semibold"
                  >
                    {l.label} ≥ {Math.round(l.min * 100)}%
                  </li>
                ))}
            </ul>
          </div>

          {summary.latest && (
            <p className="mt-4 text-sm text-cha-muted">
              Your latest result:{" "}
              <span className="font-bold text-cha-ink">
                {summary.latest.level ?? `${Math.round(summary.latest.score * 100)}%`}
              </span>{" "}
              ({Math.round(summary.latest.score * 100)}%) across{" "}
              {summary.history.length} attempt{summary.history.length === 1 ? "" : "s"}.
            </p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setPhase("question")}
              className="flex items-center gap-2 rounded-full bg-cha-blue px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cha-blue/90"
            >
              {summary.latest ? "Retake readiness assessment" : "Start readiness assessment"}
              <ArrowRight size={16} />
            </button>
            <Link
              href={`/programs/${programId}`}
              className="rounded-full px-5 py-3 text-sm font-semibold text-cha-muted hover:bg-cha-surface-2"
            >
              Back to program
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-8 pb-16 pt-10">
        <div className="cha-card px-8 py-10 text-center">
          <Gauge size={44} className="mx-auto text-cha-blue" />
          <h1 className="mt-4 font-display text-3xl font-extrabold">
            {result.level ?? `${Math.round(result.score * 100)}%`}
          </h1>
          <p className="mt-2 text-cha-muted">
            You answered {result.correctCount} of {result.total} correctly (
            {Math.round(result.score * 100)}%). This result now feeds your Exam
            Readiness widget on the Student Hub dashboard.
          </p>

          {summary.history.length > 0 && (
            <div className="mx-auto mt-6 max-w-sm text-left">
              <h2 className="text-xs font-bold uppercase tracking-wide text-cha-faint">
                Previous attempts
              </h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {summary.history
                  .slice(-5)
                  .reverse()
                  .map((h, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-xl bg-cha-surface-2/70 px-4 py-2 text-sm"
                    >
                      <span className="font-semibold">
                        {h.level ?? `${Math.round(h.score * 100)}%`}
                      </span>
                      <span className="text-xs text-cha-faint">
                        {Math.round(h.score * 100)}% · {h.submittedAt.slice(0, 10)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/programs/${programId}`}
              className="rounded-full bg-cha-orange px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cha-orange-strong"
            >
              Back to program
            </Link>
            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center gap-2 rounded-full border border-cha-border bg-cha-surface px-6 py-3 text-sm font-bold text-cha-ink transition-colors hover:bg-cha-surface-2"
            >
              <LifeBuoy size={16} />
              Get help
            </button>
          </div>
        </div>
        <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
      </div>
    );
  }

  /* --------------------------- question phase --------------------------- */

  return (
    <div className="mx-auto w-full max-w-3xl px-8 pb-16 pt-10">
      <div className="cha-card px-8 py-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-xl font-extrabold">{title}</h1>
          <span className="shrink-0 rounded-full bg-cha-blue px-4 py-1.5 text-xs font-bold text-white">
            Exam Readiness
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-cha-muted">
            <span>
              Question {index + 1} of {questions.length}
            </span>
            <span>{progressPct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cha-surface-2">
            <div
              className="h-full rounded-full bg-cha-blue transition-all"
              style={{ width: `${Math.max(progressPct, 3)}%` }}
            />
          </div>
        </div>

        <p className="mt-6 font-display text-lg font-bold leading-snug">
          {question.prompt}
        </p>

        <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, oi) => (
            <button
              key={option.id}
              role="radio"
              aria-checked={picked === option.id}
              onClick={() => setPicked(option.id)}
              className={`flex items-center gap-3 rounded-xl border-2 bg-cha-surface px-4 py-3 text-left text-sm font-medium transition-colors ${
                picked === option.id
                  ? "border-cha-blue"
                  : "border-cha-border hover:border-cha-faint"
              }`}
            >
              <Circle
                size={17}
                className={`shrink-0 ${picked === option.id ? "fill-cha-blue text-cha-blue" : "text-cha-faint"}`}
              />
              <span>
                {String.fromCharCode(65 + oi)}.) {option.label}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-500">
            {error}
          </p>
        )}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            onClick={() => advance(true)}
            disabled={phase === "submitting"}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-cha-muted transition-colors hover:bg-cha-surface-2 disabled:opacity-60"
          >
            Skip
          </button>
          <button
            onClick={() => advance()}
            disabled={picked === null || phase === "submitting"}
            className="flex items-center gap-2 rounded-lg bg-cha-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cha-blue/90 disabled:opacity-60"
          >
            {phase === "submitting"
              ? "Submitting…"
              : isLast
                ? "Finish assessment"
                : "Next question"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
    </div>
  );
}
