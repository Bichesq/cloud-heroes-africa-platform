-- Phase 4 sub-step 5 (plan 2026-09-21 §10): Knowledge Check editor —
-- question weights (decision 7a) and retirement, KC version, one KC per
-- unit (decision 7e), KC drafts, and the KC audit actions.
-- Generated with `prisma migrate diff` (migrate dev refuses to run
-- non-interactively when it shows the unique-constraint warning; no unit
-- had more than one KC). The 10 DB-only student-FK drops were removed by hand.

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'kc_draft_saved';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'kc_published';

-- AlterTable
ALTER TABLE "lp_kc_question_bank_items" ADD COLUMN     "points_possible" DECIMAL(65,30) NOT NULL DEFAULT 1,
ADD COLUMN     "retired_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "lp_knowledge_checks" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "lp_kc_drafts" (
    "unit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pass_threshold" DECIMAL(65,30) NOT NULL,
    "questions_per_attempt" INTEGER NOT NULL,
    "questions" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "lp_kc_drafts_pkey" PRIMARY KEY ("unit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lp_knowledge_checks_unit_id_key" ON "lp_knowledge_checks"("unit_id");

-- AddForeignKey
ALTER TABLE "lp_kc_drafts" ADD CONSTRAINT "lp_kc_drafts_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_kc_drafts" ADD CONSTRAINT "lp_kc_drafts_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

