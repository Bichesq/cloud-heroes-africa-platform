-- NOTE: `prisma migrate dev` auto-diff again generated DropForeignKey
-- statements for the 9 hand-authored student_id FKs from
-- 20260826014535_add_student_fk (see 20260921082108_add_flagged_and_question_reports's
-- header comment — real, intentional DB-only constraints deliberately not
-- modeled as Prisma @relation fields). Removed by hand; this migration only
-- creates lp_student_topics, plus its own hand-authored student FK below.

-- CreateTable
CREATE TABLE "lp_student_topics" (
    "student_id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "unit_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_student_topics_pkey" PRIMARY KEY ("student_id","topic_id")
);

-- CreateIndex
CREATE INDEX "lp_student_topics_student_id_unit_id_idx" ON "lp_student_topics"("student_id", "unit_id");

-- AddForeignKey
ALTER TABLE "lp_student_topics" ADD CONSTRAINT "lp_student_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "lp_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_student_topics" ADD CONSTRAINT "lp_student_topics_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey (hand-authored, DB-only — same convention as 20260826014535_add_student_fk)
ALTER TABLE "lp_student_topics" ADD CONSTRAINT "lp_student_topics_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
