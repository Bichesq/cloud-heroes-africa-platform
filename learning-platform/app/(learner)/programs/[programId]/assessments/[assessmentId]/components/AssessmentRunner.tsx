"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Chip } from "@heroui/react";
import type { TicketContext } from "@/types";
import HelpModal from "@/components/help/HelpModal";
import AssessmentHeader from "./AssessmentHeader";
import PreAssessment from "./PreAssessment";
import QuestionStage from "./QuestionStage";
import QuestionPalette from "./QuestionPalette";
import SubmitReviewModal from "./SubmitReviewModal";
import ResultsStage from "./ResultsStage";
import FeedbackStage from "./FeedbackStage";
import ReportingStage from "./ReportingStage";
import type { AttemptQuestion, LastAttempt, SubmitResult, TopicBreakdown } from "./types";

/* Module (Standalone) Assessment runner — state machine + API calls only;
 * every screen is its own stage component, rebuilt 2026-09-23 (plan step 4)
 * against the 12 Figma "Learning Platform (Assessment View)" frames with
 * HeroUI v3. The attempt API contract (app/api/assessments/**) is unchanged:
 * the same four calls, same URLs, same request bodies as before.
 *
 * Flow: pre → question (palette + flag + report) → submit modal → reporting
 * (only if questions were marked "Report Question") → results → feedback.
 * Requirements doc §5.1–§5.5. */

type Phase = "pre" | "question" | "reporting" | "results" | "feedback";

export default function AssessmentRunner({
  assessmentId,
  programId,
  title,
  heading,
  description,
  questionsPerAttempt,
  timeLimitSeconds,
  hasInProgressAttempt,
  lastAttempt,
  attemptCount,
  cooldown,
  helpContext,
}: {
  assessmentId: string;
  programId: string;
  title: string;
  /** Start-screen heading, e.g. "Module 1: Cloud For Beginners". */
  heading: string;
  description: string;
  questionsPerAttempt: number;
  timeLimitSeconds: number;
  hasInProgressAttempt: boolean;
  lastAttempt: LastAttempt;
  attemptCount: number;
  cooldown: string | null;
  helpContext: TicketContext;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pre");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingReportIds, setPendingReportIds] = useState<Set<string>>(new Set());
  const [reportDetails, setReportDetails] = useState<Record<string, string>>({});
  const [reportIndex, setReportIndex] = useState(0);
  const [reportsSubmitting, setReportsSubmitting] = useState(false);
  const [reportsSubmitted, setReportsSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<string | null>(cooldown);
  const [busy, setBusy] = useState(false);

  const question = questions[index];
  const programHref = `/programs/${programId}`;
  const onCooldown = cooldownUntil !== null && new Date(cooldownUntil) > new Date();

  /* ------------------------------ API calls ------------------------------ */

  async function startOrResume() {
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/assessments/${assessmentId}/attempts`, { method: "POST" });
    setBusy(false);
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      setCooldownUntil(data.nextEligibleAt ?? null);
      setError("You're still on cooldown from your last attempt.");
      setPhase("pre");
      return;
    }
    if (!res.ok) {
      setError("Couldn't start the assessment. Please try again.");
      setPhase("pre");
      return;
    }
    const data = (await res.json()) as { attemptId: string; questions: AttemptQuestion[] };
    const sorted = [...data.questions].sort((a, b) => a.orderIndex - b.orderIndex);
    setAttemptId(data.attemptId);
    setQuestions(sorted);
    const firstUnanswered = sorted.findIndex((q) => q.selectedOptionIds.length === 0);
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setPendingReportIds(new Set());
    setReportDetails({});
    setReportsSubmitted(false);
    setResult(null);
    setPhase("question");
  }

  async function saveAnswerToServer(attemptQuestionId: string, selectedOptionIds: string[], flagged: boolean) {
    if (!attemptId) return;
    try {
      await fetch(`/api/assessments/${assessmentId}/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptQuestionId, selectedOptionIds, flagged }),
      });
    } catch {
      // Best-effort — local state already reflects the change; a failed
      // save just means it won't survive an exit/resume, not a crash here.
    }
  }

  async function submitAttempt() {
    if (!attemptId) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/assessments/${assessmentId}/attempts/${attemptId}/submit`, {
      method: "POST",
    });
    setSubmitting(false);
    if (!res.ok) {
      setError("Couldn't submit your attempt. Please try again.");
      return;
    }
    const data = (await res.json()) as SubmitResult;
    setResult(data);
    setReviewOpen(false);
    if (!data.passed && data.nextEligibleAt) setCooldownUntil(data.nextEligibleAt);
    // Figma "Reported Question Feedback" comes straight after submitting.
    setReportIndex(0);
    setPhase(pendingReportIds.size > 0 ? "reporting" : "results");
  }

  async function submitReports() {
    if (!attemptId) return;
    setReportsSubmitting(true);
    setError(null);
    const ids = Array.from(pendingReportIds).filter((id) => (reportDetails[id] ?? "").trim().length > 0);
    const responses = await Promise.all(
      ids.map((attemptQuestionId) => {
        const bankItemId = questions.find((q) => q.attemptQuestionId === attemptQuestionId)?.id;
        if (!bankItemId) return Promise.resolve(null);
        return fetch(`/api/assessments/${assessmentId}/attempts/${attemptId}/reports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionBankItemId: bankItemId, detail: reportDetails[attemptQuestionId] }),
        }).catch(() => null);
      })
    );
    setReportsSubmitting(false);
    if (responses.some((r) => r !== null && !r.ok) || responses.includes(null)) {
      setError("Some reports couldn't be sent. Please try again.");
      return;
    }
    setReportsSubmitted(true);
  }

  /* ---------------------------- local updates ---------------------------- */

  function updateCurrent(patch: Partial<Pick<AttemptQuestion, "selectedOptionIds" | "flagged">>) {
    if (!question) return;
    const next = { ...question, ...patch };
    setQuestions((prev) => prev.map((q) => (q.attemptQuestionId === next.attemptQuestionId ? next : q)));
    void saveAnswerToServer(next.attemptQuestionId, next.selectedOptionIds, next.flagged);
  }

  function toggleReportPending() {
    if (!question) return;
    setPendingReportIds((prev) => {
      const next = new Set(prev);
      if (next.has(question.attemptQuestionId)) next.delete(question.attemptQuestionId);
      else next.add(question.attemptQuestionId);
      return next;
    });
  }

  /* ------------------------------ derived -------------------------------- */

  const answeredCount = questions.filter((q) => q.selectedOptionIds.length > 0).length;
  const flaggedCount = questions.filter((q) => q.flagged).length;
  const flaggedIds = useMemo(
    () => new Set(questions.filter((q) => q.flagged).map((q) => q.attemptQuestionId)),
    [questions]
  );
  const reportedQuestions = useMemo(
    () => questions.filter((q) => pendingReportIds.has(q.attemptQuestionId)),
    [questions, pendingReportIds]
  );

  const topicBreakdown = useMemo<TopicBreakdown[]>(() => {
    if (!result?.review) return [];
    const byTopic = new Map<string, { possible: number; earned: number; correct: number; total: number }>();
    for (const r of result.review) {
      const key = r.topicName ?? "General";
      const e = byTopic.get(key) ?? { possible: 0, earned: 0, correct: 0, total: 0 };
      e.possible += r.pointsPossible;
      e.earned += r.pointsEarned;
      e.total += 1;
      if (r.pointsEarned >= r.pointsPossible) e.correct += 1;
      byTopic.set(key, e);
    }
    return [...byTopic.entries()].map(([name, e]) => ({
      name,
      pct: e.possible === 0 ? 0 : Math.round((e.earned / e.possible) * 100),
      correct: e.correct,
      total: e.total,
    }));
  }, [result]);

  /** "12:34" (Figma), mm:ss from the attempt's server timestamps. */
  const timeTaken = useMemo(() => {
    if (!result) return "—";
    const ms = new Date(result.submittedAt).getTime() - new Date(result.startedAt).getTime();
    const total = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  }, [result]);

  /* ------------------------------- render -------------------------------- */

  const ended = phase === "results" || phase === "feedback" || phase === "reporting";

  function exit() {
    // Mid-attempt, Exit returns to the start screen — answers are already
    // saved server-side, so "Resume Assessment" picks up where they left off.
    if (phase === "question") setPhase("pre");
    else router.push(programHref);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AssessmentHeader
        title={title}
        status={phase === "pre" ? null : ended ? "Ended" : "Ongoing"}
        exitLabel={phase === "pre" ? "Exit Assessment View" : "Exit"}
        onExit={exit}
        aside={
          ended ? (
            <Chip variant="soft">
              <Chip.Label>End of Assessment</Chip.Label>
            </Chip>
          ) : null
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {phase === "pre" && (
          <PreAssessment
            heading={heading}
            description={description}
            questionsPerAttempt={questionsPerAttempt}
            timeLimitSeconds={timeLimitSeconds}
            attemptCount={attemptCount}
            lastAttempt={lastAttempt}
            hasInProgressAttempt={hasInProgressAttempt || attemptId !== null}
            cooldownUntil={cooldownUntil}
            busy={busy}
            error={error}
            onStart={startOrResume}
            onReportIssue={() => setHelpOpen(true)}
          />
        )}

        {phase === "question" && question && (
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row lg:items-start">
            <QuestionStage
              question={question}
              index={index}
              total={questions.length}
              markedForReport={pendingReportIds.has(question.attemptQuestionId)}
              onSelect={(ids) => updateCurrent({ selectedOptionIds: ids })}
              onToggleFlag={() => updateCurrent({ flagged: !question.flagged })}
              onToggleReport={toggleReportPending}
              onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
              onNext={() => {
                if (index === questions.length - 1) {
                  setError(null);
                  setReviewOpen(true);
                } else setIndex((i) => i + 1);
              }}
            />
            <QuestionPalette
              states={questions.map((q) => ({ answered: q.selectedOptionIds.length > 0, flagged: q.flagged }))}
              currentIndex={index}
              onJump={setIndex}
            />
          </div>
        )}

        {phase === "reporting" && (
          <ReportingStage
            reported={reportedQuestions}
            total={questions.length}
            reportIndex={reportIndex}
            details={reportDetails}
            submitted={reportsSubmitted}
            submitting={reportsSubmitting}
            error={error}
            onDetailChange={(id, detail) => setReportDetails((prev) => ({ ...prev, [id]: detail }))}
            onIndexChange={setReportIndex}
            onSkip={() => setPhase("results")}
            onSubmit={submitReports}
            onDone={() => setPhase("results")}
          />
        )}

        {phase === "results" && result && (
          <ResultsStage
            title={title}
            result={result}
            topics={topicBreakdown}
            timeTaken={timeTaken}
            canRetake={!onCooldown}
            pendingReports={reportsSubmitted ? 0 : pendingReportIds.size}
            onViewFeedback={() => setPhase("feedback")}
            onRetake={startOrResume}
            onReport={() => {
              setReportIndex(0);
              setPhase("reporting");
            }}
            onReturn={() => router.push(programHref)}
          />
        )}

        {phase === "feedback" && result?.review && (
          <FeedbackStage
            review={result.review}
            flaggedIds={flaggedIds}
            topics={topicBreakdown}
            passed={result.passed}
            canRetake={!onCooldown}
            onBack={() => setPhase("results")}
            onRetake={startOrResume}
          />
        )}
      </div>

      <SubmitReviewModal
        isOpen={reviewOpen}
        onOpenChange={setReviewOpen}
        answered={answeredCount}
        flagged={flaggedCount}
        unanswered={questions.length - answeredCount}
        submitting={submitting}
        error={error}
        onReview={() => {
          const target = questions.findIndex((q) => q.flagged || q.selectedOptionIds.length === 0);
          setIndex(target === -1 ? 0 : target);
          setReviewOpen(false);
        }}
        onSubmit={submitAttempt}
      />

      <HelpModal isOpen={helpOpen} onOpenChange={setHelpOpen} context={helpContext} />
    </div>
  );
}
