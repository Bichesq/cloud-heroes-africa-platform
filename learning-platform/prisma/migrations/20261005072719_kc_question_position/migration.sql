-- Phase 4 sub-step 5 (plan §10): author-facing question order for the
-- Knowledge Check Editor. Generated with `prisma migrate diff`; the 10
-- DB-only student-FK drops were removed by hand.

-- AlterTable
ALTER TABLE "lp_kc_question_bank_items" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

