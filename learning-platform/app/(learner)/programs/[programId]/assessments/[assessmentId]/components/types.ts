import type { KcOption } from "@/types";

/* Client-side shapes of the assessment attempt API responses
 * (app/api/assessments/**) — unchanged by the 2026-09-23 UI rebuild, just
 * moved out of AssessmentRunner so the stage components can share them. */

export type AttemptQuestion = {
  attemptQuestionId: string;
  orderIndex: number;
  id: string; // question bank item id
  type: "single_choice" | "multi_select";
  prompt: string;
  options: KcOption[];
  pointsPossible: number;
  selectedOptionIds: string[];
  flagged: boolean;
};

export type ReviewItem = {
  attemptQuestionId: string;
  orderIndex: number;
  prompt: string;
  type: "single_choice" | "multi_select";
  options: KcOption[];
  correctOptionIds: string[];
  selectedOptionIds: string[];
  explanation: string | null;
  pointsPossible: number;
  pointsEarned: number;
  topicName: string | null;
};

export type WeakTopic = {
  topicId: string | null;
  topicName: string;
  unitId: string | null;
  scorePct: number;
};

export type SubmitResult = {
  attemptId: string;
  score: number;
  passed: boolean;
  weakTopics: WeakTopic[];
  nextEligibleAt: string | null;
  startedAt: string;
  submittedAt: string;
  totalQuestions: number;
  review: ReviewItem[] | null;
};

export type LastAttempt = {
  passed: boolean | null;
  score: number | null;
  submittedAt: string | null;
} | null;

export type TopicBreakdown = { name: string; pct: number; correct: number; total: number };

/** "A", "B", … for option lettering (Figma letter tiles). */
export const optionLetter = (index: number) => String.fromCharCode(65 + index);
