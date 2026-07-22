import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import { getAssessment } from "@/lib/store/catalog";
import { recordResult } from "@/lib/store/results";
import { levelForScore } from "@/lib/lp-utils";

const submitSchema = z.strictObject({
  answers: z.record(z.string(), z.string().nullable()),
});

/* POST — submit an Exam Readiness attempt. Readiness is captured only by
 * these dedicated assessments, never inferred from content consumption
 * (decision 2026-07-09). Results are what Student Hub's Exam Readiness
 * widget reads via /api/integration/readiness. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  const { assessmentId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessment = await getAssessment(assessmentId);
  if (!assessment || assessment.kind !== "readiness") {
    return NextResponse.json({ error: "Unknown readiness assessment" }, { status: 404 });
  }

  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const questions = assessment.config.questions ?? [];
  const total = questions.length;
  const correctCount = questions.filter(
    (q) => parsed.data.answers[q.id] === q.correctOptionId
  ).length;
  const score = total === 0 ? 0 : correctCount / total;
  const level = levelForScore(assessment.config.levels, score);

  const result = await recordResult({
    studentId: student.id,
    assessmentId,
    score,
    level,
    detail: { correctCount, total },
  });

  return NextResponse.json(
    { id: result.id, score, level, correctCount, total, submittedAt: result.submittedAt },
    { status: 201 }
  );
}
