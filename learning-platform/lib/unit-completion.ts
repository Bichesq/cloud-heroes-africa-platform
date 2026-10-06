import type { LpUnit, StudentUnitStatus } from "@/types";
import { getStudentUnit, setUnitStatus } from "@/lib/store/progress";
import { awardTokens } from "@/lib/store/tokens";

/* Marks a unit's content as read → unit "completed" + its tokens award.
 * Extracted unchanged from app/api/progress/route.ts (2026-09-24) so the
 * topic-progress route runs the exact same cascade once the last topic is
 * done. Knowledge checks are NOT completed here — passing the KC (via the
 * attempts route) is what flips the unit to "verified". Callers must have
 * already passed resolveUnitAccess. */
export async function completeUnitContent(
  studentId: string,
  unit: Pick<LpUnit, "id" | "tokensAward">
): Promise<{ unitStatus: StudentUnitStatus; tokensAwarded: number }> {
  const existing = await getStudentUnit(studentId, unit.id);
  // Never downgrade verified/retake — those are KC-owned states.
  if (!existing || existing.status === "in_progress") {
    await setUnitStatus(studentId, unit.id, "completed");
  }

  const entry = await awardTokens({
    studentId,
    sourceType: "unit_completion",
    sourceId: unit.id,
    tokens: unit.tokensAward,
  });

  const studentUnit = await getStudentUnit(studentId, unit.id);
  return {
    unitStatus: studentUnit?.status ?? "in_progress",
    tokensAwarded: entry?.tokens ?? 0,
  };
}
