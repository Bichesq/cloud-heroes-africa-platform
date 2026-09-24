import type { AttemptStatus, KcAttempt } from "@/types";
import { prisma } from "@/lib/prisma";

/* 2026-09-21 (plan Phase 3): a KC attempt is now created at *start*
 * (status in_progress) so its randomly-selected question set can be
 * snapshotted (lp_kc_attempt_questions) before the learner answers — see
 * lp-core.prisma's LpKcAttempt comment for why this closes a real scoring-
 * integrity gap. Submission flips the same row to submitted. */

function toKcAttempt(row: {
  id: string;
  studentId: string;
  kcId: string;
  attemptNo: number;
  status: string;
  answers: unknown;
  score: unknown;
  passed: boolean | null;
  createdAt: Date;
  submittedAt: Date | null;
}): KcAttempt {
  return {
    id: row.id,
    studentId: row.studentId,
    kcId: row.kcId,
    attemptNo: row.attemptNo,
    status: row.status as AttemptStatus,
    answers: row.answers as Record<string, string | null> | null,
    score: row.score === null ? null : Number(row.score),
    passed: row.passed,
    createdAt: row.createdAt.toISOString(),
    submittedAt: row.submittedAt?.toISOString() ?? null,
  };
}

/** Submitted attempts only, oldest first — used for attempt-history/outcome
 * calculations (attemptCount, failRun, "already passed"). Deliberately
 * excludes in_progress rows: their `passed` is null, which would misread as
 * a fail in `nextAttemptOutcome`. */
export async function getAttempts(studentId: string, kcId: string): Promise<KcAttempt[]> {
  const rows = await prisma.lpKcAttempt.findMany({
    where: { studentId, kcId, status: "submitted" },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toKcAttempt);
}

/** At most one in_progress attempt per (student, kc) in practice — starting
 * again reuses it (and its already-selected questions) instead of spawning
 * a duplicate row + a second random draw. */
export async function getInProgressAttempt(
  studentId: string,
  kcId: string
): Promise<KcAttempt | null> {
  const row = await prisma.lpKcAttempt.findFirst({
    where: { studentId, kcId, status: "in_progress" },
    orderBy: { createdAt: "desc" },
  });
  return row ? toKcAttempt(row) : null;
}

export async function getAttemptById(attemptId: string): Promise<KcAttempt | null> {
  const row = await prisma.lpKcAttempt.findUnique({ where: { id: attemptId } });
  return row ? toKcAttempt(row) : null;
}

export type KcAttemptQuestionSnapshot = {
  attemptQuestionId: string;
  kcQuestionBankItemId: string;
  orderIndex: number;
  prompt: string;
  options: unknown;
  correctOptionId: string;
  explanation: string | null;
};

/** Creates the attempt row and its question-selection snapshot together, so
 * a crash between the two can't leave an attempt with no pinned questions
 * (mirrors gradeAndSubmitAttempt's atomicity rationale for Standalone
 * Assessments). */
export async function startAttempt(params: {
  studentId: string;
  kcId: string;
  questionBankItemIds: string[];
}): Promise<{ attempt: KcAttempt; questions: KcAttemptQuestionSnapshot[] }> {
  const attemptNo =
    (await prisma.lpKcAttempt.count({
      where: { studentId: params.studentId, kcId: params.kcId },
    })) + 1;

  const attempt = await prisma.$transaction(async (tx) => {
    const created = await tx.lpKcAttempt.create({
      data: { studentId: params.studentId, kcId: params.kcId, attemptNo },
    });
    await tx.lpKcAttemptQuestion.createMany({
      data: params.questionBankItemIds.map((id, index) => ({
        attemptId: created.id,
        kcQuestionBankItemId: id,
        orderIndex: index,
      })),
    });
    return created;
  });

  return { attempt: toKcAttempt(attempt), questions: await getAttemptQuestionSnapshot(attempt.id) };
}

export async function getAttemptQuestionSnapshot(
  attemptId: string
): Promise<KcAttemptQuestionSnapshot[]> {
  const rows = await prisma.lpKcAttemptQuestion.findMany({
    where: { attemptId },
    orderBy: { orderIndex: "asc" },
    include: { questionBankItem: true },
  });
  return rows.map((r) => ({
    attemptQuestionId: r.id,
    kcQuestionBankItemId: r.kcQuestionBankItemId,
    orderIndex: r.orderIndex,
    prompt: r.questionBankItem.prompt,
    options: r.questionBankItem.options,
    correctOptionId: r.questionBankItem.correctOptionId,
    explanation: r.questionBankItem.explanation,
  }));
}

/** Grades and submits atomically — mirrors gradeAndSubmitAttempt's rationale
 * for Standalone Assessments (a crash mid-write can't leave a half-graded
 * attempt). `answers` are the raw submitted selections, kept for audit;
 * `score`/`passed` must already be computed server-side against the
 * snapshot (kc-utils#scoreAttempt), never trusted from the client. */
export async function submitAttempt(
  attemptId: string,
  params: {
    answers: Record<string, string | null>;
    score: number;
    passed: boolean;
  }
): Promise<KcAttempt> {
  const row = await prisma.lpKcAttempt.update({
    where: { id: attemptId },
    data: {
      status: "submitted",
      answers: params.answers,
      score: params.score,
      passed: params.passed,
      submittedAt: new Date(),
    },
  });
  return toKcAttempt(row);
}
