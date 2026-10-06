-- NOTE: `prisma migrate dev` initially generated DropForeignKey statements
-- here for 9 student_id FKs (lp_assessment_attempts, lp_enrollments,
-- lp_escalations, lp_kc_attempts, lp_notes, lp_readiness_results,
-- lp_student_units, lp_token_ledger, lp_unit_goals). Those are real,
-- intentional DB-level constraints added by the hand-authored
-- 20260826014535_add_student_fk migration but deliberately NOT modeled as
-- Prisma `@relation` fields in lp-core.prisma (see that file's header
-- comment — modeling them would break student-hub's independently
-- generated Prisma client). Prisma's schema-diff engine doesn't know about
-- DB-only constraints and wants to drop anything it can't see declared in
-- schema.prisma. Removed those statements by hand — this migration should
-- only add the `flagged` column and the `lp_question_reports` table.

-- AlterTable
ALTER TABLE "lp_attempt_answers" ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "lp_question_reports" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_bank_item_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "detail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_question_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lp_question_reports_question_bank_item_id_idx" ON "lp_question_reports"("question_bank_item_id");

-- AddForeignKey
ALTER TABLE "lp_question_reports" ADD CONSTRAINT "lp_question_reports_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "lp_assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_question_reports" ADD CONSTRAINT "lp_question_reports_question_bank_item_id_fkey" FOREIGN KEY ("question_bank_item_id") REFERENCES "lp_question_bank_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
