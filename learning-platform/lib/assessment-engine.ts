import type { LpQuestionBankItem, QuestionDifficulty, WeakTopic } from "@/types";

/* Pure, I/O-free standalone-assessment engine (brief §4) — the
 * randomization/difficulty-mix selection, partial-credit scoring,
 * weak-topic rollup, and retake-cooldown math, built and unit-tested
 * (scripts/__tests__/assessment-engine.test.ts) independently of HTTP/DB
 * before any route wires into it, per §4's own instruction. */

/* --------------------- randomization & difficulty mix ------------------ */

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Selects `questionsPerAttempt` items from `bank`, respecting
 * `difficultyMix` proportions (e.g. {"easy":4,"medium":4,"difficult":2}).
 * Thin-bank fallback: if a difficulty bucket can't fill its share (e.g. a
 * bank migrated from a small fixed-question list, all one difficulty), the
 * shortfall is topped up from whatever's left so an attempt still returns
 * a full question set instead of erroring. */
export function selectQuestions(
  bank: LpQuestionBankItem[],
  questionsPerAttempt: number,
  difficultyMix: Record<string, number>
): LpQuestionBankItem[] {
  const byDifficulty = new Map<QuestionDifficulty, LpQuestionBankItem[]>();
  for (const item of bank) {
    const bucket = byDifficulty.get(item.difficulty) ?? [];
    bucket.push(item);
    byDifficulty.set(item.difficulty, bucket);
  }

  const selected: LpQuestionBankItem[] = [];
  const usedIds = new Set<string>();

  for (const [difficulty, count] of Object.entries(difficultyMix)) {
    const pool = shuffle(byDifficulty.get(difficulty as QuestionDifficulty) ?? []);
    for (const item of pool.slice(0, count)) {
      selected.push(item);
      usedIds.add(item.id);
    }
  }

  if (selected.length < questionsPerAttempt) {
    const remaining = shuffle(bank.filter((b) => !usedIds.has(b.id)));
    for (const item of remaining) {
      if (selected.length >= questionsPerAttempt) break;
      selected.push(item);
      usedIds.add(item.id);
    }
  }

  return shuffle(selected).slice(0, questionsPerAttempt);
}

/* ----------------------------- scoring ---------------------------------- */

/** Partial credit per the 2026-08-06 decision: multi_select marks are
 * distributed proportionally across the required correct options (a
 * 1-point question with 3 required correct options awards 1/3 point per
 * correct selection). single_choice stays all-or-nothing. Extra/incorrect
 * selections earn nothing but aren't penalized — no negative marking is
 * specified in the decision log. */
export function scoreQuestion(
  question: Pick<LpQuestionBankItem, "type" | "correctOptionIds" | "pointsPossible">,
  selectedOptionIds: string[]
): number {
  const pointsPossible = Number(question.pointsPossible);

  if (question.type === "single_choice") {
    return selectedOptionIds.length === 1 &&
      question.correctOptionIds.includes(selectedOptionIds[0])
      ? pointsPossible
      : 0;
  }

  const requiredCount = question.correctOptionIds.length;
  if (requiredCount === 0) return 0;
  const correctSelected = selectedOptionIds.filter((id) =>
    question.correctOptionIds.includes(id)
  ).length;
  return (pointsPossible * correctSelected) / requiredCount;
}

/* ------------------------- weak-topic rollup ---------------------------- */

export type GradedQuestionForTopics = {
  topicId: string | null;
  topicName: string | null;
  unitId: string | null;
  pointsPossible: number;
  pointsEarned: number;
};

/** Groups by topic, computes sum(pointsEarned)/sum(pointsPossible) per
 * topic **for this attempt only** (not rolled up across attempt history,
 * per §4), and flags any topic below `passThreshold` as weak. If the
 * attempt failed but no topic individually falls below threshold, returns
 * a single generic "review the full module" entry rather than an empty
 * list (§4's explicit fallback case). */
export function computeWeakTopics(
  graded: GradedQuestionForTopics[],
  passThreshold: number,
  passed: boolean
): WeakTopic[] {
  const byTopic = new Map<
    string,
    { name: string; unitId: string | null; possible: number; earned: number }
  >();

  for (const q of graded) {
    if (!q.topicId) continue;
    const entry =
      byTopic.get(q.topicId) ??
      { name: q.topicName ?? "", unitId: q.unitId, possible: 0, earned: 0 };
    entry.possible += q.pointsPossible;
    entry.earned += q.pointsEarned;
    byTopic.set(q.topicId, entry);
  }

  const weak: WeakTopic[] = [];
  for (const [topicId, t] of byTopic) {
    const scorePct = t.possible === 0 ? 0 : t.earned / t.possible;
    if (scorePct < passThreshold) {
      weak.push({ topicId, topicName: t.name, unitId: t.unitId, scorePct });
    }
  }

  if (!passed && weak.length === 0) {
    return [
      { topicId: null, topicName: "review the full module", unitId: null, scorePct: 0 },
    ];
  }

  return weak;
}

/* ------------------------------ grading ---------------------------------- */

export type AttemptQuestionForGrading = {
  attemptQuestionId: string;
  bankItem: Pick<LpQuestionBankItem, "type" | "correctOptionIds" | "pointsPossible" | "topicId">;
  topicName: string | null;
  topicUnitId: string | null;
  selectedOptionIds: string[];
};

export type GradedAnswer = { attemptQuestionId: string; pointsEarned: number };

export type AttemptGradeResult = {
  /** Fraction correct, 0..1. */
  score: number;
  passed: boolean;
  perQuestion: GradedAnswer[];
  weakTopics: WeakTopic[];
};

export function gradeAttempt(
  questions: AttemptQuestionForGrading[],
  passThreshold: number
): AttemptGradeResult {
  let possible = 0;
  let earned = 0;
  const perQuestion: GradedAnswer[] = [];
  const gradedForTopics: GradedQuestionForTopics[] = [];

  for (const q of questions) {
    const pointsPossible = Number(q.bankItem.pointsPossible);
    const pointsEarned = scoreQuestion(q.bankItem, q.selectedOptionIds);
    possible += pointsPossible;
    earned += pointsEarned;
    perQuestion.push({ attemptQuestionId: q.attemptQuestionId, pointsEarned });
    gradedForTopics.push({
      topicId: q.bankItem.topicId,
      topicName: q.topicName,
      unitId: q.topicUnitId,
      pointsPossible,
      pointsEarned,
    });
  }

  const score = possible === 0 ? 0 : earned / possible;
  const passed = score >= passThreshold;
  const weakTopics = computeWeakTopics(gradedForTopics, passThreshold, passed);

  return { score, passed, perQuestion, weakTopics };
}

/* --------------------------- retake cooldowns ---------------------------- */

const HOUR_MS = 60 * 60 * 1000;

/** Progressive cooldown (2026-08-06 decision): 1h after the 1st failure,
 * 3h after the 2nd, 24h after the 3rd and beyond. `failureCount` includes
 * the failure just recorded (so the very first failure passes 1). */
export function cooldownMs(failureCount: number): number {
  if (failureCount <= 1) return HOUR_MS;
  if (failureCount === 2) return 3 * HOUR_MS;
  return 24 * HOUR_MS;
}

export function computeNextEligibleAt(now: Date, failureCount: number): Date {
  return new Date(now.getTime() + cooldownMs(failureCount));
}

/* ------------------------- repeated-failure escalation -------------------- */

export type AssessmentFailureOutcome = "passed" | "retake" | "escalate";

/** Mirrors kc-utils.nextAttemptOutcome's "2nd consecutive failure escalates"
 * pattern (brief §4: "mirror the KC 'notify on 2nd failure' pattern —
 * confirm exact threshold with the team, not specified for Assessments as
 * precisely as it is for KCs"). This is a judgment call, not a literal
 * spec — flagged for confirmation. */
export function assessmentFailureOutcome(
  previousAttempts: { passed: boolean | null }[],
  passed: boolean
): AssessmentFailureOutcome {
  if (passed) return "passed";
  let failRun = 0;
  for (const a of previousAttempts) failRun = a.passed ? 0 : failRun + 1;
  return failRun + 1 >= 2 ? "escalate" : "retake";
}
