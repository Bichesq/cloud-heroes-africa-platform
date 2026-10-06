import { z } from "zod";

/* Knowledge Check Editor rules (plan §10). Pure — unit-tested.
 *
 * Attempts point at bank questions by id and are scored against the
 * question at submit time, so a question an attempt has used must never
 * change: a published edit retires it and creates a replacement. A question
 * no attempt has used is updated in place. */

const noControlChars = (s: string) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s);
const text = (max: number, label: string, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label} can't be empty.`)
    .max(max, `${label} must be ${max.toLocaleString("en-US")} characters or fewer.`)
    .refine(noControlChars, `${label} contains unsupported characters.`);

export const MAX_QUESTIONS = 100;
export const OPTION_IDS = ["a", "b", "c", "d", "e", "f"] as const;

const questionSchema = z
  .strictObject({
    /** Present for a question that already exists in the bank. */
    bankItemId: z.uuid().optional(),
    prompt: text(1000, "Question text"),
    options: z.array(text(300, "An answer option")).min(2, "Give at least 2 answer options.").max(6, "Use at most 6 answer options."),
    correctIndex: z.number().int().min(0),
    explanation: text(2000, "The explanation", 0),
    points: z.number().int().min(1, "Weight must be at least 1 point.").max(100, "Weight can be at most 100 points."),
  })
  .superRefine((q, ctx) => {
    if (q.correctIndex >= q.options.length) ctx.addIssue({ code: "custom", message: "Mark one answer as correct." });
    const seen = new Set<string>();
    for (const o of q.options) {
      const key = o.trim().toLowerCase();
      if (!key) continue; // empty options are reported on their own

      if (seen.has(key)) ctx.addIssue({ code: "custom", message: "Answer options must be different from each other." });
      seen.add(key);
    }
  });

export const kcDraftSchema = z
  .strictObject({
    title: text(160, "The Knowledge Check name", 2),
    passPercent: z.number().int().min(1, "Pass threshold must be 1–100%.").max(100, "Pass threshold must be 1–100%."),
    questionsPerAttempt: z.number().int().min(1, "Show at least 1 question per attempt."),
    questions: z.array(questionSchema).min(1, "Add at least one question.").max(MAX_QUESTIONS, `Use at most ${MAX_QUESTIONS} questions.`),
  })
  .superRefine((kc, ctx) => {
    if (kc.questionsPerAttempt > kc.questions.length) {
      ctx.addIssue({
        code: "custom",
        path: ["questionsPerAttempt"],
        message: `Questions per attempt can't be more than the ${kc.questions.length} question${kc.questions.length === 1 ? "" : "s"} written.`,
      });
    }
    const ids = kc.questions.map((q) => q.bankItemId).filter(Boolean);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "A question appears twice." });
  });

export type KcDraftInput = z.infer<typeof kcDraftSchema>;
export type KcDraftQuestion = KcDraftInput["questions"][number];

/** A bank question as stored (and as learners are scored against). */
export type BankQuestion = {
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string | null;
  points: number;
};

/** Draft question → stored shape; option ids are a, b, c… by position. */
export function toBankQuestion(q: KcDraftQuestion): BankQuestion {
  return {
    prompt: q.prompt,
    options: q.options.map((label, i) => ({ id: OPTION_IDS[i], label })),
    correctOptionId: OPTION_IDS[q.correctIndex],
    explanation: q.explanation === "" ? null : q.explanation,
    points: q.points,
  };
}

/** Stored → editable draft question. */
export function fromBankQuestion(id: string, q: BankQuestion): KcDraftQuestion {
  const correctIndex = Math.max(0, q.options.findIndex((o) => o.id === q.correctOptionId));
  return {
    bankItemId: id,
    prompt: q.prompt,
    options: q.options.map((o) => o.label),
    correctIndex,
    explanation: q.explanation ?? "",
    points: q.points,
  };
}

/** True when two questions would score/show differently. */
export function sameQuestion(a: BankQuestion, b: BankQuestion): boolean {
  return (
    a.prompt === b.prompt &&
    a.correctOptionId === b.correctOptionId &&
    (a.explanation ?? "") === (b.explanation ?? "") &&
    a.points === b.points &&
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

/**
 * What publishing this draft does to the live (non-retired) bank.
 * `used` = ids of bank questions any attempt has used.
 * A draft question whose bankItemId isn't a live question is treated as new.
 */
export function planQuestionChanges(
  live: { id: string; question: BankQuestion }[],
  draft: KcDraftQuestion[],
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
  for (const l of live) {
    if (kept.has(l.id)) continue;
    (used.has(l.id) ? plan.retire : plan.remove).push(l.id);
  }
  return plan;
}
