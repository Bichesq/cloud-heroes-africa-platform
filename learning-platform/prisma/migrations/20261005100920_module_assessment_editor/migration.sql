-- Phase 4 sub-step 6 (plan 2026-09-21 §11): Module Assessment editor —
-- optional time limit (7c), attempts cap (7b), version + first-publish date,
-- question retirement + author order, review drafts, and the assessment
-- audit actions. Generated with `prisma migrate diff`; the 10 DB-only
-- student-FK drops were removed by hand.

-- CreateEnum
CREATE TYPE "lp_assessment_draft_status" AS ENUM ('draft', 'in_review');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'assessment_draft_saved';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'assessment_submitted';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'assessment_approved';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'assessment_rejected';

-- AlterTable
ALTER TABLE "lp_question_bank_items" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retired_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "lp_standalone_assessments" ADD COLUMN     "first_published_at" TIMESTAMP(3),
ADD COLUMN     "max_attempts" INTEGER,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "time_limit_seconds" DROP NOT NULL;

-- CreateTable
CREATE TABLE "lp_assessment_drafts" (
    "module_id" TEXT NOT NULL,
    "status" "lp_assessment_draft_status" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "pass_threshold" DECIMAL(65,30) NOT NULL,
    "max_attempts" INTEGER,
    "time_limit_seconds" INTEGER,
    "difficulty_mix" JSONB NOT NULL,
    "questions" JSONB NOT NULL,
    "submitted_by_id" UUID,
    "submitted_at" TIMESTAMP(3),
    "review_comment" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "lp_assessment_drafts_pkey" PRIMARY KEY ("module_id")
);

-- AddForeignKey
ALTER TABLE "lp_assessment_drafts" ADD CONSTRAINT "lp_assessment_drafts_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "lp_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_assessment_drafts" ADD CONSTRAINT "lp_assessment_drafts_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_assessment_drafts" ADD CONSTRAINT "lp_assessment_drafts_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_assessment_drafts" ADD CONSTRAINT "lp_assessment_drafts_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

