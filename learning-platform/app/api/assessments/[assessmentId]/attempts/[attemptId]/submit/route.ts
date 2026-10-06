import { NextResponse } from "next/server";
import { currentStudent } from "@/lib/current-student";
import { getStandaloneAssessment } from "@/lib/store/standalone-assessments";
import { getAttemptById } from "@/lib/store/assessment-attempts";
import { finalizeAttempt } from "@/lib/assessment-submission";

/* POST — submit an in-progress attempt. Idempotent: retrying a submit for
 * an already-submitted attempt returns the existing graded result instead
 * of reprocessing (brief §4 — backed by the UNIQUE(assessment_id,
 * student_id, attempt_number) constraint plus this status check).
 *
 * Time-limit enforcement is server-side but implemented as force-submit,
 * not reject: a late submit is still graded with whatever answers were
 * saved, rather than discarding the student's saved work with no way to
 * recover it. The brief §4 offers "reject/force-submit" as alternatives —
 * this is the judgment call made here. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string; attemptId: string }> }
) {
  const { assessmentId, attemptId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessment = await getStandaloneAssessment(assessmentId);
  if (!assessment) return NextResponse.json({ error: "Unknown assessment" }, { status: 404 });

  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.assessmentId !== assessmentId || attempt.studentId !== student.id) {
    return NextResponse.json({ error: "Unknown attempt" }, { status: 404 });
  }

  if (attempt.status === "expired") {
    return NextResponse.json({ error: "Attempt has expired" }, { status: 409 });
  }

  const result = await finalizeAttempt(attempt, assessment);
  return NextResponse.json(result);
}
