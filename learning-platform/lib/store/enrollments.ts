import type { Enrollment } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-enrollments.json";

export async function getEnrollments(studentId: string): Promise<Enrollment[]> {
  const all = await readStore<Enrollment>(FILE);
  return all.filter((e) => e.studentId === studentId);
}

export async function isEnrolled(
  studentId: string,
  programId: string
): Promise<boolean> {
  const enrollments = await getEnrollments(studentId);
  return enrollments.some((e) => e.programId === programId);
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
export async function enroll(
  studentId: string,
  programId: string
): Promise<Enrollment> {
  const all = await readStore<Enrollment>(FILE);
  const existing = all.find(
    (e) => e.studentId === studentId && e.programId === programId
  );
  if (existing) return existing;

  const enrollment: Enrollment = {
    studentId,
    programId,
    enrolledAt: new Date().toISOString(),
    status: "active",
  };
  all.push(enrollment);
  await writeStore(FILE, all);
  return enrollment;
}
