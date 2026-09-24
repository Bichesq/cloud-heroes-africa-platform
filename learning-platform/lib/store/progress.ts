import type { StudentUnit, StudentUnitStatus } from "@/types";
import { prisma } from "@/lib/prisma";

/* Per-student unit progress — the dual-status records (completed_at /
 * verified_at). (2026-08-11: StudentItem/per-item completion is gone along
 * with Section/Item — Unit is the only tracked granularity now. See plan
 * Ambiguity #2 for what decides "this unit's content is done" without a
 * leaf level below Unit — app/api/progress/route.ts now takes that signal
 * directly by unitId.) */

function toStudentUnit(row: {
  studentId: string;
  unitId: string;
  status: StudentUnitStatus;
  completedAt: Date | null;
  verifiedAt: Date | null;
  updatedAt: Date;
}): StudentUnit {
  return {
    studentId: row.studentId,
    unitId: row.unitId,
    status: row.status,
    completedAt: row.completedAt?.toISOString() ?? null,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getStudentUnits(studentId: string): Promise<StudentUnit[]> {
  const rows = await prisma.lpStudentUnit.findMany({ where: { studentId } });
  return rows.map(toStudentUnit);
}

export async function getStudentUnit(
  studentId: string,
  unitId: string
): Promise<StudentUnit | null> {
  const row = await prisma.lpStudentUnit.findUnique({
    where: { studentId_unitId: { studentId, unitId } },
  });
  return row ? toStudentUnit(row) : null;
}

/** Upserts the student-unit record. completedAt / verifiedAt are stamped the
 * first time their status is reached and never cleared afterwards — a Retake
 * keeps the original completion timestamp (the content WAS finished). */
export async function setUnitStatus(
  studentId: string,
  unitId: string,
  status: StudentUnitStatus
): Promise<StudentUnit> {
  const now = new Date();
  const existing = await prisma.lpStudentUnit.findUnique({
    where: { studentId_unitId: { studentId, unitId } },
  });

  const completedAt =
    existing?.completedAt ?? (status === "completed" || status === "verified" ? now : null);
  const verifiedAt = existing?.verifiedAt ?? (status === "verified" ? now : null);

  const row = await prisma.lpStudentUnit.upsert({
    where: { studentId_unitId: { studentId, unitId } },
    create: { studentId, unitId, status, completedAt, verifiedAt, updatedAt: now },
    update: { status, completedAt, verifiedAt, updatedAt: now },
  });
  return toStudentUnit(row);
}

/* -------------------------- per-topic progress -------------------------- */
/* 2026-09-24 (plan 2026-09-24-per-topic-unit-progress): a topic is complete
 * once the student presses Next on it. Callers must already have checked the
 * topic belongs to the unit and that the student may access the unit. */

export async function getCompletedTopicIds(
  studentId: string,
  unitId: string
): Promise<string[]> {
  const rows = await prisma.lpStudentTopic.findMany({
    where: { studentId, unitId },
    select: { topicId: true },
  });
  return rows.map((r) => r.topicId);
}

/** Idempotent — completing an already-completed topic keeps its first
 * completion timestamp. */
export async function markTopicComplete(
  studentId: string,
  unitId: string,
  topicId: string
): Promise<void> {
  await prisma.lpStudentTopic.upsert({
    where: { studentId_topicId: { studentId, topicId } },
    create: { studentId, unitId, topicId },
    update: {},
  });
}
