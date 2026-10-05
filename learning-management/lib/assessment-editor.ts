import { z } from "zod";

/* Module Assessment editor rules (plan §11). Pure — unit-tested.
 *
 * Same principle as Knowledge Checks (lib/kc-editor.ts): attempts point at
 * bank questions by id and are graded against the live question, so a
 * question any attempt has used is never changed — an approved edit retires
 * it and creates a replacement. */

const noControlChars = (s: string) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s);
const text = (max: number, label: string, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label} can't be empty.`)
    .max(max, `${label} must be ${max.toLocaleString("en-US")} characters or fewer.`)
    .refine(noControlChars, `${label} contains unsupported characters.`);

export const MAX_QUESTIONS = 200;
export const OPTION_IDS = ["a", "b", "c", "d", "e", "f"] as const;
export const DIFFICULTIES = ["easy", "medium", "difficult"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
/** Code questions stay out of V1 authoring (decision 7d). */
export const QUESTION_TYPES = ["single_choice", "multi_select"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

const questionSchema = z
  .strictObject({
    bankItemId: z.uuid().optional(),
    type: z.enum(QUESTION_TYPES),
    difficulty: z.enum(DIFFICULTIES),
    prompt: text(1000, "Question text"),
    options: z.array(text(300, "An answer option")).min(2, "Give at least 2 answer options.").max(6, "Use at most 6 answer options."),
    correctIndexes: z.array(z.number().int().min(0)).min(1, "Mark at least one correct answer."),
    explanation: text(2000, "The explanation", 0),
    points: z.number().int().min(1, "Weight must be at least 1 point.").max(100, "Weight can be at most 100 points."),
    /** Module Area: a tag-only topic of this module (checked on the server). */
    topicId: z.uuid().nullable(),
  })
  .superRefine((q, ctx) => {
    if (q.correctIndexes.some((i) => i >= q.options.length)) ctx.addIssue({ code: "custom", path: ["correctIndexes"], message: "Mark a correct answer that exists." });
    if (new Set(q.correctIndexes).size !== q.correctIndexes.length) ctx.addIssue({ code: "custom", path: ["correctIndexes"], message: "A correct answer is marked twice." });
    if (q.type === "single_choice" && q.correctIndexes.length !== 1) {
      ctx.addIssue({ code: "custom", path: ["correctIndexes"], message: "A single-choice question has exactly one correct answer." });
    }
    if (q.type === "multi_select" && q.correctIndexes.length < 2) {
      ctx.addIssue({ code: "custom", path: ["correctIndexes"], message: "A multi-select question needs at least two correct answers." });
    }
    const seen = new Set<string>();
    for (const o of q.options) {
      const key = o.trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) ctx.addIssue({ code: "custom", path: ["options"], message: "Answer options must be different from each other." });
      seen.add(key);
    }
  });

const count = z.number().int().min(0).max(MAX_QUESTIONS);

export const assessmentDraftSchema = z.strictObject({
  title: text(160, "The assessment name", 2),
  description: text(2000, "The description", 0),
  passPercent: z.number().int().min(1, "Passing threshold must be 1–100%.").max(100, "Passing threshold must be 1–100%."),
  /** null = unlimited (decision 7b). */
  maxAttempts: z.number().int().min(1, "Allow at least 1 attempt.").max(50, "Allow at most 50 attempts.").nullable(),
  /** null = untimed (decision 7c). */
  timeLimitMinutes: z.number().int().min(1, "A time limit must be at least 1 minute.").max(600, "A time limit can be at most 600 minutes.").nullable(),
  mix: z.strictObject({ easy: count, medium: count, difficult: count }),
  questions: z.array(questionSchema).max(MAX_QUESTIONS, `Use at most ${MAX_QUESTIONS} questions.`),
});

export type AssessmentDraftInput = z.infer<typeof assessmentDraftSchema>;
export type AssessmentDraftQuestion = AssessmentDraftInput["questions"][number];

/** Extra checks for Submit for Review / approval — a draft may be saved
 * half-finished, a submission must be complete. Returns messages keyed like
 * zod paths ("form", "mix.easy", …). */
export function submissionProblems(d: AssessmentDraftInput): Record<string, string> {
  const out: Record<string, string> = {};
  if (d.questions.length === 0) out.questions = "Add at least one question.";
  const perAttempt = d.mix.easy + d.mix.medium + d.mix.difficult;
  if (perAttempt === 0) out["mix"] = "Choose how many questions of each difficulty an attempt draws.";
  for (const level of DIFFICULTIES) {
    const available = d.questions.filter((q) => q.difficulty === level).length;
    if (d.mix[level] > available) {
      out[`mix.${level}`] = `An attempt draws ${d.mix[level]} ${level} question${d.mix[level] === 1 ? "" : "s"}, but only ${available} ${available === 1 ? "is" : "are"} written.`;
    }
  }
  const ids = d.questions.map((q) => q.bankItemId).filter(Boolean);
  if (new Set(ids).size !== ids.length) out.form = "A question appears twice.";
  return out;
}

/** A bank question as stored and graded. */
export type BankQuestion = {
  type: QuestionType;
  difficulty: Difficulty;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionIds: string[];
  explanation: string | null;
  points: number;
  topicId: string | null;
};

export function toBankQuestion(q: AssessmentDraftQuestion): BankQuestion {
  return {
    type: q.type,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options.map((label, i) => ({ id: OPTION_IDS[i], label })),
    correctOptionIds: [...q.correctIndexes].sort((a, b) => a - b).map((i) => OPTION_IDS[i]),
    explanation: q.explanation === "" ? null : q.explanation,
    points: q.points,
    topicId: q.topicId,
  };
}

export function fromBankQuestion(id: string, q: BankQuestion): AssessmentDraftQuestion {
  return {
    bankItemId: id,
    type: q.type,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options.map((o) => o.label),
    correctIndexes: q.options.flatMap((o, i) => (q.correctOptionIds.includes(o.id) ? [i] : [])),
    explanation: q.explanation ?? "",
    points: q.points,
    topicId: q.topicId,
  };
}

export function sameQuestion(a: BankQuestion, b: BankQuestion): boolean {
  return (
    a.type === b.type &&
    a.difficulty === b.difficulty &&
    a.prompt === b.prompt &&
    (a.explanation ?? "") === (b.explanation ?? "") &&
    a.points === b.points &&
    a.topicId === b.topicId &&
    a.correctOptionIds.length === b.correctOptionIds.length &&
    a.correctOptionIds.every((id, i) => id === b.correctOptionIds[i]) &&
    a.options.length === b.options.length &&
    a.options.every((o, i) => o.id === b.options[i].id && o.label === b.options[i].label)
  );
}

export type QuestionPlan = {
  unchanged: string[];
  updateInPlace: { id: string; question: BankQuestion }[];
  retireAndReplace: { id: string; question: BankQuestion }[];
  create: BankQuestion[];
  retire: string[];
  remove: string[];
};

/** What approving this draft does to the live (non-retired) bank. A draft
 * question whose bankItemId isn't live is treated as new. */
export function planQuestionChanges(
  live: { id: string; question: BankQuestion }[],
  draft: AssessmentDraftQuestion[],
  used: Set<string>,
): QuestionPlan {
  const liveById = new Map(live.map((l) => [l.id, l.question]));
  const plan: QuestionPlan = { unchanged: [], updateInPlace: [], retireAndReplace: [], create: [], retire: [], remove: [] };
  const kept = new Set<string>();
  for (const q of draft) {
    const next = toBankQuestion(q);
    const current = q.bankItemId ? liveById.get(q.bankItemId) : undefined;
    if (!q.bankItemId || !current) {
      plan.create.push(next);
      continue;
    }
    kept.add(q.bankItemId);
    if (sameQuestion(current, next)) plan.unchanged.push(q.bankItemId);
    else if (used.has(q.bankItemId)) plan.retireAndReplace.push({ id: q.bankItemId, question: next });
    else plan.updateInPlace.push({ id: q.bankItemId, question: next });
  }
  for (const l of live) if (!kept.has(l.id)) (used.has(l.id) ? plan.retire : plan.remove).push(l.id);
  return plan;
}

/** A KC question copied into an assessment (Import from Bank, decision 2). */
export function fromKcQuestion(
  kc: { prompt: string; options: { id: string; label: string }[]; correctOptionId: string; explanation: string | null; points: number },
  topicId: string | null,
): AssessmentDraftQuestion {
  return {
    type: "single_choice",
    difficulty: "medium",
    prompt: kc.prompt,
    options: kc.options.map((o) => o.label),
    correctIndexes: [Math.max(0, kc.options.findIndex((o) => o.id === kc.correctOptionId))],
    explanation: kc.explanation ?? "",
    points: kc.points,
    topicId,
  };
}
