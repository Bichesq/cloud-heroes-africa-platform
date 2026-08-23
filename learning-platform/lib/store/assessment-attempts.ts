import { prisma } from "@/lib/prisma";
import type {
  AttemptStatus,
  LpAssessmentAttempt,
  LpAttemptAnswer,
  LpAttemptQuestion,
  WeakTopic,
} from "@/types";

/* Standalone-assessment attempt state: which questions were randomly
 * selected for a given attempt, the student's in-progress answers, and the
 * graded result (brief §3/§4 full rebuild — nothing here existed before). */

function toAttempt(row: {
  id: string;
  assessmentId: string;
  studentId: string;
  attemptNumber: number;
  status: string;
  score: unknown;
  passed: boolean | null;
  startedAt: Date;
  lastSavedAt: Date | null;
  submittedAt: Date | null;
  nextEligibleAt: Date | null;
  weakTopics: unknown;
}): LpAssessmentAttempt {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    studentId: row.studentId,
    attemptNumber: row.attemptNumber,
    status: row.status as AttemptStatus,
    score: row.score === null ? null : Number(row.score),
    passed: row.passed,
    startedAt: row.startedAt.toISOString(),
    lastSavedAt: row.lastSavedAt?.toISOString() ?? null,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    nextEligibleAt: row.nextEligibleAt?.toISOString() ?? null,
    weakTopics: row.weakTopics as WeakTopic[] | null,
  };
}

function toAttemptQuestion(row: {
  id: string;
  attemptId: string;
  questionBankItemId: string;
  orderIndex: number;
}): LpAttemptQuestion {
  return {
    id: row.id,
    attemptId: row.attemptId,
    questionBankItemId: row.questionBankItemId,
    orderIndex: row.orderIndex,
  };
}

function toAttemptAnswer(row: {
  attemptQuestionId: string;
  selectedOptionIds: unknown;
  pointsEarned: unknown;
  answeredAt: Date;
}): LpAttemptAnswer {
  return {
    attemptQuestionId: row.attemptQuestionId,
    selectedOptionIds: row.selectedOptionIds as string[],
    pointsEarned: row.pointsEarned === null ? null : Number(row.pointsEarned),
    answeredAt: row.answeredAt.toISOString(),
  };
}

export async function getAttemptById(attemptId: string): Promise<LpAssessmentAttempt | null> {
  const row = await prisma.lpAssessmentAttempt.findUnique({ where: { id: attemptId } });
  return row ? toAttempt(row) : null;
}

/** At most one in_progress attempt per (assessment, student) in practice —
 * resuming reloads it rather than generating new questions (brief §4). */
export async function getInProgressAttempt(
  assessmentId: string,
  studentId: string
): Promise<LpAssessmentAttempt | null> {
  const row = await prisma.lpAssessmentAttempt.findFirst({
    where: { assessmentId, studentId, status: "in_progress" },
    orderBy: { attemptNumber: "desc" },
  });
  return row ? toAttempt(row) : null;
}

/** Submitted attempts only, most recent first — used for cooldown /
 * repeated-failure checks. */
export async function getSubmittedAttempts(
  assessmentId: string,
  studentId: string
): Promise<LpAssessmentAttempt[]> {
  const rows = await prisma.lpAssessmentAttempt.findMany({
    where: { assessmentId, studentId, status: "submitted" },
    orderBy: { attemptNumber: "desc" },
  });
  return rows.map(toAttempt);
}

export async function countAttempts(assessmentId: string, studentId: string): Promise<number> {
  return prisma.lpAssessmentAttempt.count({ where: { assessmentId, studentId } });
}

export async function createAttempt(params: {
  assessmentId: string;
  studentId: string;
  attemptNumber: number;
}): Promise<LpAssessmentAttempt> {
  const row = await prisma.lpAssessmentAttempt.create({ data: params });
  return toAttempt(row);
}

/** Marks an abandoned in_progress attempt as expired without grading it —
 * used when a resume request finds an attempt whose time limit has already
 * passed (brief §4's "periodic sweep for abandoned attempts," done lazily
 * here at resume-time instead of a cron job). Does not affect the
 * cooldown/repeated-failure count — an expiry isn't a scored failure. */
export async function expireAttempt(attemptId: string): Promise<void> {
  await prisma.lpAssessmentAttempt.update({
    where: { id: attemptId },
    data: { status: "expired" },
  });
}

export async function setAttemptQuestions(
  attemptId: string,
  questionBankItemIds: string[]
): Promise<LpAttemptQuestion[]> {
  await prisma.lpAttemptQuestion.createMany({
    data: questionBankItemIds.map((id, index) => ({
      attemptId,
      questionBankItemId: id,
      orderIndex: index,
    })),
  });
  return getAttemptQuestions(attemptId);
}

export async function getAttemptQuestions(attemptId: string): Promise<LpAttemptQuestion[]> {
  const rows = await prisma.lpAttemptQuestion.findMany({
    where: { attemptId },
    orderBy: { orderIndex: "asc" },
  });
  return rows.map(toAttemptQuestion);
}

export async function getAttemptAnswers(attemptId: string): Promise<LpAttemptAnswer[]> {
  const questions = await prisma.lpAttemptQuestion.findMany({
    where: { attemptId },
    include: { answer: true },
  });
  return questions
    .filter((q) => q.answer !== null)
    .map((q) => toAttemptAnswer(q.answer!));
}

/** Upsert by attemptQuestionId — supports save-and-resume. selectedOptionIds
 * and pointsEarned stay hidden from the client until submission. */
export async function saveAnswer(
  attemptQuestionId: string,
  selectedOptionIds: string[]
): Promise<LpAttemptAnswer> {
  const row = await prisma.lpAttemptAnswer.upsert({
    where: { attemptQuestionId },
    create: { attemptQuestionId, selectedOptionIds },
    update: { selectedOptionIds, answeredAt: new Date() },
  });
  return toAttemptAnswer(row);
}

export async function touchLastSaved(attemptId: string): Promise<void> {
  await prisma.lpAssessmentAttempt.update({
    where: { id: attemptId },
    data: { lastSavedAt: new Date() },
  });
}

/** Grades and submits atomically: writes each answer's pointsEarned and
 * flips the attempt to submitted in one transaction, so a crash mid-write
 * can't leave partial credit recorded against an attempt that isn't marked
 * submitted (which would break the idempotent-submit guard). */
export async function gradeAndSubmitAttempt(
  attemptId: string,
  params: {
    score: number;
    passed: boolean;
    weakTopics: WeakTopic[];
    nextEligibleAt: Date | null;
    perQuestion: { attemptQuestionId: string; pointsEarned: number }[];
  }
): Promise<LpAssessmentAttempt> {
  const now = new Date();
  const results = await prisma.$transaction([
    ...params.perQuestion.map((pq) =>
      prisma.lpAttemptAnswer.update({
        where: { attemptQuestionId: pq.attemptQuestionId },
        data: { pointsEarned: pq.pointsEarned },
      })
    ),
    prisma.lpAssessmentAttempt.update({
      where: { id: attemptId },
      data: {
        status: "submitted",
        score: params.score,
        passed: params.passed,
        weakTopics: params.weakTopics,
        nextEligibleAt: params.nextEligibleAt,
        submittedAt: now,
        lastSavedAt: now,
      },
    }),
  ]);
  // The attempt update is always last regardless of how many answer
  // updates preceded it.
  return toAttempt(results[results.length - 1] as Awaited<
    ReturnType<typeof prisma.lpAssessmentAttempt.update>
  >);
}
