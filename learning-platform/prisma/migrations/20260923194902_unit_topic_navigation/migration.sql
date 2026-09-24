-- NOTE: `prisma migrate dev` auto-diff again generated DropForeignKey
-- statements for the 9 hand-authored student_id FKs from
-- 20260826014535_add_student_fk (see 20260921082108_add_flagged_and_question_reports's
-- header comment — real, intentional DB-only constraints deliberately not
-- modeled as Prisma @relation fields). Removed by hand; this migration only
-- adds Topic ordering/description and the content-block → topic link.

-- AlterTable
ALTER TABLE "lp_content_blocks" ADD COLUMN     "topic_id" UUID;

-- AlterTable
ALTER TABLE "lp_topics" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "order" INTEGER;

-- CreateIndex
CREATE INDEX "lp_content_blocks_topic_id_idx" ON "lp_content_blocks"("topic_id");

-- CreateIndex
CREATE INDEX "lp_topics_unit_id_order_idx" ON "lp_topics"("unit_id", "order");

-- AddForeignKey
ALTER TABLE "lp_content_blocks" ADD CONSTRAINT "lp_content_blocks_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "lp_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
