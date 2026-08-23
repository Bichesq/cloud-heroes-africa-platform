import { NextResponse } from "next/server";
import { currentStudent } from "@/lib/current-student";
import {
  getQuestionBankItemsByIds,
  getStandaloneAssessment,
  getTopicsByIds,
} from "@/lib/store/standalone-assessments";
import {
  getAttemptAnswers,
  getAttemptById,
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

/* POST — submit an in-progress attempt. Idempotent: retrying a submit for
 * an already-submitted attempt returns the existing graded result instead
 * of reprocessing (brief §4 — backed by the UNIQUE(assessment_id,
 * student_id, attempt_number) constraint plus this status check).
 *
 * Time-limit enforcement is server-side but implemented as force-submit,
 * not reject: a late submit is still graded with whatever answers were
 * saved, rather than discarding the student's saved work with no way to
 * recover it. The brief §4 offers "reject/force-submit" as alternatives —
 * this is the judgment call made here. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string; attemptId: string }> }
) {
  const { assessmentId, attemptId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessment = await getStandaloneAssessment(assessmentId);
  if (!assessment) return NextResponse.json({ error: "Unknown assessment" }, { status: 404 });

  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.assessmentId !== assessmentId || attempt.studentId !== student.id) {
    return NextResponse.json({ error: "Unknown attempt" }, { status: 404 });
  }

  if (attempt.status === "submitted") {
    return NextResponse.json({
      attemptId: attempt.id,
      score: attempt.score,
      passed: attempt.passed,
      weakTopics: attempt.weakTopics,
      nextEligibleAt: attempt.nextEligibleAt,
    });
  }
  if (attempt.status === "expired") {
    return NextResponse.json({ error: "Attempt has expired" }, { status: 409 });
  }

  const [attemptQuestions, answers] = await Promise.all([
    getAttemptQuestions(attemptId),
    getAttemptAnswers(attemptId),
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
      throw new Error(`Missing bank item ${q.questionBankItemId} for attempt ${attemptId}`);
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
  const priorSubmittedAscending = [...(await getSubmittedAttempts(assessmentId, student.id))].reverse();
  const outcome = assessmentFailureOutcome(priorSubmittedAscending, graded.passed);

  let nextEligibleAt: Date | null = null;
  if (!graded.passed) {
    let failRun = 0;
    for (const a of priorSubmittedAscending) failRun = a.passed ? 0 : failRun + 1;
    nextEligibleAt = computeNextEligibleAt(new Date(), failRun + 1);
  }

  const updated = await gradeAndSubmitAttempt(attemptId, {
    score: graded.score,
    passed: graded.passed,
    weakTopics: graded.weakTopics,
    nextEligibleAt,
    perQuestion: graded.perQuestion,
  });

  if (outcome === "escalate") {
    await recordEscalation({
      studentId: student.id,
      kind: "assessment_repeated_failure",
      refId: assessmentId,
      payload: { attemptCount: attempt.attemptNumber },
    });
  }

  // Post-fail feedback returns the weak_topics rollup, never a full
  // per-question answer key (brief §4 — corrects Eddie's "Oops You Failed"
  // mockup, which shows full correct/incorrect + explanation per question;
  // that mockup needs revision, not implementation as-is).
  return NextResponse.json({
    attemptId: updated.id,
    score: updated.score,
    passed: updated.passed,
    weakTopics: updated.weakTopics,
    nextEligibleAt: updated.nextEligibleAt,
  });
}
