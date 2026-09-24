import { prisma } from "@/lib/prisma";
import type {
  ContentBlock,
  CreatorRef,
  KcOption,
  KcQuestionBankItem,
  KnowledgeCheck,
  LpModule,
  LpProgram,
  LpReadinessAssessment,
  LpUnit,
  QuestionDifficulty,
} from "@/types";

/* Published learning content, authored by Learning Management. LP only
 * reads it (requirement §11.2). Backed by Postgres via Prisma
 * (prisma/schema.prisma) — lp_programs/lp_modules/lp_units/lp_content_blocks.
 * (2026-08-11: Section/Item are gone — a Unit owns its ContentBlocks
 * directly, see plan §3 "content" module.) */

type UnitRow = {
  id: string;
  title: string;
  order: number;
  description: string;
  durationMin: number;
  heroImage: string | null;
  tokensAward: number;
  tokensRequired: number;
  creators: unknown;
  contentBlocks: {
    id: string;
    order: number;
    type: string;
    payload: unknown;
    topicId: string | null;
  }[];
  topics: { id: string; name: string; description: string; order: number | null }[];
};

type ModuleRow = {
  id: string;
  title: string;
  order: number;
  description: string;
  units: UnitRow[];
};

function toUnit(unit: UnitRow): LpUnit {
  return {
    id: unit.id,
    title: unit.title,
    order: unit.order,
    description: unit.description,
    durationMin: unit.durationMin,
    heroImage: unit.heroImage ?? undefined,
    tokensAward: unit.tokensAward,
    tokensRequired: unit.tokensRequired,
    creators: (unit.creators ?? []) as CreatorRef[],
    contentBlocks: [...unit.contentBlocks]
      .sort((a, b) => a.order - b.order)
      .map(
        (b) =>
          ({
            id: b.id,
            order: b.order,
            type: b.type,
            payload: b.payload,
            topicId: b.topicId,
          }) as ContentBlock
      ),
    topics: unit.topics
      .filter((t): t is typeof t & { order: number } => t.order !== null)
      .sort((a, b) => a.order - b.order)
      .map((t) => ({ id: t.id, name: t.name, description: t.description, order: t.order })),
  };
}

function toModule(module: ModuleRow): LpModule {
  return {
    id: module.id,
    title: module.title,
    order: module.order,
    description: module.description,
    units: [...module.units].sort((a, b) => a.order - b.order).map(toUnit),
  };
}

export async function getPrograms(): Promise<LpProgram[]> {
  const programs = await prisma.lpProgram.findMany({
    where: { published: true },
    include: {
      modules: {
        include: {
          units: {
            include: {
              contentBlocks: true,
              // Only navigable topics — tag-only rows have a null order.
              topics: { where: { order: { not: null } } },
            },
          },
        },
      },
    },
  });

  return programs.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    blurb: p.blurb,
    heroImage: p.heroImage ?? "",
    language: p.language as "en",
    delivery: p.delivery as "self-paced",
    creators: (p.creators ?? []) as CreatorRef[],
    published: p.published,
    modules: [...p.modules].sort((a, b) => a.order - b.order).map(toModule),
  }));
}

export async function getProgram(programId: string): Promise<LpProgram | null> {
  const programs = await getPrograms();
  return programs.find((p) => p.id === programId) ?? null;
}

function toKnowledgeCheck(kc: {
  id: string;
  unitId: string;
  title: string;
  passThreshold: unknown;
  questionsPerAttempt: number;
}): KnowledgeCheck {
  return {
    id: kc.id,
    unitId: kc.unitId,
    title: kc.title,
    passThreshold: Number(kc.passThreshold),
    questionsPerAttempt: kc.questionsPerAttempt,
  };
}

export async function getKnowledgeCheck(kcId: string): Promise<KnowledgeCheck | null> {
  const kc = await prisma.lpKnowledgeCheck.findUnique({ where: { id: kcId } });
  return kc ? toKnowledgeCheck(kc) : null;
}

/** All Knowledge Checks belonging to a unit (a Unit may have zero or more). */
export async function getKnowledgeChecksForUnit(unitId: string): Promise<KnowledgeCheck[]> {
  const rows = await prisma.lpKnowledgeCheck.findMany({ where: { unitId } });
  return rows.map(toKnowledgeCheck);
}

/** Batched form of getKnowledgeChecksForUnit, same pattern as
 * getModuleAssessmentsForModules — avoids N+1 queries when a page needs
 * Knowledge Check counts across every unit in a module (Module Content View). */
export async function getKnowledgeChecksForUnits(unitIds: string[]): Promise<KnowledgeCheck[]> {
  if (unitIds.length === 0) return [];
  const rows = await prisma.lpKnowledgeCheck.findMany({ where: { unitId: { in: unitIds } } });
  return rows.map(toKnowledgeCheck);
}

function toKcQuestionBankItem(row: {
  id: string;
  kcId: string;
  difficulty: string;
  prompt: string;
  options: unknown;
  correctOptionId: string;
  explanation: string | null;
}): KcQuestionBankItem {
  return {
    id: row.id,
    kcId: row.kcId,
    difficulty: row.difficulty as QuestionDifficulty,
    prompt: row.prompt,
    options: row.options as KcOption[],
    correctOptionId: row.correctOptionId,
    explanation: row.explanation,
  };
}

/** Full question bank for a KC (2026-09-21, plan Phase 3 step 1) —
 * `selectQuestions` draws a random per-attempt subset from this. */
export async function getKcQuestionBank(kcId: string): Promise<KcQuestionBankItem[]> {
  const rows = await prisma.lpKcQuestionBankItem.findMany({ where: { kcId } });
  return rows.map(toKcQuestionBankItem);
}

/** Exam Readiness assessment definition (unchanged shape — see brief §3). */
export async function getReadinessAssessment(
  id: string
): Promise<LpReadinessAssessment | null> {
  const a = await prisma.lpReadinessAssessment.findUnique({ where: { id } });
  if (!a) return null;
  return {
    id: a.id,
    programId: a.programId,
    title: a.title,
    description: a.description,
    config: a.config as LpReadinessAssessment["config"],
  };
}

/** Readiness assessments attached to a program. */
export async function getReadinessAssessments(
  programId: string
): Promise<LpReadinessAssessment[]> {
  const rows = await prisma.lpReadinessAssessment.findMany({ where: { programId } });
  return rows.map((a) => ({
    id: a.id,
    programId: a.programId,
    title: a.title,
    description: a.description,
    config: a.config as LpReadinessAssessment["config"],
  }));
}
