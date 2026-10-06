-- Phase 4 sub-step 4 (plan 2026-09-21 §9): Unit Editor draft copies,
-- unit thumbnail + content-source fields, and draft/publish audit actions.
-- Prisma's auto-diff also wanted to drop the 10 DB-only student FKs (known
-- drift); removed by hand.

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'unit_draft_saved';
ALTER TYPE "lp_authoring_audit_action" ADD VALUE 'unit_published';

-- AlterTable
ALTER TABLE "lp_units" ADD COLUMN     "content_source_bytes" INTEGER,
ADD COLUMN     "content_source_name" TEXT,
ADD COLUMN     "thumbnail_key" TEXT;

-- CreateTable
CREATE TABLE "lp_unit_drafts" (
    "unit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "duration_min" INTEGER NOT NULL,
    "tokens_award" INTEGER NOT NULL,
    "tokens_required" INTEGER NOT NULL,
    "creator_author_id" UUID,
    "thumbnail_key" TEXT,
    "content" JSONB,
    "content_source_name" TEXT,
    "content_source_bytes" INTEGER,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" UUID,

    CONSTRAINT "lp_unit_drafts_pkey" PRIMARY KEY ("unit_id")
);

-- AddForeignKey
ALTER TABLE "lp_unit_drafts" ADD CONSTRAINT "lp_unit_drafts_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_unit_drafts" ADD CONSTRAINT "lp_unit_drafts_creator_author_id_fkey" FOREIGN KEY ("creator_author_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_unit_drafts" ADD CONSTRAINT "lp_unit_drafts_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
