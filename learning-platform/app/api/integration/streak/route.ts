import { NextResponse } from "next/server";
import { integrationStudent } from "@/lib/integration-auth";
import { getGoals } from "@/lib/store/goals";
import { getStudentUnits } from "@/lib/store/progress";
import { goalsStreak } from "@/lib/lp-utils";

/* GET — Goals Meeting Streak data for the Student Hub widget (requirements
 * §7): consecutive deadlines met, with per-goal history for trends. */
export async function GET(request: Request) {
  const student = await integrationStudent(request);
  if (student instanceof NextResponse) return student;

  const [goals, studentUnitList] = await Promise.all([
    getGoals(student.id),
    getStudentUnits(student.id),
  ]);
  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));
  const today = new Date().toISOString().slice(0, 10);

  return NextResponse.json(goalsStreak(goals, studentUnits, today));
}
