import { NextResponse } from "next/server";
import { currentStudent } from "@/lib/current-student";
import { getProgram } from "@/lib/store/catalog";
import { getStudentUnits } from "@/lib/store/progress";
import { getPointsEntries } from "@/lib/store/points";
import { pointsBalance, resumeUnit } from "@/lib/lp-utils";

/* Resume redirect — the Student Hub "handshake" target. The hub links here
 * without needing to know LP unit ids; LP resolves the student's current
 * unit from its own progress and forwards to the unit view. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  const { programId } = await params;
  const student = await currentStudent();
  if (!student) {
    return NextResponse.redirect(new URL("/SignIn", request.url));
  }

  const program = await getProgram(programId);
  if (!program) {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  const [studentUnitList, points] = await Promise.all([
    getStudentUnits(student.id),
    getPointsEntries(student.id),
  ]);
  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));

  const resume = resumeUnit(program, studentUnits, pointsBalance(points));
  const target = resume
    ? `/programs/${program.id}/units/${resume.unit.id}`
    : `/programs/${program.id}`;

  return NextResponse.redirect(new URL(target, request.url));
}
