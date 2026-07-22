import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/students";
import type { Student } from "@/types";

/** Resolves the signed-in student from the shared registry (same pattern as
 * student-hub's API routes). Null when unauthenticated or unknown. */
export async function currentStudent(): Promise<Student | null> {
  const session = await getSession();
  if (!session?.user?.email) return null;
  return getStudent(session.user.email);
}
