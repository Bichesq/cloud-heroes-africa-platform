import { describe, expect, it } from "vitest";
import {
  fromBankQuestion,
  kcDraftSchema,
  planQuestionChanges,
  sameQuestion,
  toBankQuestion,
  type BankQuestion,
  type KcDraftQuestion,
} from "@/lib/kc-editor";

const ID1 = "11111111-1111-4111-8111-111111111111";
const ID2 = "22222222-2222-4222-8222-222222222222";
const ID3 = "33333333-3333-4333-8333-333333333333";

const q = (over: Partial<KcDraftQuestion> = {}): KcDraftQuestion => ({
  prompt: "Which service provides VMs?",
  options: ["Lambda", "ECS", "EC2", "Fargate"],
  correctIndex: 2,
  explanation: "EC2 provides virtual machines.",
  points: 10,
  ...over,
});
const draft = (questions: KcDraftQuestion[], over: Record<string, unknown> = {}) => ({
  title: "Cloud check",
  passPercent: 70,
  questionsPerAttempt: Math.min(1, questions.length) || 1,
  questions,
  ...over,
});

describe("kcDraftSchema", () => {
  it("accepts a valid draft and trims text", () => {
    const r = kcDraftSchema.safeParse(draft([q({ prompt: "  Trim me  " })]));
    expect(r.success && r.data.questions[0].prompt).toBe("Trim me");
  });

  it("requires at least one question, 2–6 options, a valid correct answer and distinct options", () => {
    expect(kcDraftSchema.safeParse(draft([], { questionsPerAttempt: 1 })).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ options: ["Only one"], correctIndex: 0 })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ options: ["a", "b", "c", "d", "e", "f", "g"] })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ correctIndex: 4 })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ options: ["EC2", "ec2"], correctIndex: 0 })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ options: ["", "x"], correctIndex: 1 })])).success).toBe(false);
  });

  it("reports empty options as empty, not as duplicates", () => {
    const r = kcDraftSchema.safeParse(draft([q({ options: ["S3", "EBS", "", ""], correctIndex: 0 })]));
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.map((i) => i.message)).not.toContain("Answer options must be different from each other.");
  });

  it("bounds weights, pass threshold and questions per attempt", () => {
    expect(kcDraftSchema.safeParse(draft([q({ points: 0 })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ points: 101 })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q()], { passPercent: 0 })).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q()], { passPercent: 101 })).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q()], { questionsPerAttempt: 2 })).success).toBe(false);
  });

  it("rejects unknown keys, bad ids, duplicate questions and control characters", () => {
    expect(kcDraftSchema.safeParse({ ...draft([q()]), kcId: "x" }).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ bankItemId: "not-a-uuid" })])).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ bankItemId: ID1 }), q({ bankItemId: ID1, prompt: "other" })], { questionsPerAttempt: 1 })).success).toBe(false);
    expect(kcDraftSchema.safeParse(draft([q({ prompt: "bad\u0000" })])).success).toBe(false);
  });
});

describe("bank question mapping", () => {
  it("assigns option ids a, b, c… by position and round-trips", () => {
    const stored = toBankQuestion(q());
    expect(stored.options.map((o) => o.id)).toEqual(["a", "b", "c", "d"]);
    expect(stored.correctOptionId).toBe("c");
    expect(fromBankQuestion(ID1, stored)).toEqual({ ...q(), bankItemId: ID1 });
  });

  it("stores an empty explanation as null", () => {
    expect(toBankQuestion(q({ explanation: "" })).explanation).toBeNull();
  });

  it("sameQuestion notices any change that affects showing or scoring", () => {
    const base = toBankQuestion(q());
    expect(sameQuestion(base, toBankQuestion(q()))).toBe(true);
    for (const change of [{ prompt: "x" }, { correctIndex: 0 }, { points: 5 }, { explanation: "y" }, { options: ["Lambda", "ECS", "EC2"] }]) {
      expect(sameQuestion(base, toBankQuestion(q(change as Partial<KcDraftQuestion>)))).toBe(false);
    }
  });
});

describe("planQuestionChanges", () => {
  const live: { id: string; question: BankQuestion }[] = [
    { id: ID1, question: toBankQuestion(q({ prompt: "One" })) },
    { id: ID2, question: toBankQuestion(q({ prompt: "Two" })) },
    { id: ID3, question: toBankQuestion(q({ prompt: "Three" })) },
  ];

  it("never edits a used question: changed used → retire and replace; changed unused → update in place", () => {
    const plan = planQuestionChanges(
      live,
      [q({ bankItemId: ID1, prompt: "One (edited)" }), q({ bankItemId: ID2, prompt: "Two (edited)" }), q({ bankItemId: ID3, prompt: "Three" })],
      new Set([ID1]),
    );
    expect(plan.retireAndReplace.map((r) => r.id)).toEqual([ID1]);
    expect(plan.updateInPlace.map((r) => r.id)).toEqual([ID2]);
    expect(plan.unchanged).toEqual([ID3]);
    expect(plan.create).toEqual([]);
  });

  it("removed questions: retired if used, deleted otherwise; new ones created", () => {
    const plan = planQuestionChanges(live, [q({ bankItemId: ID3, prompt: "Three" }), q({ prompt: "Brand new" })], new Set([ID1]));
    expect(plan.retire).toEqual([ID1]);
    expect(plan.remove).toEqual([ID2]);
    expect(plan.create.map((c) => c.prompt)).toEqual(["Brand new"]);
  });

  it("an id that isn't a live question (e.g. already retired) is treated as new", () => {
    const plan = planQuestionChanges([], [q({ bankItemId: ID1 })], new Set([ID1]));
    expect(plan.create).toHaveLength(1);
    expect(plan.retire).toEqual([]);
  });
});
