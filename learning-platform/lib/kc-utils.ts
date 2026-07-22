import type { KcAttempt, KnowledgeCheck } from "@/types";

/* Pure Knowledge Check scoring + failure-flow math. The retake/escalation
 * policy (fail → "Retake", second fail → notify a team member) is the
 * 2026-05-21 working assumption from the decision log. */

export type AttemptScore = {
  correctCount: number;
  total: number;
  /** Fraction correct, 0..1. */
  score: number;
  passed: boolean;
};

export function scoreAttempt(
  kc: KnowledgeCheck,
  answers: Record<string, string | null>
): AttemptScore {
  const total = kc.questions.length;
  const correctCount = kc.questions.filter(
    (q) => answers[q.id] === q.correctOptionId
  ).length;
  const score = total === 0 ? 0 : correctCount / total;
  return { correctCount, total, score, passed: score >= kc.passThreshold };
}

export type AttemptOutcome = "verified" | "retake" | "escalate";

/** What this attempt means for the unit: pass → Competent/Verified; first
 * fail → Retake; second consecutive fail → Retake + team escalation. A pass
 * resets the failure run, so only fails since the last pass count. */
export function nextAttemptOutcome(
  previousAttempts: KcAttempt[],
  passed: boolean
): AttemptOutcome {
  if (passed) return "verified";
  const ordered = [...previousAttempts].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  let failRun = 0;
  for (const a of ordered) failRun = a.passed ? 0 : failRun + 1;
  return failRun + 1 >= 2 ? "escalate" : "retake";
}
