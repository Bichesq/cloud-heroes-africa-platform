/**
 * One-time migration: learning-platform/data/*.json → Postgres (Prisma).
 *
 * Phase 1 of the Learning Platform backend migration (see the approved plan
 * under .claude/plans — "Learning Platform Backend Migration"). This script
 * has been written but NOT executed against real data — run it manually
 * once schema.prisma has been migrated onto a real Postgres database:
 *
 *   npx prisma migrate dev --name init
 *   npm run migrate:lp
 *
 * Safe to re-run: every table is upserted or fully replaced per-parent, so
 * running this again after editing lp-programs.json/etc. converges rather
 * than duplicating rows. It never deletes or modifies the source JSON files
 * (brief §5.5) — those stay in place until the Postgres-backed app has been
 * verified against them.
 *
 * Known, deliberate gaps — all flagged in the plan, not silently decided:
 *   - lp-student-items.json (per-item completion) is READ and LOGGED but
 *     never written anywhere — the leaf-level tracking it represents no
 *     longer exists in the target schema (brief §2). See plan Ambiguity #2:
 *     there is currently no replacement mechanism for "is this unit's
 *     content done" once Section/Item are gone.
 *   - lp_units.duration_min / hero_image: kept from the *unit's own*
 *     existing fields (durationMin) / first item found with a heroImage,
 *     NOT summed/derived — see plan §1b, this is a judgment call.
 *   - lp_standalone_assessments.questions_per_attempt / difficulty_mix /
 *     pass_threshold / time_limit_seconds and each question's `difficulty`
 *     have NO source data at all — STANDALONE_ASSESSMENT_DEFAULTS below are
 *     placeholders pending real numbers from the team (plan §1f).
 *   - config.practical on the standalone assessment is read but never
 *     migrated (dropped per the 2026-08-11 decision).
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import {
  PrismaClient,
  type ContentBlockType,
  type EnrollmentStatus,
  type QuestionDifficulty,
  type QuestionType,
  type StudentUnitStatus,
} from "@prisma/client";

loadEnv({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

// Mirrors lib/shared-data.ts's localDataPath() convention — run this script
// from the learning-platform/ directory (npm run migrate:lp does this).
const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  return JSON.parse(readFileSync(path.join(DATA_DIR, filename), "utf-8")) as T;
}

// ---------------------------------------------------------------------------
// Source shapes — the CURRENT (pre-migration) learning-platform/data/*.json
// contents, confirmed by direct inspection (see plan §0). Deliberately kept
// local to this script rather than imported from @/types, since Phase 2
// (which changes types/index.ts) hasn't happened yet.
// ---------------------------------------------------------------------------

type SourceCreator = { name: string; role?: string; avatarUrl?: string };

type SourceContentBlock = {
  id: string;
  order: number;
  type: string;
  payload: unknown;
};

type SourceItem = {
  id: string;
  title: string;
  type: "reading" | "knowledge_check";
  order: number;
  durationMin: number;
  heroImage?: string;
  kcId?: string;
  blocks?: SourceContentBlock[];
};

type SourceSection = {
  id: string;
  title: string;
  order: number;
  items: SourceItem[];
};

type SourceUnit = {
  id: string;
  title: string;
  order: number;
  description: string;
  durationMin: number;
  pointsAward: number;
  pointsRequired: number;
  creators: SourceCreator[];
  sections: SourceSection[];
};

type SourceModule = {
  id: string;
  title: string;
  order: number;
  description: string;
  units: SourceUnit[];
};

type SourceProgram = {
  id: string;
  title: string;
  slug: string;
  blurb: string;
  heroImage?: string;
  language: string;
  delivery: string;
  creators: SourceCreator[];
  published: boolean;
  modules: SourceModule[];
};

type SourceKcQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
  explanation: string;
};

type SourceKnowledgeCheck = {
  id: string;
  unitId: string;
  title: string;
  passThreshold: number;
  questions: SourceKcQuestion[];
};

type SourceAssessment = {
  id: string;
  kind: "standalone" | "readiness";
  scope: "program" | "module" | "unit";
  scopeId: string;
  title: string;
  description: string;
  config: {
    questions?: SourceKcQuestion[];
    levels?: { min: number; label: string }[];
    practical?: unknown;
  };
  rubric?: unknown;
};

type SourceEnrollment = {
  studentId: string;
  programId: string;
  enrolledAt: string;
  status: string;
};

type SourceStudentUnit = {
  studentId: string;
  unitId: string;
  status: string;
  completedAt: string | null;
  verifiedAt: string | null;
  updatedAt: string;
};

type SourceStudentItem = {
  studentId: string;
  itemId: string;
  completedAt: string;
};

// ---------------------------------------------------------------------------
// Placeholder defaults for fields with no source data (plan §1f). CONFIRM
// REAL VALUES WITH THE TEAM before this ships — especially the time limit.
// ---------------------------------------------------------------------------

const STANDALONE_ASSESSMENT_DEFAULTS = {
  questionsPerAttempt: 3,
  difficultyMix: { medium: 3 } as const,
  passThreshold: 0.75,
  timeLimitSecondsPlaceholder: 1800, // 30 min — not sourced from anywhere
  defaultQuestionDifficulty: "medium" as QuestionDifficulty,
};

// ---------------------------------------------------------------------------
// Programs → Modules → Units → ContentBlocks
// ---------------------------------------------------------------------------

async function migrateCatalog(programs: SourceProgram[]) {
  let totalBlocksInSource = 0;
  let totalBlocksMigrated = 0;
  let droppedKcItems = 0;
  let unitsMigrated = 0;
  let modulesMigrated = 0;

  for (const program of programs) {
    await prisma.lpProgram.upsert({
      where: { id: program.id },
      create: {
        id: program.id,
        title: program.title,
        slug: program.slug,
        blurb: program.blurb ?? "",
        heroImage: program.heroImage ?? null,
        language: program.language ?? "en",
        delivery: program.delivery ?? "self-paced",
        creators: program.creators ?? [],
        published: program.published ?? false,
      },
      update: {
        title: program.title,
        slug: program.slug,
        blurb: program.blurb ?? "",
        heroImage: program.heroImage ?? null,
        language: program.language ?? "en",
        delivery: program.delivery ?? "self-paced",
        creators: program.creators ?? [],
        published: program.published ?? false,
      },
    });

    for (const module of program.modules) {
      modulesMigrated += 1;
      await prisma.lpModule.upsert({
        where: { id: module.id },
        create: {
          id: module.id,
          programId: program.id,
          title: module.title,
          order: module.order,
          description: module.description ?? "",
        },
        update: {
          title: module.title,
          order: module.order,
          description: module.description ?? "",
        },
      });

      for (const unit of module.units) {
        unitsMigrated += 1;

        // Flatten Unit → Section → Item → ContentBlock into a single
        // Unit → ContentBlock list, renumbering `order` as we go (plan §1d).
        // knowledge_check items are dropped — kcId is already redundant
        // with lp_knowledge_checks.unitId (plan §1e).
        const sortedSections = [...unit.sections].sort((a, b) => a.order - b.order);
        let heroImage: string | null = null;
        let runningOrder = 0;
        const blockRows: { id: string; order: number; type: string; payload: unknown }[] = [];

        for (const section of sortedSections) {
          const sortedItems = [...section.items].sort((a, b) => a.order - b.order);
          for (const item of sortedItems) {
            totalBlocksInSource += item.blocks?.length ?? 0;

            if (item.type === "knowledge_check") {
              droppedKcItems += 1;
              continue;
            }

            if (heroImage === null && item.heroImage) {
              heroImage = item.heroImage;
            }

            const sortedBlocks = [...(item.blocks ?? [])].sort((a, b) => a.order - b.order);
            for (const block of sortedBlocks) {
              runningOrder += 1;
              blockRows.push({
                id: block.id,
                order: runningOrder,
                type: block.type,
                payload: block.payload,
              });
            }
          }
        }

        await prisma.lpUnit.upsert({
          where: { id: unit.id },
          create: {
            id: unit.id,
            moduleId: module.id,
            title: unit.title,
            order: unit.order,
            description: unit.description ?? "",
            durationMin: unit.durationMin ?? 0, // plan §1b — unit's own field, not resummed
            heroImage, // plan §1b — first item hero image found, else null
            tokensAward: unit.pointsAward ?? 0, // §1 rename
            tokensRequired: unit.pointsRequired ?? 0, // §1 rename
            creators: unit.creators ?? [],
          },
          update: {
            title: unit.title,
            order: unit.order,
            description: unit.description ?? "",
            durationMin: unit.durationMin ?? 0,
            heroImage,
            tokensAward: unit.pointsAward ?? 0,
            tokensRequired: unit.pointsRequired ?? 0,
            creators: unit.creators ?? [],
          },
        });

        // Replace this unit's content blocks wholesale on every run rather
        // than upserting row-by-row — simplest way to stay idempotent when
        // re-authored content can add/remove/reorder blocks between runs.
        await prisma.lpContentBlock.deleteMany({ where: { unitId: unit.id } });
        if (blockRows.length > 0) {
          await prisma.lpContentBlock.createMany({
            data: blockRows.map((b) => ({
              id: b.id,
              unitId: unit.id,
              order: b.order,
              type: b.type as ContentBlockType,
              payload: b.payload as object,
            })),
          });
        }
        totalBlocksMigrated += blockRows.length;
      }
    }
  }

  return {
    modulesMigrated,
    unitsMigrated,
    totalBlocksInSource,
    totalBlocksMigrated,
    droppedKcItems,
  };
}

// ---------------------------------------------------------------------------
// Knowledge Checks — direct 1:1 copy, only column renames.
// ---------------------------------------------------------------------------

async function migrateKnowledgeChecks(kcs: SourceKnowledgeCheck[]) {
  for (const kc of kcs) {
    await prisma.lpKnowledgeCheck.upsert({
      where: { id: kc.id },
      create: {
        id: kc.id,
        unitId: kc.unitId,
        title: kc.title,
        passThreshold: kc.passThreshold,
        questions: kc.questions,
      },
      update: {
        unitId: kc.unitId,
        title: kc.title,
        passThreshold: kc.passThreshold,
        questions: kc.questions,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Enrollments — direct 1:1 copy.
// ---------------------------------------------------------------------------

async function migrateEnrollments(rows: SourceEnrollment[]) {
  for (const e of rows) {
    await prisma.lpEnrollment.upsert({
      where: { studentId_programId: { studentId: e.studentId, programId: e.programId } },
      create: {
        studentId: e.studentId,
        programId: e.programId,
        enrolledAt: new Date(e.enrolledAt),
        status: e.status as EnrollmentStatus,
      },
      update: {
        enrolledAt: new Date(e.enrolledAt),
        status: e.status as EnrollmentStatus,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Student Units — direct 1:1 copy (columns already match the target schema).
// ---------------------------------------------------------------------------

async function migrateStudentUnits(rows: SourceStudentUnit[]) {
  for (const su of rows) {
    await prisma.lpStudentUnit.upsert({
      where: { studentId_unitId: { studentId: su.studentId, unitId: su.unitId } },
      create: {
        studentId: su.studentId,
        unitId: su.unitId,
        status: su.status as StudentUnitStatus,
        completedAt: su.completedAt ? new Date(su.completedAt) : null,
        verifiedAt: su.verifiedAt ? new Date(su.verifiedAt) : null,
        updatedAt: new Date(su.updatedAt),
      },
      update: {
        status: su.status as StudentUnitStatus,
        completedAt: su.completedAt ? new Date(su.completedAt) : null,
        verifiedAt: su.verifiedAt ? new Date(su.verifiedAt) : null,
        updatedAt: new Date(su.updatedAt),
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Student Items — NOT migrated (lp_student_items is eliminated, brief §2).
// Logged for an audit trail only; see plan Ambiguity #2.
// ---------------------------------------------------------------------------

function reportDroppedStudentItems(rows: SourceStudentItem[]) {
  if (rows.length === 0) return;
  console.log(
    `\n[student-items] ${rows.length} per-item completion record(s) found — NOT migrated ` +
      `(lp_student_items has no target table; see plan Ambiguity #2). Discarded:`
  );
  for (const r of rows) {
    console.log(`  - student=${r.studentId} item=${r.itemId} completedAt=${r.completedAt}`);
  }
}

// ---------------------------------------------------------------------------
// Assessments — split by kind into lp_readiness_assessments vs.
// lp_standalone_assessments + lp_question_bank_items.
// ---------------------------------------------------------------------------

async function migrateAssessments(assessments: SourceAssessment[]) {
  let standaloneQuestionsMigrated = 0;

  for (const a of assessments) {
    if (a.kind === "readiness") {
      await prisma.lpReadinessAssessment.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          programId: a.scopeId,
          title: a.title,
          description: a.description ?? "",
          config: (a.config ?? {}) as object,
        },
        update: {
          programId: a.scopeId,
          title: a.title,
          description: a.description ?? "",
          config: (a.config ?? {}) as object,
        },
      });
      continue;
    }

    // kind === "standalone"
    const moduleId = a.scope === "module" ? a.scopeId : null;
    const programId = a.scope === "program" ? a.scopeId : null;

    await prisma.lpStandaloneAssessment.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        moduleId,
        programId,
        title: a.title,
        description: a.description ?? "",
        // Placeholders — no source data exists for any of these four
        // fields. See STANDALONE_ASSESSMENT_DEFAULTS above / plan §1f.
        questionsPerAttempt: STANDALONE_ASSESSMENT_DEFAULTS.questionsPerAttempt,
        difficultyMix: STANDALONE_ASSESSMENT_DEFAULTS.difficultyMix,
        passThreshold: STANDALONE_ASSESSMENT_DEFAULTS.passThreshold,
        timeLimitSeconds: STANDALONE_ASSESSMENT_DEFAULTS.timeLimitSecondsPlaceholder,
      },
      update: {
        moduleId,
        programId,
        title: a.title,
        description: a.description ?? "",
      },
    });

    // config.practical is intentionally read but never written — dropped
    // per the 2026-08-11 decision (brief §5.3).
    const questions = a.config?.questions ?? [];

    // Replace the question bank for this assessment wholesale on every run
    // (same reasoning as content blocks above) — none of the source
    // questions have a stable uuid to upsert against, since
    // lp_question_bank_items.id is DB-generated.
    await prisma.lpQuestionBankItem.deleteMany({ where: { assessmentId: a.id } });
    if (questions.length > 0) {
      await prisma.lpQuestionBankItem.createMany({
        data: questions.map((q) => ({
          assessmentId: a.id,
          topicId: null, // no topic tagging exists on migrated questions (plan §1g)
          type: "single_choice" as QuestionType, // source uses a single correctOptionId
          difficulty: STANDALONE_ASSESSMENT_DEFAULTS.defaultQuestionDifficulty,
          prompt: q.prompt,
          options: q.options,
          correctOptionIds: [q.correctOptionId],
          pointsPossible: 1,
          explanation: q.explanation ?? null,
        })),
      });
      standaloneQuestionsMigrated += questions.length;
    }
  }

  return { standaloneQuestionsMigrated };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const programs = readJson<SourceProgram[]>("lp-programs.json");
  const knowledgeChecks = readJson<SourceKnowledgeCheck[]>("lp-knowledge-checks.json");
  const assessments = readJson<SourceAssessment[]>("lp-assessments.json");
  const enrollments = readJson<SourceEnrollment[]>("lp-enrollments.json");
  const studentUnits = readJson<SourceStudentUnit[]>("lp-student-units.json");
  const studentItems = readJson<SourceStudentItem[]>("lp-student-items.json");

  console.log("== Learning Platform → Postgres migration (Phase 1) ==\n");

  const catalogStats = await migrateCatalog(programs);
  await migrateKnowledgeChecks(knowledgeChecks);
  await migrateEnrollments(enrollments);
  await migrateStudentUnits(studentUnits);
  reportDroppedStudentItems(studentItems);
  const assessmentStats = await migrateAssessments(assessments);

  console.log("\n== Summary ==");
  console.log(`Programs migrated:              ${programs.length}`);
  console.log(`Modules migrated:                ${catalogStats.modulesMigrated}`);
  console.log(`Units migrated:                  ${catalogStats.unitsMigrated}`);
  console.log(`Knowledge checks migrated:       ${knowledgeChecks.length}`);
  console.log(`Enrollments migrated:            ${enrollments.length}`);
  console.log(`Student units migrated:          ${studentUnits.length}`);
  console.log(`Student items dropped:           ${studentItems.length} (see log above)`);
  console.log(`Standalone question bank items:  ${assessmentStats.standaloneQuestionsMigrated}`);
  console.log(`Content blocks in source:        ${catalogStats.totalBlocksInSource}`);
  console.log(`Content blocks migrated:         ${catalogStats.totalBlocksMigrated}`);
  console.log(`Knowledge-check items dropped:   ${catalogStats.droppedKcItems} (redundant with lp_knowledge_checks.unitId)`);

  if (catalogStats.totalBlocksMigrated !== catalogStats.totalBlocksInSource) {
    console.warn(
      "\n⚠ Content block count mismatch (migrated != source) — investigate before trusting this run."
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
