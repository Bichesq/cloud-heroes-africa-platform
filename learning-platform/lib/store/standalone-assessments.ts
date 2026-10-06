import { prisma } from "@/lib/prisma";
import type {
  LpQuestionBankItem,
  LpStandaloneAssessment,
  LpTopic,
  PublicQuestionBankItem,
  QuestionDifficulty,
  QuestionType,
} from "@/types";

/* Standalone-assessment definitions — module-end or program-end MCQ
 * assessments with a randomized question bank (brief §3/§4 full rebuild).
 * Read-mostly, authored via the question bank; LP only reads it, same as
 * lib/store/catalog.ts for content. */

function toAssessment(row: {
  id: string;
  moduleId: string | null;
  programId: string | null;
  title: string;
  description: string;
  questionsPerAttempt: number;
  difficultyMix: unknown;
  passThreshold: unknown;
  timeLimitSeconds: number | null;
  maxAttempts: number | null;
  firstPublishedAt: Date | null;
}): LpStandaloneAssessment {
  return {
    id: row.id,
    moduleId: row.moduleId,
    programId: row.programId,
    title: row.title,
    description: row.description,
    questionsPerAttempt: row.questionsPerAttempt,
    difficultyMix: (row.difficultyMix ?? {}) as Record<string, number>,
    passThreshold: Number(row.passThreshold),
    timeLimitSeconds: row.timeLimitSeconds,
    maxAttempts: row.maxAttempts,
    firstPublishedAt: row.firstPublishedAt?.toISOString() ?? null,
  };
}

function toBankItem(row: {
  id: string;
  assessmentId: string;
  topicId: string | null;
  type: string;
  difficulty: string;
  prompt: string;
  options: unknown;
  correctOptionIds: unknown;
  pointsPossible: unknown;
  explanation: string | null;
}): LpQuestionBankItem {
  return {
    id: row.id,
    assessmentId: row.assessmentId,
    topicId: row.topicId,
    type: row.type as QuestionType,
    difficulty: row.difficulty as QuestionDifficulty,
    prompt: row.prompt,
    options: row.options as LpQuestionBankItem["options"],
    correctOptionIds: row.correctOptionIds as string[],
    pointsPossible: Number(row.pointsPossible),
    explanation: row.explanation,
  };
}

export async function getStandaloneAssessment(
  id: string
): Promise<LpStandaloneAssessment | null> {
  const row = await prisma.lpStandaloneAssessment.findUnique({ where: { id } });
  return row ? toAssessment(row) : null;
}

/** Standalone assessments scoped to a module or program (Assignments tab). */
export async function getStandaloneAssessmentsForScope(params: {
  moduleId?: string;
  programId?: string;
}): Promise<LpStandaloneAssessment[]> {
  const rows = await prisma.lpStandaloneAssessment.findMany({
    where: {
      OR: [
        params.moduleId ? { moduleId: params.moduleId } : null,
        params.programId ? { programId: params.programId } : null,
      ].filter((c): c is NonNullable<typeof c> => c !== null),
    },
  });
  return rows.map(toAssessment);
}

/** Module Assessments for the given modules (Phase 2 gating) — one row per
 * module that has one; a module with no Module Assessment is simply absent
 * from the result. */
export async function getModuleAssessmentsForModules(
  moduleIds: string[]
): Promise<LpStandaloneAssessment[]> {
  if (moduleIds.length === 0) return [];
  const rows = await prisma.lpStandaloneAssessment.findMany({
    where: { moduleId: { in: moduleIds } },
  });
  return rows.map(toAssessment);
}

export async function getQuestionBank(assessmentId: string): Promise<LpQuestionBankItem[]> {
  // Retired questions (replaced or removed by an approved edit in Learning
  // Management) are never drawn again; attempts that used them keep them.
  const rows = await prisma.lpQuestionBankItem.findMany({ where: { assessmentId, retiredAt: null } });
  return rows.map(toBankItem);
}

export async function getQuestionBankItemsByIds(
  ids: string[]
): Promise<LpQuestionBankItem[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.lpQuestionBankItem.findMany({ where: { id: { in: ids } } });
  return rows.map(toBankItem);
}

/** Strips correctness fields — what the client sees during an in-progress
 * attempt ("no correctness during attempt", brief §4). */
export function toPublicQuestionBankItem(item: LpQuestionBankItem): PublicQuestionBankItem {
  const { correctOptionIds, explanation, topicId, ...rest } = item;
  void correctOptionIds;
  void explanation;
  void topicId;
  return rest;
}

export async function getTopicsByIds(ids: string[]): Promise<Map<string, LpTopic>> {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) return new Map();
  const rows = await prisma.lpTopic.findMany({ where: { id: { in: uniqueIds } } });
  return new Map(rows.map((t) => [t.id, { id: t.id, name: t.name, unitId: t.unitId }]));
}
