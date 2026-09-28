-- Phase 4 sub-step 3 (plan 2026-09-21 §8): unit draft state for Course
-- Structure, and the module/unit audit actions. Prisma's auto-diff also
-- wanted to drop the 10 DB-only student FKs (known drift); removed by hand.

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'module_created';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'module_updated';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'module_reordered';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'module_deleted';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'unit_created';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'unit_updated';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'unit_reordered';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'unit_deleted';

-- AlterTable
ALTER TABLE "lp_units" ADD COLUMN     "published_at" TIMESTAMP(3);

-- Every unit that exists today is already visible to learners.
UPDATE "lp_units" SET "published_at" = CURRENT_TIMESTAMP WHERE "published_at" IS NULL;
