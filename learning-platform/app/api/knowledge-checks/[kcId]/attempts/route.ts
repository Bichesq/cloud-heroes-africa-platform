import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getKnowledgeCheck } from "@/lib/store/catalog";
import {
  getAttemptById,
  getAttemptQuestionSnapshot,
  getAttempts,
  submitAttempt,
} from "@/lib/store/attempts";
import { setUnitStatus } from "@/lib/store/progress";
import { awardTokens } from "@/lib/store/tokens";
import { recordEscalation } from "@/lib/store/escalations";
import { nextAttemptOutcome, scoreAttempt } from "@/lib/kc-utils";

const submitSchema = z.strictObject({
  attemptId: z.string().uuid(),
  /** attemptQuestionId → chosen optionId, null when skipped. */
  answers: z.record(z.string(), z.string().nullable()),
});

/** Flat award for passing a Knowledge Check (unit completion carries the
 * unit's own tokensAward — this is the smaller verification bonus). Renamed
 * from KC_PASS_POINTS per §1. */
const KC_PASS_TOKENS = 5;

/* POST — submit a Knowledge Check attempt (2026-09-21: now against an
 * attempt started via .../attempts/start, not a bare answer blob). Scoring
 * is authoritative here, computed against the attempt's own server-pinned
 * question snapshot (kc-utils#scoreAttempt) — the client's per-question
 * feedback during the attempt is cosmetic and never trusted for grading.
 * Cascade per the 2026-05-21 failure flow: pass → unit "verified" (+
 * tokens); fail → "retake"; second consecutive fail → retake + escalation
 * record so a team member follows up.
 * (2026-08-11: no more per-item completion to mark on pass — the KC's own
 * attempt record is the only signal needed now that Section/Item are gone.) */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ kcId: string }> }
) {
  const { kcId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kc = await getKnowledgeCheck(kcId);
  if (!kc) return NextResponse.json({ error: "Unknown knowledge check" }, { status: 404 });

  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  // Ownership + state checks (SECURITY.md §3 — attemptId is attacker-
  // controlled; verify it belongs to this student, this KC, and is still
  // open, not just that the caller is authenticated).
  const attempt = await getAttemptById(parsed.data.attemptId);
  if (!attempt || attempt.studentId !== student.id || attempt.kcId !== kcId) {
    return NextResponse.json({ error: "Unknown attempt" }, { status: 404 });
  }
  if (attempt.status !== "in_progress") {
    return NextResponse.json({ error: "Attempt already submitted" }, { status: 409 });
  }

  const snapshot = await getAttemptQuestionSnapshot(attempt.id);
  const result = scoreAttempt(snapshot, kc.passThreshold, parsed.data.answers);
  const previous = await getAttempts(student.id, kcId);
  const outcome = nextAttemptOutcome(previous, result.passed);

  await submitAttempt(attempt.id, {
    answers: parsed.data.answers,
    score: result.score,
    passed: result.passed,
  });

  let tokensAwarded = 0;

  if (result.passed) {
    await setUnitStatus(student.id, kc.unitId, "verified");
    const entry = await awardTokens({
      studentId: student.id,
      sourceType: "kc_pass",
      sourceId: kc.id,
      tokens: KC_PASS_TOKENS,
    });
    tokensAwarded = entry?.tokens ?? 0;
  } else {
    await setUnitStatus(student.id, kc.unitId, "retake");
    if (outcome === "escalate") {
      await recordEscalation({
        studentId: student.id,
        kind: "kc_second_failure",
        refId: kc.id,
        payload: { unitId: kc.unitId, attemptCount: attempt.attemptNo },
      });
    }
  }

  return NextResponse.json({
    attemptNo: attempt.attemptNo,
    correctCount: result.correctCount,
    total: result.total,
    score: result.score,
    passed: result.passed,
    outcome,
    unitStatus: result.passed ? "verified" : "retake",
    tokensAwarded,
  });
}
