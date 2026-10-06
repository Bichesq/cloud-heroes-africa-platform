-- Phase 4 sub-step 2 (plan 2026-09-21 §7): Program Setup "Last Updated" +
-- thumbnail key, and the authoring audit log. Prisma's auto-diff also
-- wanted to drop the 10 DB-only student FKs (known drift); removed by hand.

-- CreateEnum
CREATE TYPE "lp_authoring_audit_action" AS ENUM ('program_created', 'program_updated', 'creator_changed', 'thumbnail_changed', 'instructor_added', 'instructor_removed', 'contributor_added', 'contributor_removed', 'contributor_role_changed', 'director_added', 'director_removed', 'owner_added', 'owner_removed');

-- AlterTable
ALTER TABLE "lp_programs" ADD COLUMN     "thumbnail_key" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "lp_authoring_audit_log" (
    "id" UUID NOT NULL,
    "program_id" TEXT NOT NULL,
    "actor_author_id" UUID NOT NULL,
    "action" "lp_authoring_audit_action" NOT NULL,
    "subject_author_id" UUID,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_authoring_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lp_authoring_audit_log_program_id_created_at_idx" ON "lp_authoring_audit_log"("program_id", "created_at");

-- AddForeignKey
ALTER TABLE "lp_authoring_audit_log" ADD CONSTRAINT "lp_authoring_audit_log_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_authoring_audit_log" ADD CONSTRAINT "lp_authoring_audit_log_actor_author_id_fkey" FOREIGN KEY ("actor_author_id") REFERENCES "lp_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_authoring_audit_log" ADD CONSTRAINT "lp_authoring_audit_log_subject_author_id_fkey" FOREIGN KEY ("subject_author_id") REFERENCES "lp_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
