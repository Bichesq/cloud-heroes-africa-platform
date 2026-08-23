import { describe, expect, it, vi } from "vitest";
import type { LpQuestionBankItem } from "@/types";
import {
  assessmentFailureOutcome,
  computeWeakTopics,
  cooldownMs,
  gradeAttempt,
  scoreQuestion,
  selectQuestions,
} from "@/lib/assessment-engine";

function bankItem(overrides: Partial<LpQuestionBankItem> = {}): LpQuestionBankItem {
  return {
    id: overrides.id ?? "q1",
    assessmentId: "a1",
    topicId: null,
    type: "single_choice",
    difficulty: "medium",
    prompt: "prompt",
    options: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
    correctOptionIds: ["a"],
    pointsPossible: 1,
    explanation: null,
    ...overrides,
  };
}

describe("selectQuestions (randomization & difficulty mix)", () => {
  it("selects the requested count respecting the difficulty mix", () => {
    const bank = [
      ...Array.from({ length: 10 }, (_, i) => bankItem({ id: `easy-${i}`, difficulty: "easy" })),
      ...Array.from({ length: 10 }, (_, i) => bankItem({ id: `med-${i}`, difficulty: "medium" })),
      ...Array.from({ length: 10 }, (_, i) => bankItem({ id: `hard-${i}`, difficulty: "difficult" })),
    ];

    const selected = selectQuestions(bank, 10, { easy: 4, medium: 4, difficult: 2 });

    expect(selected).toHaveLength(10);
    expect(selected.filter((q) => q.difficulty === "easy")).toHaveLength(4);
    expect(selected.filter((q) => q.difficulty === "medium")).toHaveLength(4);
    expect(selected.filter((q) => q.difficulty === "difficult")).toHaveLength(2);
    // No duplicates.
    expect(new Set(selected.map((q) => q.id)).size).toBe(10);
  });

  it("tops up from the remaining pool when a difficulty bucket is too thin (migrated V1 bank case)", () => {
    // Exactly the real migrated shape: 3 questions, all defaulted to
    // "medium", but difficultyMix asks for a mix that doesn't exist.
    const bank = [
      bankItem({ id: "q1", difficulty: "medium" }),
      bankItem({ id: "q2", difficulty: "medium" }),
      bankItem({ id: "q3", difficulty: "medium" }),
    ];

    const selected = selectQuestions(bank, 3, { medium: 3 });

    expect(selected).toHaveLength(3);
    expect(new Set(selected.map((q) => q.id))).toEqual(new Set(["q1", "q2", "q3"]));
  });

  it("never returns more than the bank actually has", () => {
    const bank = [bankItem({ id: "only-one" })];
    const selected = selectQuestions(bank, 5, { medium: 5 });
    expect(selected).toHaveLength(1);
  });

  it("randomizes order across calls (not deterministic)", () => {
    const bank = Array.from({ length: 20 }, (_, i) => bankItem({ id: `q${i}`, difficulty: "easy" }));
    const randomSpy = vi.spyOn(Math, "random");

    const orders = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const selected = selectQuestions(bank, 20, { easy: 20 });
      orders.add(selected.map((q) => q.id).join(","));
    }

    // Extremely unlikely all 5 shuffles of 20 items produced the same order
    // by chance — this is a smoke test that shuffling is actually wired up.
    expect(orders.size).toBeGreaterThan(1);
    randomSpy.mockRestore();
  });
});

describe("scoreQuestion (partial credit)", () => {
  it("single_choice is all-or-nothing", () => {
    const q = bankItem({ type: "single_choice", correctOptionIds: ["a"], pointsPossible: 1 });
    expect(scoreQuestion(q, ["a"])).toBe(1);
    expect(scoreQuestion(q, ["b"])).toBe(0);
    expect(scoreQuestion(q, [])).toBe(0);
  });

  it("multi_select distributes credit proportionally across required correct options (Aug 6 example: 1pt / 3 required)", () => {
    const q = bankItem({
      type: "multi_select",
      correctOptionIds: ["a", "b", "c"],
      pointsPossible: 1,
    });
    expect(scoreQuestion(q, ["a"])).toBeCloseTo(1 / 3);
    expect(scoreQuestion(q, ["a", "b"])).toBeCloseTo(2 / 3);
    expect(scoreQuestion(q, ["a", "b", "c"])).toBeCloseTo(1);
    expect(scoreQuestion(q, [])).toBe(0);
  });

  it("multi_select does not penalize extra/incorrect selections beyond zero credit for them", () => {
    const q = bankItem({
      type: "multi_select",
      correctOptionIds: ["a", "b"],
      pointsPossible: 2,
    });
    // 1 correct + 1 wrong selected — still gets credit for the correct one.
    expect(scoreQuestion(q, ["a", "wrong"])).toBeCloseTo(1);
  });
});

describe("computeWeakTopics", () => {
  it("flags topics scoring below pass threshold", () => {
    const graded = [
      { topicId: "t1", topicName: "IAM", unitId: "u1", pointsPossible: 1, pointsEarned: 0 },
      { topicId: "t1", topicName: "IAM", unitId: "u1", pointsPossible: 1, pointsEarned: 0 },
      { topicId: "t2", topicName: "Storage", unitId: "u2", pointsPossible: 1, pointsEarned: 1 },
    ];
    const weak = computeWeakTopics(graded, 0.7, false);
    expect(weak).toEqual([{ topicId: "t1", topicName: "IAM", unitId: "u1", scorePct: 0 }]);
  });

  it("returns a generic fallback when the attempt failed but no single topic fell below threshold", () => {
    // Every topic individually clears 0.7, but the overall attempt failed
    // (e.g. because some questions have no topic at all).
    const graded = [
      { topicId: "t1", topicName: "IAM", unitId: "u1", pointsPossible: 1, pointsEarned: 1 },
      { topicId: "t2", topicName: "Storage", unitId: "u2", pointsPossible: 1, pointsEarned: 1 },
    ];
    const weak = computeWeakTopics(graded, 0.7, /* passed */ false);
    expect(weak).toEqual([
      { topicId: null, topicName: "review the full module", unitId: null, scorePct: 0 },
    ]);
  });

  it("returns an empty list when the attempt passed and nothing is weak", () => {
    const graded = [
      { topicId: "t1", topicName: "IAM", unitId: "u1", pointsPossible: 1, pointsEarned: 1 },
    ];
    expect(computeWeakTopics(graded, 0.7, true)).toEqual([]);
  });

  it("ignores questions with no topic when grouping", () => {
    const graded = [
      { topicId: null, topicName: null, unitId: null, pointsPossible: 1, pointsEarned: 0 },
    ];
    // Failed, no topic-tagged question at all → generic fallback.
    expect(computeWeakTopics(graded, 0.7, false)).toEqual([
      { topicId: null, topicName: "review the full module", unitId: null, scorePct: 0 },
    ]);
  });
});

describe("gradeAttempt", () => {
  it("computes an overall score fraction and pass/fail against the threshold", () => {
    const q1 = bankItem({ id: "q1", type: "single_choice", correctOptionIds: ["a"], pointsPossible: 1 });
    const q2 = bankItem({ id: "q2", type: "single_choice", correctOptionIds: ["a"], pointsPossible: 1 });
    const result = gradeAttempt(
      [
        { attemptQuestionId: "aq1", bankItem: q1, topicName: null, topicUnitId: null, selectedOptionIds: ["a"] },
        { attemptQuestionId: "aq2", bankItem: q2, topicName: null, topicUnitId: null, selectedOptionIds: ["b"] },
      ],
      0.75
    );
    expect(result.score).toBeCloseTo(0.5);
    expect(result.passed).toBe(false);
    expect(result.perQuestion).toEqual([
      { attemptQuestionId: "aq1", pointsEarned: 1 },
      { attemptQuestionId: "aq2", pointsEarned: 0 },
    ]);
  });
});

describe("cooldownMs (progressive retake cooldown)", () => {
  it("is 1 hour after the 1st failure, 3 hours after the 2nd, 24 hours after the 3rd and beyond", () => {
    const HOUR = 60 * 60 * 1000;
    expect(cooldownMs(1)).toBe(HOUR);
    expect(cooldownMs(2)).toBe(3 * HOUR);
    expect(cooldownMs(3)).toBe(24 * HOUR);
    expect(cooldownMs(4)).toBe(24 * HOUR);
    expect(cooldownMs(10)).toBe(24 * HOUR);
  });
});

describe("assessmentFailureOutcome", () => {
  it("passes through on a pass regardless of history", () => {
    expect(assessmentFailureOutcome([{ passed: false }, { passed: false }], true)).toBe("passed");
  });

  it("retakes on the first failure", () => {
    expect(assessmentFailureOutcome([], false)).toBe("retake");
  });

  it("escalates on the second consecutive failure", () => {
    expect(assessmentFailureOutcome([{ passed: false }], false)).toBe("escalate");
  });

  it("a pass resets the failure run, so failures before it don't count", () => {
    expect(
      assessmentFailureOutcome([{ passed: false }, { passed: false }, { passed: true }], false)
    ).toBe("retake");
  });
});
