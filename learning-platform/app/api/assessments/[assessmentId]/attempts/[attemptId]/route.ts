import { NextResponse } from "next/server";
import { z } from "zod";
import { currentStudent } from "@/lib/current-student";
import {
  getAttemptById,
  getAttemptQuestions,
  saveAnswer,
  touchLastSaved,
} from "@/lib/store/assessment-attempts";

const saveAnswerSchema = z.strictObject({
  attemptQuestionId: z.string().min(1),
  selectedOptionIds: z.array(z.string()),
});

/* PATCH — save an answer during an in-progress attempt (save-and-resume,
 * brief §4). Never returns or stores correctness here — grading only
 * happens at submit. */
export async function PATCH(
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
  if (attempt.status !== "in_progress") {
    return NextResponse.json({ error: "Attempt is no longer in progress" }, { status: 409 });
  }

  const parsed = saveAnswerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  }

  const attemptQuestions = await getAttemptQuestions(attemptId);
  if (!attemptQuestions.some((q) => q.id === parsed.data.attemptQuestionId)) {
    return NextResponse.json(
      { error: "Question does not belong to this attempt" },
      { status: 400 }
    );
  }

  await saveAnswer(parsed.data.attemptQuestionId, parsed.data.selectedOptionIds);
  await touchLastSaved(attemptId);

  return NextResponse.json({ ok: true });
}
