import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getKnowledgeCheck, getPrograms } from "@/lib/store/catalog";
import { getAttempts, recordAttempt } from "@/lib/store/attempts";
import { markItemComplete, setUnitStatus } from "@/lib/store/progress";
import { awardPoints } from "@/lib/store/points";
import { recordEscalation } from "@/lib/store/escalations";
import { nextAttemptOutcome, scoreAttempt } from "@/lib/kc-utils";
import { flattenItems } from "@/lib/lp-utils";

const submitSchema = z.strictObject({
  /** questionId → chosen optionId, null when skipped. */
  answers: z.record(z.string(), z.string().nullable()),
});

/** Flat award for passing a Knowledge Check (unit completion carries the
 * unit's own pointsAward — this is the smaller verification bonus). */
const KC_PASS_POINTS = 5;

/* POST — submit a Knowledge Check attempt. Scoring is authoritative here
 * (the client's per-question feedback is cosmetic). Cascade per the
 * 2026-05-21 failure flow: pass → unit "verified" (+ points); fail →
 * "retake"; second consecutive fail → retake + escalation record so a team
 * member follows up. */
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

  const result = scoreAttempt(kc, parsed.data.answers);
  const previous = await getAttempts(student.id, kcId);
  const outcome = nextAttemptOutcome(previous, result.passed);

  const attempt = await recordAttempt({
    studentId: student.id,
    kcId,
    answers: parsed.data.answers,
    score: result.score,
    passed: result.passed,
  });

  let pointsAwarded = 0;

  if (result.passed) {
    await setUnitStatus(student.id, kc.unitId, "verified");
    const entry = await awardPoints({
      studentId: student.id,
      sourceType: "kc_pass",
      sourceId: kc.id,
      points: KC_PASS_POINTS,
    });
    pointsAwarded = entry?.points ?? 0;

    // The KC item counts toward unit progress once passed.
    const programs = await getPrograms();
    for (const program of programs) {
      for (const module of program.modules) {
        for (const unit of module.units) {
          if (unit.id !== kc.unitId) continue;
          const kcItem = flattenItems(unit).find((i) => i.kcId === kc.id);
          if (kcItem) await markItemComplete(student.id, kcItem.id);
        }
      }
    }
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
    pointsAwarded,
  });
}
