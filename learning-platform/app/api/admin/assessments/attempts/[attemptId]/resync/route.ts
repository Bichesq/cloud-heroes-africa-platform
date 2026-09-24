import { NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/admin-auth";
import { getAttemptById } from "@/lib/store/assessment-attempts";
import { getStandaloneAssessment } from "@/lib/store/standalone-assessments";
import { finalizeAttempt } from "@/lib/assessment-submission";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* POST — Phase 2 step 3 (admin-safe manual resync action, mutating half).
 *
 * The real failure mode behind "automatic progress trigger didn't fire"
 * (requirements §8) isn't a missing/racy unlock write — module unlock is
 * read-computed straight from LpAssessmentAttempt.passed (see
 * lib/lp-utils.ts#moduleGates), and that field is already written
 * atomically by gradeAndSubmitAttempt. The one place a student can
 * genuinely end up "should have passed but the system doesn't know it" is
 * an attempt that never successfully reached the submit route at all — a
 * dropped request, a crashed tab, an abandoned session past the time limit
 * with no client left to call submit. That attempt sits in `in_progress`
 * (or gets swept to `expired` on a later resume-time check) forever,
 * un-graded, and every module gate downstream of it stays locked.
 *
 * This action force-finalizes that attempt using whatever answers were
 * already saved, through the EXACT SAME grade-and-submit path a normal
 * submit would have used (lib/assessment-submission.ts#finalizeAttempt) —
 * so a resync can't produce a different result than the student's own
 * submit would have. Idempotent: calling it on an already-submitted
 * attempt just returns the stored result (finalizeAttempt's own guard) and
 * is safe to run repeatedly. An `expired` attempt is force-graded here
 * deliberately — expiry only marks an attempt abandoned at resume-time, it
 * was never itself graded, so this is the intended way to recover it. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const authError = requireAdminAuth(request);
  if (authError) return authError;

  const { attemptId } = await params;
  if (!UUID_RE.test(attemptId)) {
    return NextResponse.json({ error: "attemptId must be a UUID" }, { status: 400 });
  }

  const attempt = await getAttemptById(attemptId);
  if (!attempt) return NextResponse.json({ error: "Unknown attempt" }, { status: 404 });

  const assessment = await getStandaloneAssessment(attempt.assessmentId);
  if (!assessment) {
    return NextResponse.json({ error: "Unknown assessment for this attempt" }, { status: 404 });
  }

  // finalizeAttempt only special-cases `status === "submitted"`; both
  // `in_progress` and `expired` fall through to the same grade-and-submit
  // path, which is exactly what an `expired` (abandoned, never graded)
  // attempt needs here.
  const result = await finalizeAttempt(attempt, assessment);
  return NextResponse.json(result);
}
