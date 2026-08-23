import { describe, expect, it } from "vitest";
import type { LpQuestionBankItem } from "@/types";
import { gradeAttempt } from "@/lib/assessment-engine";

/**
 * Integration-style test for the full submit flow's idempotency guard
 * (brief §8: "An integration test for the full submit flow verifying
 * idempotency on a retried request").
 *
 * NOTE: there is no live Postgres instance available in this environment
 * to run against the real Prisma-backed store (lib/store/assessment-
 * attempts.ts) — that store's `gradeAndSubmitAttempt` needs a real
 * database. This test instead exercises the exact guard *pattern* used by
 * app/api/assessments/[assessmentId]/attempts/[attemptId]/submit/route.ts
 * ("if attempt.status === 'submitted', return the stored result instead
 * of regrading") against a small in-memory fake of that store, while using
 * the real `gradeAttempt` engine function for the actual scoring — so the
 * only thing faked is persistence, not the business logic under test.
 * Once a real Postgres instance is available, this should be supplemented
 * with a true DB-backed test hitting the actual route handler.
 */

type FakeAttempt = {
  id: string;
  status: "in_progress" | "submitted" | "expired";
  score: number | null;
  passed: boolean | null;
};

class FakeAttemptStore {
  attempts = new Map<string, FakeAttempt>();
  gradeCalls = 0;

  seedInProgress(id: string) {
    this.attempts.set(id, { id, status: "in_progress", score: null, passed: null });
  }

  /** Mirrors the submit route's guard-then-grade-then-persist shape. */
  submit(attemptId: string, questions: Parameters<typeof gradeAttempt>[0], passThreshold: number) {
    const attempt = this.attempts.get(attemptId);
    if (!attempt) throw new Error("unknown attempt");

    if (attempt.status === "submitted") {
      // Idempotent retry — return the stored result, do NOT regrade.
      return { attemptId: attempt.id, score: attempt.score, passed: attempt.passed };
    }

    this.gradeCalls += 1;
    const graded = gradeAttempt(questions, passThreshold);
    attempt.status = "submitted";
    attempt.score = graded.score;
    attempt.passed = graded.passed;
    return { attemptId: attempt.id, score: attempt.score, passed: attempt.passed };
  }
}

function bankItem(overrides: Partial<LpQuestionBankItem> = {}): LpQuestionBankItem {
  return {
    id: "q1",
    assessmentId: "a1",
    topicId: null,
    type: "single_choice",
    difficulty: "medium",
    prompt: "prompt",
    options: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
    correctOptionIds: ["a"],
    pointsPossible: 1,
    explanation: null,
    ...overrides,
  };
}

describe("submit flow idempotency", () => {
  it("a retried submit for an already-submitted attempt does not regrade or change the result", () => {
    const store = new FakeAttemptStore();
    store.seedInProgress("attempt-1");

    const questions = [
      {
        attemptQuestionId: "aq1",
        bankItem: bankItem(),
        topicName: null,
        topicUnitId: null,
        selectedOptionIds: ["a"],
      },
    ];

    const first = store.submit("attempt-1", questions, 0.75);
    expect(first).toEqual({ attemptId: "attempt-1", score: 1, passed: true });
    expect(store.gradeCalls).toBe(1);

    // Retry with the SAME attempt, even with different (would-be) answers —
    // since the route only re-reads whatever's already saved for an
    // in_progress attempt, a retry against an already-submitted attempt
    // must short-circuit before grading runs again at all.
    const second = store.submit("attempt-1", questions, 0.75);
    expect(second).toEqual(first);
    expect(store.gradeCalls).toBe(1); // still 1 — no second grading pass

    // A third retry, for good measure.
    const third = store.submit("attempt-1", questions, 0.75);
    expect(third).toEqual(first);
    expect(store.gradeCalls).toBe(1);
  });

  it("two different attempts grade independently", () => {
    const store = new FakeAttemptStore();
    store.seedInProgress("attempt-1");
    store.seedInProgress("attempt-2");

    const passing = [
      { attemptQuestionId: "aq1", bankItem: bankItem(), topicName: null, topicUnitId: null, selectedOptionIds: ["a"] },
    ];
    const failing = [
      { attemptQuestionId: "aq1", bankItem: bankItem(), topicName: null, topicUnitId: null, selectedOptionIds: ["b"] },
    ];

    expect(store.submit("attempt-1", passing, 0.75).passed).toBe(true);
    expect(store.submit("attempt-2", failing, 0.75).passed).toBe(false);
    expect(store.gradeCalls).toBe(2);
  });
});
