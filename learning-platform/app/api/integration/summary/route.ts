import { NextResponse } from "next/server";
import { integrationStudent } from "@/lib/integration-auth";
import { getProgram } from "@/lib/store/catalog";
import { getStudentUnits } from "@/lib/store/progress";
import { getPointsEntries } from "@/lib/store/points";
import { pointsBalance, programStats, resumeUnit } from "@/lib/lp-utils";

/* GET — progress preview for the Student Hub dashboard (requirements §11.1:
 * current unit, units remaining, points). ?email= + x-integration-token. */
export async function GET(request: Request) {
  const student = await integrationStudent(request);
  if (student instanceof NextResponse) return student;

  const program = student.activeProgramId
    ? await getProgram(student.activeProgramId)
    : null;
  if (!program) {
    return NextResponse.json({ programId: null });
  }

  const [studentUnitList, points] = await Promise.all([
    getStudentUnits(student.id),
    getPointsEntries(student.id),
  ]);
  const studentUnits = new Map(studentUnitList.map((u) => [u.unitId, u]));
  const balance = pointsBalance(points);
  const stats = programStats(program, studentUnits);
  const resume = resumeUnit(program, studentUnits, balance);

  return NextResponse.json({
    programId: program.id,
    programTitle: program.title,
    progressPct: stats.progressPct,
    completedUnits: stats.completedUnits,
    verifiedUnits: stats.verifiedUnits,
    unitsRemaining: stats.totalUnits - stats.completedUnits,
    points: balance,
    currentUnit: resume
      ? {
          unitId: resume.unit.id,
          unitTitle: resume.unit.title,
          moduleId: resume.module.id,
          moduleTitle: resume.module.title,
        }
      : null,
  });
}
