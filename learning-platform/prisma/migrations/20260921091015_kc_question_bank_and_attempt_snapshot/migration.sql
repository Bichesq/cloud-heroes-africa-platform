/*
  Warnings:

  - You are about to drop the column `questions` on the `lp_knowledge_checks` table. All the data in the column will be lost.

*/
-- NOTE: `prisma migrate dev` auto-diff again generated DropForeignKey
-- statements for the same 9 hand-authored student_id FKs this hit in
-- 20260921082108_add_flagged_and_question_reports (see that migration's own
-- header comment for the full explanation — they're real, intentional
-- DB-only constraints from 20260826014535_add_student_fk, deliberately not
-- modeled as Prisma @relation fields in lp-core.prisma). Removed by hand
-- again; this migration only touches lp_knowledge_checks/lp_kc_attempts and
-- creates the two new tables below.

-- AlterTable
ALTER TABLE "lp_kc_attempts" ADD COLUMN     "status" "lp_attempt_status" NOT NULL DEFAULT 'in_progress',
ADD COLUMN     "submitted_at" TIMESTAMP(3),
ALTER COLUMN "answers" DROP NOT NULL,
ALTER COLUMN "score" DROP NOT NULL,
ALTER COLUMN "passed" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lp_knowledge_checks" DROP COLUMN "questions",
ADD COLUMN     "questions_per_attempt" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "lp_kc_question_bank_items" (
    "id" UUID NOT NULL,
    "kc_id" TEXT NOT NULL,
    "difficulty" "lp_question_difficulty" NOT NULL DEFAULT 'medium',
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_option_id" TEXT NOT NULL,
    "explanation" TEXT,

    CONSTRAINT "lp_kc_question_bank_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_kc_attempt_questions" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "kc_question_bank_item_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "lp_kc_attempt_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lp_kc_attempt_questions_attempt_id_kc_question_bank_item_id_key" ON "lp_kc_attempt_questions"("attempt_id", "kc_question_bank_item_id");

-- AddForeignKey
ALTER TABLE "lp_kc_question_bank_items" ADD CONSTRAINT "lp_kc_question_bank_items_kc_id_fkey" FOREIGN KEY ("kc_id") REFERENCES "lp_knowledge_checks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_kc_attempt_questions" ADD CONSTRAINT "lp_kc_attempt_questions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "lp_kc_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_kc_attempt_questions" ADD CONSTRAINT "lp_kc_attempt_questions_kc_question_bank_item_id_fkey" FOREIGN KEY ("kc_question_bank_item_id") REFERENCES "lp_kc_question_bank_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
