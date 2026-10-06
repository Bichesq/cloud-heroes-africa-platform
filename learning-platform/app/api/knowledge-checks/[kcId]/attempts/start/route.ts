import { NextResponse } from "next/server";
import { currentStudent } from "@/lib/current-student";
import { getKcQuestionBank, getKnowledgeCheck } from "@/lib/store/catalog";
import {
  getAttemptQuestionSnapshot,
  getInProgressAttempt,
  startAttempt,
} from "@/lib/store/attempts";
import { selectQuestions } from "@/lib/assessment-engine";
import type { KcAttemptQuestionView } from "@/types";

/* POST — start (or resume) a Knowledge Check attempt (2026-09-21, plan
 * Phase 3). Selects a random subset of the KC's question bank server-side
 * and snapshots it against a new in_progress LpKcAttempt row *before*
 * returning anything to the client, so the submit route can grade against
 * a server-pinned question set instead of trusting whatever the client
 * claims it was shown. An existing in_progress attempt is reused rather
 * than re-randomized, to avoid orphaning attempt rows if a learner starts
 * and never finishes. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ kcId: string }> }
) {
  const { kcId } = await params;
  const student = await currentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kc = await getKnowledgeCheck(kcId);
  if (!kc) return NextResponse.json({ error: "Unknown knowledge check" }, { status: 404 });

  const existing = await getInProgressAttempt(student.id, kcId);
  if (existing) {
    const snapshot = await getAttemptQuestionSnapshot(existing.id);
    return NextResponse.json({
      attemptId: existing.id,
      questions: snapshot.map(toView),
    });
  }

  const bank = await getKcQuestionBank(kcId);
  if (bank.length === 0) {
    return NextResponse.json({ error: "No questions authored for this Knowledge Check" }, { status: 409 });
  }

  const selected = selectQuestions(bank, kc.questionsPerAttempt, {});
  const { attempt, questions } = await startAttempt({
    studentId: student.id,
    kcId,
    questionBankItemIds: selected.map((q) => q.id),
  });

  return NextResponse.json({
    attemptId: attempt.id,
    questions: questions.map(toView),
  });
}

function toView(q: {
  attemptQuestionId: string;
  prompt: string;
  options: unknown;
  correctOptionId: string;
  explanation: string | null;
}): KcAttemptQuestionView {
  return {
    attemptQuestionId: q.attemptQuestionId,
    prompt: q.prompt,
    options: q.options as KcAttemptQuestionView["options"],
    correctOptionId: q.correctOptionId,
    explanation: q.explanation,
  };
}
