import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import {
  createQuestionReport,
  getAttemptById,
  getAttemptQuestions,
} from "@/lib/store/assessment-attempts";

const reportSchema = z.strictObject({
  questionBankItemId: z.string().min(1),
  detail: z.string().trim().min(1).max(2000),
});

/* POST — file a question-issue report (brief §5.5's end-of-flow reporting
 * screen). Independent of Flag for Review; not tied to attempt status, so a
 * report can still be filed after submission. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string; attemptId: string }> }
) {
  const { assessmentId, attemptId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempt = await getAttemptById(attemptId);
  if (!attempt || attempt.assessmentId !== assessmentId || attempt.studentId !== student.id) {
    return NextResponse.json({ error: "Unknown attempt" }, { status: 404 });
  }

  const parsed = reportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  const attemptQuestions = await getAttemptQuestions(attemptId);
  if (!attemptQuestions.some((q) => q.questionBankItemId === parsed.data.questionBankItemId)) {
    return NextResponse.json(
      { error: "Question does not belong to this attempt" },
      { status: 400 }
    );
  }

  const report = await createQuestionReport({
    attemptId,
    questionBankItemId: parsed.data.questionBankItemId,
    studentId: student.id,
    detail: parsed.data.detail,
  });

  return NextResponse.json({ id: report.id }, { status: 201 });
}
