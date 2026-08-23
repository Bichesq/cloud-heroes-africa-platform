import type { Enrollment } from "@/types";
import { prisma } from "@/lib/prisma";

function toEnrollment(row: {
  studentId: string;
  programId: string;
  enrolledAt: Date;
  status: string;
}): Enrollment {
  return {
    studentId: row.studentId,
    programId: row.programId,
    enrolledAt: row.enrolledAt.toISOString(),
    status: row.status as Enrollment["status"],
  };
}

export async function getEnrollments(studentId: string): Promise<Enrollment[]> {
  const rows = await prisma.lpEnrollment.findMany({ where: { studentId } });
  return rows.map(toEnrollment);
}

export async function isEnrolled(studentId: string, programId: string): Promise<boolean> {
  const row = await prisma.lpEnrollment.findUnique({
    where: { studentId_programId: { studentId, programId } },
  });
  return row !== null;
}

/** Students arriving from Student Hub already have an active program on
 * their shared record — materialize it as an LP enrollment on first visit
 * so the catalog/courses views agree with the hub. */
export async function ensureDefaultEnrollment(
  studentId: string,
  activeProgramId: string | undefined
): Promise<Enrollment[]> {
  const existing = await getEnrollments(studentId);
  if (existing.length > 0 || !activeProgramId) return existing;
  return [await enroll(studentId, activeProgramId)];
}

/** Idempotent enrollment (catalog "Start Program"). */
export async function enroll(studentId: string, programId: string): Promise<Enrollment> {
  const row = await prisma.lpEnrollment.upsert({
    where: { studentId_programId: { studentId, programId } },
    create: { studentId, programId },
    update: {},
  });
  return toEnrollment(row);
}
