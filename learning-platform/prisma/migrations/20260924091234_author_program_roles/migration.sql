-- NOTE: `prisma migrate dev` auto-diff again generated DropForeignKey
-- statements for the 10 hand-authored DB-only student_id FKs
-- (20260826014535_add_student_fk + 20260924072958_student_topic_progress;
-- see 20260921082108_add_flagged_and_question_reports's header comment).
-- Removed by hand; this migration only adds the Phase 4 authoring
-- identity + program-role tables and the two creator_author_id columns.

-- CreateEnum
CREATE TYPE "lp_contributor_role" AS ENUM ('editor', 'reviewer', 'viewer');

-- AlterTable
ALTER TABLE "lp_programs" ADD COLUMN     "creator_author_id" UUID;

-- AlterTable
ALTER TABLE "lp_units" ADD COLUMN     "creator_author_id" UUID;

-- CreateTable
CREATE TABLE "lp_authors" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "entra_oid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_program_contributors" (
    "program_id" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "role" "lp_contributor_role" NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by_id" UUID,

    CONSTRAINT "lp_program_contributors_pkey" PRIMARY KEY ("program_id","author_id")
);

-- CreateTable
CREATE TABLE "lp_program_instructors" (
    "program_id" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by_id" UUID,

    CONSTRAINT "lp_program_instructors_pkey" PRIMARY KEY ("program_id","author_id")
);

-- CreateTable
CREATE TABLE "lp_program_directors" (
    "program_id" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by_id" UUID,

    CONSTRAINT "lp_program_directors_pkey" PRIMARY KEY ("program_id","author_id")
);

-- CreateTable
CREATE TABLE "lp_program_owners" (
    "program_id" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "added_by_id" UUID,

    CONSTRAINT "lp_program_owners_pkey" PRIMARY KEY ("program_id","author_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lp_authors_email_key" ON "lp_authors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lp_authors_entra_oid_key" ON "lp_authors"("entra_oid");

-- CreateIndex
CREATE INDEX "lp_program_contributors_author_id_idx" ON "lp_program_contributors"("author_id");

-- CreateIndex
CREATE INDEX "lp_program_instructors_author_id_idx" ON "lp_program_instructors"("author_id");

-- CreateIndex
CREATE INDEX "lp_program_directors_author_id_idx" ON "lp_program_directors"("author_id");

-- CreateIndex
CREATE INDEX "lp_program_owners_author_id_idx" ON "lp_program_owners"("author_id");

-- AddForeignKey
ALTER TABLE "lp_programs" ADD CONSTRAINT "lp_programs_creator_author_id_fkey" FOREIGN KEY ("creator_author_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_units" ADD CONSTRAINT "lp_units_creator_author_id_fkey" FOREIGN KEY ("creator_author_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_contributors" ADD CONSTRAINT "lp_program_contributors_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_contributors" ADD CONSTRAINT "lp_program_contributors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "lp_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_contributors" ADD CONSTRAINT "lp_program_contributors_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_instructors" ADD CONSTRAINT "lp_program_instructors_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_instructors" ADD CONSTRAINT "lp_program_instructors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "lp_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_instructors" ADD CONSTRAINT "lp_program_instructors_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_directors" ADD CONSTRAINT "lp_program_directors_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_directors" ADD CONSTRAINT "lp_program_directors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "lp_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_directors" ADD CONSTRAINT "lp_program_directors_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_owners" ADD CONSTRAINT "lp_program_owners_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_owners" ADD CONSTRAINT "lp_program_owners_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "lp_authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_program_owners" ADD CONSTRAINT "lp_program_owners_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "lp_authors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
