import { describe, expect, it } from "vitest";
import type { KcAttempt, KcQuestionBankItem } from "@/types";
import { selectQuestions } from "@/lib/assessment-engine";
import { nextAttemptOutcome, scoreAttempt } from "@/lib/kc-utils";

/* Phase 3 (2026-09-21): KC question bank + randomization. Covers the two
 * pieces that changed — selectQuestions reused generically for KC bank
 * items (uniform random, no difficulty weighting), and scoreAttempt's new
 * snapshot-based signature (grades against what was actually pinned for the
 * attempt, not a KnowledgeCheck's full list). */

function bankItem(overrides: Partial<KcQuestionBankItem> = {}): KcQuestionBankItem {
  return {
    id: overrides.id ?? "q1",
    kcId: "kc1",
    difficulty: "medium",
    prompt: "prompt",
    options: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
    correctOptionId: "a",
    explanation: null,
    ...overrides,
  };
}

describe("selectQuestions reused for KC banks (uniform random, no difficulty mix)", () => {
  it("selects the requested count with no duplicates when difficultyMix is empty", () => {
    const bank = Array.from({ length: 15 }, (_, i) => bankItem({ id: `q${i}` }));

    const selected = selectQuestions(bank, 10, {});

    expect(selected).toHaveLength(10);
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
  });

  it("returns the whole bank, not an error, when the bank is smaller than questionsPerAttempt", () => {
    const bank = Array.from({ length: 3 }, (_, i) => bankItem({ id: `q${i}` }));

    const selected = selectQuestions(bank, 10, {});

    expect(selected).toHaveLength(3);
  });

  it("draws different subsets across repeated selections from a large bank", () => {
    const bank = Array.from({ length: 50 }, (_, i) => bankItem({ id: `q${i}` }));

    const draws = Array.from({ length: 10 }, () =>
      selectQuestions(bank, 10, {})
        .map((q) => q.id)
        .sort()
        .join(",")
    );

    // Astronomically unlikely all 10 draws of 10-from-50 are identical.
    expect(new Set(draws).size).toBeGreaterThan(1);
  });
});

describe("scoreAttempt (snapshot-based grading)", () => {
  const snapshot = [
    { attemptQuestionId: "aq1", correctOptionId: "a" },
    { attemptQuestionId: "aq2", correctOptionId: "b" },
    { attemptQuestionId: "aq3", correctOptionId: "a" },
    { attemptQuestionId: "aq4", correctOptionId: "c" },
  ];

  it("scores against the snapshot, ignoring extra answer keys not in it", () => {
    const result = scoreAttempt(snapshot, 0.75, {
      aq1: "a",
      aq2: "b",
      aq3: "a",
      aq4: "wrong",
      // A client-submitted id that was never part of this attempt's
      // snapshot must not inflate the denominator or be gradeable.
      "forged-extra-id": "a",
    });

    expect(result.correctCount).toBe(3);
    expect(result.total).toBe(4);
    expect(result.score).toBe(0.75);
    expect(result.passed).toBe(true);
  });

  it("treats a missing/skipped answer as incorrect, not a pass-through", () => {
    const result = scoreAttempt(snapshot, 0.5, { aq1: "a", aq2: null });

    expect(result.correctCount).toBe(1);
    expect(result.total).toBe(4);
    expect(result.passed).toBe(false);
  });

  it("fails closed on an empty snapshot rather than dividing by zero into a pass", () => {
    const result = scoreAttempt([], 0.5, {});
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
  });
});

describe("nextAttemptOutcome (submitted-attempts-only contract)", () => {
  function submittedAttempt(passed: boolean, createdAt: string): KcAttempt {
    return {
      id: "a",
      studentId: "s1",
      kcId: "kc1",
      attemptNo: 1,
      status: "submitted",
      answers: {},
      score: passed ? 1 : 0,
      passed,
      createdAt,
      submittedAt: createdAt,
    };
  }

  it("escalates on a second consecutive failure", () => {
    const previous = [submittedAttempt(false, "2026-01-01T00:00:00Z")];
    expect(nextAttemptOutcome(previous, false)).toBe("escalate");
  });

  it("resets the fail run after a pass", () => {
    const previous = [
      submittedAttempt(false, "2026-01-01T00:00:00Z"),
      submittedAttempt(true, "2026-01-02T00:00:00Z"),
    ];
    expect(nextAttemptOutcome(previous, false)).toBe("retake");
  });
});
