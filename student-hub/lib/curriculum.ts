import type { Program, UnitCompletion } from "@/types";
import { prisma } from "./prisma";

/* Mock program catalog (static seed content) and unit completions
 * (student-generated). Prisma-backed (models in
 * prisma-shared/student-hub-local-models.prisma) — replaces
 * student-hub/data/programs.json + progress.json per
 * docs/plan/2026-08-23-centralize-shared-data.md. Isolated here so a future
 * real-LMS integration only needs to replace this file's I/O —
 * lib/curriculum-utils.ts (the pure stats/next-unit logic) and every
 * dashboard consumer stay unchanged. */

export const DEFAULT_PROGRAM_ID = "cloud-practitioner";

export async function getProgram(programId: string): Promise<Program | null> {
  const row = await prisma.shMockProgram.findUnique({ where: { id: programId } });
  if (!row) return null;
  return { id: row.id, title: row.title, modules: row.modules as Program["modules"] };
}

export async function getCompletions(studentId: string): Promise<UnitCompletion[]> {
  const rows = await prisma.shUnitCompletion.findMany({ where: { studentId } });
  return rows.map((r) => ({
    studentId: r.studentId,
    unitId: r.unitId,
    completedAt: r.completedAt.toISOString(),
  }));
}

/** Records a unit as complete. Idempotent — completing an already-complete
 * unit is a no-op (returns the existing record). */
export async function markUnitComplete(
  studentId: string,
  unitId: string
): Promise<UnitCompletion> {
  const existing = await prisma.shUnitCompletion.findUnique({
    where: { studentId_unitId: { studentId, unitId } },
  });
  if (existing) {
    return { studentId, unitId, completedAt: existing.completedAt.toISOString() };
  }

  const row = await prisma.shUnitCompletion.create({ data: { studentId, unitId } });
  return { studentId, unitId, completedAt: row.completedAt.toISOString() };
}
