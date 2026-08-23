import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getPrograms } from "@/lib/store/catalog";
import { getStudentUnit, setUnitStatus } from "@/lib/store/progress";
import { awardTokens } from "@/lib/store/tokens";
import { locateUnit } from "@/lib/lp-utils";

const completeUnitSchema = z.strictObject({
  unitId: z.string().min(1),
});

/* POST — mark a unit's content as read, cascading to unit "completed" +
 * tokens award. (2026-08-11: Section/Item are gone — there is no more
 * per-item cascade to check; the client now signals "this unit's content
 * is done" directly by unitId. See plan Ambiguity #2 — this is a judgment
 * call, not a literal spec, since no leaf-level tracking survives the
 * Section/Item removal.)
 * Knowledge checks are NOT completed here — passing the KC (via the
 * attempts route) is what flips the unit to "verified". */
export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = completeUnitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid unit" }, { status: 400 });
  }

  const programs = await getPrograms();
  const location = locateUnit(programs, parsed.data.unitId);
  if (!location) {
    return NextResponse.json({ error: "Unknown unit" }, { status: 404 });
  }
  const { unit, program } = location;

  const existing = await getStudentUnit(student.id, unit.id);
  // Never downgrade verified/retake — those are KC-owned states.
  if (!existing || existing.status === "in_progress") {
    await setUnitStatus(student.id, unit.id, "completed");
  }

  const entry = await awardTokens({
    studentId: student.id,
    sourceType: "unit_completion",
    sourceId: unit.id,
    tokens: unit.tokensAward,
  });

  const studentUnit = await getStudentUnit(student.id, unit.id);
  return NextResponse.json({
    ok: true,
    programId: program.id,
    unitId: unit.id,
    unitStatus: studentUnit?.status ?? "in_progress",
    tokensAwarded: entry?.tokens ?? 0,
  });
}
