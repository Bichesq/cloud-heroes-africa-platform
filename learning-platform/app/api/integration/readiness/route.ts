import { NextResponse } from "next/server";
import { integrationStudent } from "@/lib/integration-auth";
import { getReadinessAssessments } from "@/lib/store/catalog";
import { getResults } from "@/lib/store/readiness-results";
import { latestReadiness } from "@/lib/lp-utils";

/* GET — Exam Readiness data for the Student Hub widget (requirements §8):
 * latest score/level per readiness assessment of the student's active
 * program, plus history for trend rendering. */
export async function GET(request: Request) {
  const student = await integrationStudent(request);
  if (student instanceof NextResponse) return student;

  if (!student.activeProgramId) {
    return NextResponse.json({ assessments: [] });
  }

  const assessments = await getReadinessAssessments(student.activeProgramId);
  const payload = await Promise.all(
    assessments.map(async (a) => {
      const summary = latestReadiness(await getResults(student.id, a.id));
      return {
        assessmentId: a.id,
        title: a.title,
        latest: summary.latest,
        history: summary.history,
      };
    })
  );

  return NextResponse.json({
    programId: student.activeProgramId,
    assessments: payload,
  });
}
