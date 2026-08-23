import { NextResponse } from "next/server";
import { currentStudent } from "@/lib/current-student";
import {
  getQuestionBank,
  getQuestionBankItemsByIds,
  getStandaloneAssessment,
  toPublicQuestionBankItem,
} from "@/lib/store/standalone-assessments";
import {
  countAttempts,
  createAttempt,
  expireAttempt,
  getAttemptAnswers,
  getAttemptQuestions,
  getInProgressAttempt,
  getSubmittedAttempts,
  setAttemptQuestions,
} from "@/lib/store/assessment-attempts";
import { selectQuestions } from "@/lib/assessment-engine";

async function buildAttemptPayload(
  attemptId: string,
  timeLimitSeconds: number,
  startedAt: string,
  attemptNumber: number,
  status: string
) {
  const [attemptQuestions, answers] = await Promise.all([
    getAttemptQuestions(attemptId),
    getAttemptAnswers(attemptId),
  ]);
  const bankItems = await getQuestionBankItemsByIds(
    attemptQuestions.map((q) => q.questionBankItemId)
  );
  const bankById = new Map(bankItems.map((b) => [b.id, b]));
  const answerByQuestionId = new Map(answers.map((a) => [a.attemptQuestionId, a.selectedOptionIds]));

  return {
    attemptId,
    attemptNumber,
    status,
    startedAt,
    timeLimitSeconds,
    questions: attemptQuestions.map((q) => {
      const bankItem = bankById.get(q.questionBankItemId);
      return {
        attemptQuestionId: q.id,
        orderIndex: q.orderIndex,
        selectedOptionIds: answerByQuestionId.get(q.id) ?? [],
        ...(bankItem ? toPublicQuestionBankItem(bankItem) : null),
      };
    }),
  };
}

/* POST — start a new attempt, or resume the current in_progress one.
 * Resuming reloads its existing questions/answers rather than generating
 * new ones (brief §4 — "do not generate new questions for a resumed
 * attempt"). An in_progress attempt found past its own time limit is
 * treated as abandoned: expired here (lazily, in place of a periodic
 * sweep) and NOT counted as a scored failure, then a fresh attempt starts
 * below. Blocked by the retake cooldown if the most recent *submitted*
 * attempt failed and its cooldown hasn't elapsed. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessment = await getStandaloneAssessment(assessmentId);
  if (!assessment) return NextResponse.json({ error: "Unknown assessment" }, { status: 404 });

  const now = new Date();

  const inProgress = await getInProgressAttempt(assessmentId, student.id);
  if (inProgress) {
    const deadline =
      new Date(inProgress.startedAt).getTime() + assessment.timeLimitSeconds * 1000;
    if (now.getTime() <= deadline) {
      const payload = await buildAttemptPayload(
        inProgress.id,
        assessment.timeLimitSeconds,
        inProgress.startedAt,
        inProgress.attemptNumber,
        inProgress.status
      );
      return NextResponse.json(payload);
    }
    await expireAttempt(inProgress.id);
  }

  const submitted = await getSubmittedAttempts(assessmentId, student.id);
  const latest = submitted[0]; // most-recent-first
  if (latest?.passed === false && latest.nextEligibleAt && now < new Date(latest.nextEligibleAt)) {
    return NextResponse.json(
      { error: "On cooldown", nextEligibleAt: latest.nextEligibleAt },
      { status: 429 }
    );
  }

  const bank = await getQuestionBank(assessmentId);
  const questions = selectQuestions(bank, assessment.questionsPerAttempt, assessment.difficultyMix);
  if (questions.length === 0) {
    return NextResponse.json(
      { error: "Assessment has no questions configured" },
      { status: 409 }
    );
  }

  // Retake always restarts from question 1 with freshly randomized
  // questions — no partial progress carried forward from a failed attempt
  // (brief §4), which falls out naturally here since we always select a
  // brand-new set for a brand-new attempt row.
  const attemptNumber = (await countAttempts(assessmentId, student.id)) + 1;
  const attempt = await createAttempt({ assessmentId, studentId: student.id, attemptNumber });
  await setAttemptQuestions(attempt.id, questions.map((q) => q.id));

  const payload = await buildAttemptPayload(
    attempt.id,
    assessment.timeLimitSeconds,
    attempt.startedAt,
    attempt.attemptNumber,
    attempt.status
  );
  return NextResponse.json(payload, { status: 201 });
}
