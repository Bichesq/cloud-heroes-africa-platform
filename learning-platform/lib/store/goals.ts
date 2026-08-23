import type { UnitGoal } from "@/types";
import { prisma } from "@/lib/prisma";

function toUnitGoal(row: {
  studentId: string;
  unitId: string;
  targetDate: Date;
  setAt: Date;
}): UnitGoal {
  return {
    studentId: row.studentId,
    unitId: row.unitId,
    targetDate: row.targetDate.toISOString().slice(0, 10),
    setAt: row.setAt.toISOString(),
  };
}

export async function getGoals(studentId: string): Promise<UnitGoal[]> {
  const rows = await prisma.lpUnitGoal.findMany({ where: { studentId } });
  return rows.map(toUnitGoal);
}

/** One goal per (student, unit) — re-setting replaces the target date. */
export async function setGoal(
  studentId: string,
  unitId: string,
  targetDate: string
): Promise<UnitGoal> {
  const row = await prisma.lpUnitGoal.upsert({
    where: { studentId_unitId: { studentId, unitId } },
    create: { studentId, unitId, targetDate: new Date(targetDate) },
    update: { targetDate: new Date(targetDate), setAt: new Date() },
  });
  return toUnitGoal(row);
}

export async function removeGoal(studentId: string, unitId: string): Promise<void> {
  await prisma.lpUnitGoal.deleteMany({ where: { studentId, unitId } });
}
