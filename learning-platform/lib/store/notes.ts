import type { UnitNote } from "@/types";
import { prisma } from "@/lib/prisma";

/* One free-text note per (student, unit) — deliberately simple for V1
 * (plan §8: notes can be a simple store). */

function toUnitNote(row: {
  studentId: string;
  unitId: string;
  body: string;
  updatedAt: Date;
}): UnitNote {
  return {
    studentId: row.studentId,
    unitId: row.unitId,
    body: row.body,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getNote(studentId: string, unitId: string): Promise<UnitNote | null> {
  const row = await prisma.lpNote.findUnique({
    where: { studentId_unitId: { studentId, unitId } },
  });
  return row ? toUnitNote(row) : null;
}

export async function saveNote(
  studentId: string,
  unitId: string,
  body: string
): Promise<UnitNote> {
  const row = await prisma.lpNote.upsert({
    where: { studentId_unitId: { studentId, unitId } },
    create: { studentId, unitId, body },
    update: { body, updatedAt: new Date() },
  });
  return toUnitNote(row);
}
