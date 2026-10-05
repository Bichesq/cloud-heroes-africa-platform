import { describe, expect, it } from "vitest";
import {
  assessmentDraftSchema,
  fromBankQuestion,
  fromKcQuestion,
  planQuestionChanges,
  submissionProblems,
  toBankQuestion,
  type AssessmentDraftInput,
  type AssessmentDraftQuestion,
} from "@/lib/assessment-editor";

const ID1 = "11111111-1111-4111-8111-111111111111";
const ID2 = "22222222-2222-4222-8222-222222222222";
const TOPIC = "33333333-3333-4333-8333-333333333333";

const q = (over: Partial<AssessmentDraftQuestion> = {}): AssessmentDraftQuestion => ({
  type: "single_choice",
  difficulty: "easy",
  prompt: "Which routes reach the internet?",
  options: ["IGW", "NAT", "Peering", "None"],
  correctIndexes: [0],
  explanation: "",
  points: 15,
  topicId: TOPIC,
  ...over,
});
const draft = (over: Partial<AssessmentDraftInput> = {}): AssessmentDraftInput => ({
  title: "Module 2 Core Assessment",
  description: "",
  passPercent: 80,
  maxAttempts: 3,
  timeLimitMinutes: 45,
  mix: { easy: 1, medium: 0, difficult: 0 },
  questions: [q()],
  ...over,
});

describe("assessmentDraftSchema", () => {
  it("accepts the Figma's example values, and null for unlimited / untimed", () => {
    expect(assessmentDraftSchema.safeParse(draft()).success).toBe(true);
    expect(assessmentDraftSchema.safeParse(draft({ maxAttempts: null, timeLimitMinutes: null })).success).toBe(true);
  });

  it("single choice needs exactly one correct answer; multi-select at least two", () => {
    expect(assessmentDraftSchema.safeParse(draft({ questions: [q({ correctIndexes: [0, 1] })] })).success).toBe(false);
    expect(assessmentDraftSchema.safeParse(draft({ questions: [q({ type: "multi_select", correctIndexes: [0] })] })).success).toBe(false);
    expect(assessmentDraftSchema.safeParse(draft({ questions: [q({ type: "multi_select", correctIndexes: [0, 2] })] })).success).toBe(true);
    expect(assessmentDraftSchema.safeParse(draft({ questions: [q({ correctIndexes: [7] })] })).success).toBe(false);
  });

  it("rejects Code questions (7d), bad limits, unknown keys and non-uuid ids", () => {
    expect(assessmentDraftSchema.safeParse(draft({ questions: [q({ type: "code" as never })] })).success).toBe(false);
    expect(assessmentDraftSchema.safeParse(draft({ maxAttempts: 0 })).success).toBe(false);
    expect(assessmentDraftSchema.safeParse(draft({ timeLimitMinutes: 0 })).success).toBe(false);
    expect(assessmentDraftSchema.safeParse(draft({ passPercent: 0 })).success).toBe(false);
    expect(assessmentDraftSchema.safeParse({ ...draft(), status: "published" }).success).toBe(false);
    expect(assessmentDraftSchema.safeParse(draft({ questions: [q({ topicId: "VPC Routing" })] })).success).toBe(false);
  });
});

describe("submissionProblems (complete-before-review)", () => {
  it("a complete draft has none", () => {
    expect(submissionProblems(draft())).toEqual({});
  });

  it("needs questions and a non-empty draw", () => {
    expect(submissionProblems(draft({ questions: [] }))).toHaveProperty("questions");
    expect(submissionProblems(draft({ mix: { easy: 0, medium: 0, difficult: 0 } }))).toHaveProperty("mix");
  });

  it("each difficulty's draw can't exceed the questions written at that difficulty", () => {
    const p = submissionProblems(draft({ mix: { easy: 1, medium: 2, difficult: 0 } }));
    expect(p["mix.medium"]).toBe("An attempt draws 2 medium questions, but only 0 are written.");
  });
});

describe("bank mapping + plan", () => {
  it("round-trips multi-select correct answers", () => {
    const multi = q({ type: "multi_select", correctIndexes: [2, 0] });
    const stored = toBankQuestion(multi);
    expect(stored.correctOptionIds).toEqual(["a", "c"]);
    expect(fromBankQuestion(ID1, stored)).toEqual({ ...multi, correctIndexes: [0, 2], bankItemId: ID1 });
  });

  it("never edits a used question; difficulty and Module Area changes count as changes", () => {
    const live = [
      { id: ID1, question: toBankQuestion(q({ prompt: "One" })) },
      { id: ID2, question: toBankQuestion(q({ prompt: "Two" })) },
    ];
    const plan = planQuestionChanges(
      live,
      [q({ bankItemId: ID1, prompt: "One", difficulty: "difficult" }), q({ bankItemId: ID2, prompt: "Two", topicId: null })],
      new Set([ID1]),
    );
    expect(plan.retireAndReplace.map((r) => r.id)).toEqual([ID1]);
    expect(plan.updateInPlace.map((r) => r.id)).toEqual([ID2]);
  });

  it("removed: retired if used, deleted otherwise", () => {
    const live = [
      { id: ID1, question: toBankQuestion(q({ prompt: "One" })) },
      { id: ID2, question: toBankQuestion(q({ prompt: "Two" })) },
    ];
    const plan = planQuestionChanges(live, [], new Set([ID2]));
    expect(plan.retire).toEqual([ID2]);
    expect(plan.remove).toEqual([ID1]);
  });

  it("importing a KC question copies it as a medium single-choice question", () => {
    const copy = fromKcQuestion(
      { prompt: "VMs?", options: [{ id: "a", label: "Lambda" }, { id: "b", label: "EC2" }], correctOptionId: "b", explanation: null, points: 10 },
      TOPIC,
    );
    expect(copy).toEqual({ type: "single_choice", difficulty: "medium", prompt: "VMs?", options: ["Lambda", "EC2"], correctIndexes: [1], explanation: "", points: 10, topicId: TOPIC });
    expect(copy).not.toHaveProperty("bankItemId");
  });
});
