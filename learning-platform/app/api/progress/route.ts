import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getPrograms } from "@/lib/store/catalog";
import {
  getStudentItems,
  getStudentUnit,
  markItemComplete,
  setUnitStatus,
} from "@/lib/store/progress";
import { awardPoints } from "@/lib/store/points";
import { locateItem, readingItems } from "@/lib/lp-utils";

const completeItemSchema = z.strictObject({
  itemId: z.string().min(1),
});

/* POST — mark a reading item complete and cascade:
 *   item done → all unit readings done → unit "completed" + points award.
 * Knowledge-check items are NOT completed here — passing the KC (via the
 * attempts route) is what flips the unit to "verified". */
export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = completeItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid item" }, { status: 400 });
  }

  const programs = await getPrograms();
  const location = locateItem(programs, parsed.data.itemId);
  if (!location || location.item.type !== "reading") {
    return NextResponse.json({ error: "Unknown reading item" }, { status: 404 });
  }
  const { unit, program } = location;

  await markItemComplete(student.id, parsed.data.itemId);

  const completedIds = new Set(
    (await getStudentItems(student.id)).map((i) => i.itemId)
  );
  const allReadingsDone = readingItems(unit).every((i) => completedIds.has(i.id));

  const existing = await getStudentUnit(student.id, unit.id);
  let pointsAwarded = 0;

  if (allReadingsDone) {
    // Never downgrade verified/retake — those are KC-owned states.
    if (!existing || existing.status === "in_progress") {
      await setUnitStatus(student.id, unit.id, "completed");
    }
    const entry = await awardPoints({
      studentId: student.id,
      sourceType: "unit_completion",
      sourceId: unit.id,
      points: unit.pointsAward,
    });
    pointsAwarded = entry?.points ?? 0;
  } else if (!existing) {
    await setUnitStatus(student.id, unit.id, "in_progress");
  }

  const studentUnit = await getStudentUnit(student.id, unit.id);
  return NextResponse.json({
    ok: true,
    programId: program.id,
    unitId: unit.id,
    unitStatus: studentUnit?.status ?? "in_progress",
    unitCompleted: allReadingsDone,
    pointsAwarded,
  });
}
