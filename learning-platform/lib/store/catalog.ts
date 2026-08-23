import { prisma } from "@/lib/prisma";
import type {
  ContentBlock,
  CreatorRef,
  KcQuestion,
  KnowledgeCheck,
  LpModule,
  LpProgram,
  LpReadinessAssessment,
  LpUnit,
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
  contentBlocks: { id: string; order: number; type: string; payload: unknown }[];
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
      .map((b) => ({ id: b.id, order: b.order, type: b.type, payload: b.payload }) as ContentBlock),
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
        include: { units: { include: { contentBlocks: true } } },
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
  questions: unknown;
}): KnowledgeCheck {
  return {
    id: kc.id,
    unitId: kc.unitId,
    title: kc.title,
    passThreshold: Number(kc.passThreshold),
    questions: kc.questions as KcQuestion[],
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
