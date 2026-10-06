import {
  getQuestionBankItemsByIds,
  getTopicsByIds,
} from "@/lib/store/standalone-assessments";
import {
  getAttemptAnswers,
  getAttemptQuestions,
  getSubmittedAttempts,
  gradeAndSubmitAttempt,
} from "@/lib/store/assessment-attempts";
import { recordEscalation } from "@/lib/store/escalations";
import {
  assessmentFailureOutcome,
  computeNextEligibleAt,
  gradeAttempt,
} from "@/lib/assessment-engine";
import type { LpAssessmentAttempt, LpStandaloneAssessment, WeakTopic } from "@/types";

type ReviewRow = {
  attemptQuestionId: string;
  orderIndex: number;
  prompt: string;
  type: string;
  options: unknown;
  correctOptionIds: string[];
  selectedOptionIds: string[];
  explanation: string | null;
  pointsPossible: number;
  pointsEarned: number;
  topicName: string | null;
};

export type SubmitAttemptResult = {
  attemptId: string;
  score: number | null;
  passed: boolean | null;
  weakTopics: WeakTopic[] | null;
  nextEligibleAt: string | null;
  startedAt: string;
  submittedAt: string | null;
  totalQuestions?: number;
  review?: ReviewRow[] | null;
};

/**
 * The grade-and-submit orchestration shared by the student-facing submit
 * route (app/api/assessments/[assessmentId]/attempts/[attemptId]/submit/
 * route.ts) and the admin resync action (Phase 2 step 3,
 * app/api/admin/assessments/attempts/[attemptId]/resync/route.ts) — same
 * code path, same atomic write (assessment-attempts.ts#gradeAndSubmitAttempt),
 * so a forced resync can never diverge from what a normal submit would have
 * produced.
 *
 * Idempotent: an already-submitted attempt short-circuits to its stored
 * result instead of regrading — unchanged behavior from the original
 * submit route, just relocated so both callers get it for free.
 *
 * Caller is responsible for authenticating the request and verifying it's
 * allowed to act on this attempt (student ownership for the normal submit
 * route, admin auth for the resync route) and for loading `attempt` +
 * `assessment` beforehand — this function assumes both checks already
 * happened.
 */
export async function finalizeAttempt(
  attempt: LpAssessmentAttempt,
  assessment: LpStandaloneAssessment
): Promise<SubmitAttemptResult> {
  if (attempt.status === "submitted") {
    return {
      attemptId: attempt.id,
      score: attempt.score,
      passed: attempt.passed,
      weakTopics: attempt.weakTopics,
      nextEligibleAt: attempt.nextEligibleAt,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
    };
  }

  const [attemptQuestions, answers] = await Promise.all([
    getAttemptQuestions(attempt.id),
    getAttemptAnswers(attempt.id),
  ]);
  const bankItems = await getQuestionBankItemsByIds(
    attemptQuestions.map((q) => q.questionBankItemId)
  );
  const bankById = new Map(bankItems.map((b) => [b.id, b]));
  const topics = await getTopicsByIds(
    bankItems.map((b) => b.topicId).filter((id): id is string => id !== null)
  );
  const answerByQuestionId = new Map(answers.map((a) => [a.attemptQuestionId, a.selectedOptionIds]));

  const gradingInput = attemptQuestions.map((q) => {
    const bankItem = bankById.get(q.questionBankItemId);
    if (!bankItem) {
      throw new Error(`Missing bank item ${q.questionBankItemId} for attempt ${attempt.id}`);
    }
    const topic = bankItem.topicId ? topics.get(bankItem.topicId) : undefined;
    return {
      attemptQuestionId: q.id,
      bankItem,
      topicName: topic?.name ?? null,
      topicUnitId: topic?.unitId ?? null,
      selectedOptionIds: answerByQuestionId.get(q.id) ?? [],
    };
  });

  const graded = gradeAttempt(gradingInput, assessment.passThreshold);

  // Oldest-first, mirroring kc-utils.nextAttemptOutcome's chronological
  // fail-run logic (a pass resets the run; only fails since the last pass
  // count toward escalation/cooldown severity).
  const priorSubmittedAscending = [
    ...(await getSubmittedAttempts(assessment.id, attempt.studentId)),
  ].reverse();
  const outcome = assessmentFailureOutcome(priorSubmittedAscending, graded.passed);

  let nextEligibleAt: Date | null = null;
  if (!graded.passed) {
    let failRun = 0;
    for (const a of priorSubmittedAscending) failRun = a.passed ? 0 : failRun + 1;
    nextEligibleAt = computeNextEligibleAt(new Date(), failRun + 1);
  }

  const updated = await gradeAndSubmitAttempt(attempt.id, {
    score: graded.score,
    passed: graded.passed,
    weakTopics: graded.weakTopics,
    nextEligibleAt,
    perQuestion: graded.perQuestion,
  });

  if (outcome === "escalate") {
    await recordEscalation({
      studentId: attempt.studentId,
      kind: "assessment_repeated_failure",
      refId: assessment.id,
      payload: { attemptCount: attempt.attemptNumber },
    });
  }

  // Per-question review (correct answer + explanation) is only included for
  // module-level assessments, per the 2026-08-20 decision (reconciliation
  // doc line 180): module assessments get detailed review, program-level
  // assessments only get the high-level weak_topics guidance above.
  const pointsByQuestionId = new Map(graded.perQuestion.map((p) => [p.attemptQuestionId, p.pointsEarned]));
  const review: ReviewRow[] | null =
    assessment.moduleId !== null
      ? gradingInput.map((q) => ({
          attemptQuestionId: q.attemptQuestionId,
          orderIndex: attemptQuestions.find((aq) => aq.id === q.attemptQuestionId)!.orderIndex,
          prompt: q.bankItem.prompt,
          type: q.bankItem.type,
          options: q.bankItem.options,
          correctOptionIds: q.bankItem.correctOptionIds,
          selectedOptionIds: q.selectedOptionIds,
          explanation: q.bankItem.explanation,
          pointsPossible: Number(q.bankItem.pointsPossible),
          pointsEarned: pointsByQuestionId.get(q.attemptQuestionId) ?? 0,
          topicName: q.topicName,
        }))
      : null;

  return {
    attemptId: updated.id,
    score: updated.score,
    passed: updated.passed,
    weakTopics: updated.weakTopics,
    nextEligibleAt: updated.nextEligibleAt,
    startedAt: attempt.startedAt,
    submittedAt: updated.submittedAt,
    totalQuestions: gradingInput.length,
    review,
  };
}
