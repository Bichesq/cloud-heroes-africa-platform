import type { KcAttempt } from "@/types";
import { prisma } from "@/lib/prisma";

function toKcAttempt(row: {
  id: string;
  studentId: string;
  kcId: string;
  attemptNo: number;
  answers: unknown;
  score: unknown;
  passed: boolean;
  createdAt: Date;
}): KcAttempt {
  return {
    id: row.id,
    studentId: row.studentId,
    kcId: row.kcId,
    attemptNo: row.attemptNo,
    answers: row.answers as Record<string, string | null>,
    score: Number(row.score),
    passed: row.passed,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getAttempts(studentId: string, kcId: string): Promise<KcAttempt[]> {
  const rows = await prisma.lpKcAttempt.findMany({
    where: { studentId, kcId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toKcAttempt);
}

export async function recordAttempt(params: {
  studentId: string;
  kcId: string;
  answers: Record<string, string | null>;
  score: number;
  passed: boolean;
}): Promise<KcAttempt> {
  const attemptNo =
    (await prisma.lpKcAttempt.count({
      where: { studentId: params.studentId, kcId: params.kcId },
    })) + 1;
  const row = await prisma.lpKcAttempt.create({
    data: {
      studentId: params.studentId,
      kcId: params.kcId,
      attemptNo,
      answers: params.answers,
      score: params.score,
      passed: params.passed,
    },
  });
  return toKcAttempt(row);
}
