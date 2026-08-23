import type { ReadinessResult } from "@/types";
import { prisma } from "@/lib/prisma";

/* Exam Readiness submissions. Renamed from lib/store/results.ts — standalone
 * assessment results now live under lib/store/assessment-attempts.ts
 * instead (§3, 2026-08-11 rebuild); this file is readiness-only going
 * forward. */

function toReadinessResult(row: {
  id: string;
  studentId: string;
  assessmentId: string;
  score: unknown;
  level: string | null;
  detail: unknown;
  submittedAt: Date;
}): ReadinessResult {
  return {
    id: row.id,
    studentId: row.studentId,
    assessmentId: row.assessmentId,
    score: Number(row.score),
    level: row.level,
    detail: row.detail ?? undefined,
    submittedAt: row.submittedAt.toISOString(),
  };
}

export async function getResults(
  studentId: string,
  assessmentId?: string
): Promise<ReadinessResult[]> {
  const rows = await prisma.lpReadinessResult.findMany({
    where: { studentId, ...(assessmentId ? { assessmentId } : {}) },
  });
  return rows.map(toReadinessResult);
}

export async function recordResult(params: {
  studentId: string;
  assessmentId: string;
  score: number;
  level: string | null;
  detail?: unknown;
}): Promise<ReadinessResult> {
  const row = await prisma.lpReadinessResult.create({
    data: {
      studentId: params.studentId,
      assessmentId: params.assessmentId,
      score: params.score,
      level: params.level,
      detail: params.detail === undefined ? undefined : (params.detail as object),
    },
  });
  return toReadinessResult(row);
}
