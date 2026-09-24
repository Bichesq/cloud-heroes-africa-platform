import type { KcAttempt } from "@/types";

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

/** 2026-09-21 (plan Phase 3): scores against the server-pinned snapshot for
 * this specific attempt (`snapshot`, keyed by attemptQuestionId), not
 * against a KnowledgeCheck's full question list — there's no longer a full
 * list, and re-deriving from the snapshot (rather than trusting whatever
 * question ids the client's `answers` happens to include) is what makes
 * grading authoritative: a client can't shrink/reorder which questions
 * "count" by only submitting a subset. */
export function scoreAttempt(
  snapshot: { attemptQuestionId: string; correctOptionId: string }[],
  passThreshold: number,
  answers: Record<string, string | null>
): AttemptScore {
  const total = snapshot.length;
  const correctCount = snapshot.filter(
    (q) => answers[q.attemptQuestionId] === q.correctOptionId
  ).length;
  const score = total === 0 ? 0 : correctCount / total;
  return { correctCount, total, score, passed: score >= passThreshold };
}

export type AttemptOutcome = "verified" | "retake" | "escalate";

/** What this attempt means for the unit: pass → Competent/Verified; first
 * fail → Retake; second consecutive fail → Retake + team escalation. A pass
 * resets the failure run, so only fails since the last pass count.
 * `previousAttempts` must be submitted attempts only (score/passed non-null)
 * — an in_progress attempt has `passed: null`, which would misread as a
 * fail here. */
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
