-- CreateEnum
CREATE TYPE "lp_content_block_type" AS ENUM ('heading', 'richtext', 'image', 'code', 'callout', 'video');

-- CreateEnum
CREATE TYPE "lp_enrollment_status" AS ENUM ('active', 'completed');

-- CreateEnum
CREATE TYPE "lp_student_unit_status" AS ENUM ('in_progress', 'completed', 'retake', 'verified');

-- CreateEnum
CREATE TYPE "lp_token_source_type" AS ENUM ('unit_completion', 'kc_pass', 'assessment', 'adjustment');

-- CreateEnum
CREATE TYPE "lp_question_type" AS ENUM ('single_choice', 'multi_select');

-- CreateEnum
CREATE TYPE "lp_question_difficulty" AS ENUM ('easy', 'medium', 'difficult');

-- CreateEnum
CREATE TYPE "lp_attempt_status" AS ENUM ('in_progress', 'submitted', 'expired');

-- CreateEnum
CREATE TYPE "lp_escalation_kind" AS ENUM ('kc_second_failure', 'assessment_repeated_failure');

-- CreateTable
CREATE TABLE "lp_programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "blurb" TEXT NOT NULL DEFAULT '',
    "hero_image" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "delivery" TEXT NOT NULL DEFAULT 'self-paced',
    "creators" JSONB NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_modules" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "lp_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_units" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "duration_min" INTEGER NOT NULL DEFAULT 0,
    "hero_image" TEXT,
    "tokens_award" INTEGER NOT NULL DEFAULT 0,
    "tokens_required" INTEGER NOT NULL DEFAULT 0,
    "creators" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "lp_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_knowledge_checks" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pass_threshold" DECIMAL(65,30) NOT NULL DEFAULT 0.7,
    "questions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "lp_knowledge_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_content_blocks" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "lp_content_block_type" NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "lp_content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_enrollments" (
    "student_id" UUID NOT NULL,
    "program_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "lp_enrollment_status" NOT NULL DEFAULT 'active',

    CONSTRAINT "lp_enrollments_pkey" PRIMARY KEY ("student_id","program_id")
);

-- CreateTable
CREATE TABLE "lp_student_units" (
    "student_id" UUID NOT NULL,
    "unit_id" TEXT NOT NULL,
    "status" "lp_student_unit_status" NOT NULL,
    "completed_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_student_units_pkey" PRIMARY KEY ("student_id","unit_id")
);

-- CreateTable
CREATE TABLE "lp_kc_attempts" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "kc_id" TEXT NOT NULL,
    "attempt_no" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_kc_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_token_ledger" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "source_type" "lp_token_source_type" NOT NULL,
    "source_id" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_token_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_unit_goals" (
    "student_id" UUID NOT NULL,
    "unit_id" TEXT NOT NULL,
    "target_date" DATE NOT NULL,
    "set_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_unit_goals_pkey" PRIMARY KEY ("student_id","unit_id")
);

-- CreateTable
CREATE TABLE "lp_notes" (
    "student_id" UUID NOT NULL,
    "unit_id" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_notes_pkey" PRIMARY KEY ("student_id","unit_id")
);

-- CreateTable
CREATE TABLE "lp_readiness_assessments" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "config" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "lp_readiness_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_readiness_results" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "level" TEXT,
    "detail" JSONB,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_readiness_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_topics" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "unit_id" TEXT,

    CONSTRAINT "lp_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_standalone_assessments" (
    "id" TEXT NOT NULL,
    "module_id" TEXT,
    "program_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "questions_per_attempt" INTEGER NOT NULL,
    "difficulty_mix" JSONB NOT NULL DEFAULT '{}',
    "pass_threshold" DECIMAL(65,30) NOT NULL DEFAULT 0.75,
    "time_limit_seconds" INTEGER NOT NULL,

    CONSTRAINT "lp_standalone_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_question_bank_items" (
    "id" UUID NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "topic_id" UUID,
    "type" "lp_question_type" NOT NULL,
    "difficulty" "lp_question_difficulty" NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_option_ids" JSONB NOT NULL,
    "points_possible" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "explanation" TEXT,

    CONSTRAINT "lp_question_bank_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_assessment_attempts" (
    "id" UUID NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "lp_attempt_status" NOT NULL DEFAULT 'in_progress',
    "score" DECIMAL(65,30),
    "passed" BOOLEAN,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_saved_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "next_eligible_at" TIMESTAMP(3),
    "weak_topics" JSONB,

    CONSTRAINT "lp_assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_attempt_questions" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_bank_item_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "lp_attempt_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lp_attempt_answers" (
    "attempt_question_id" UUID NOT NULL,
    "selected_option_ids" JSONB NOT NULL DEFAULT '[]',
    "points_earned" DECIMAL(65,30),
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_attempt_answers_pkey" PRIMARY KEY ("attempt_question_id")
);

-- CreateTable
CREATE TABLE "lp_escalations" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "kind" "lp_escalation_kind" NOT NULL,
    "ref_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lp_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lp_programs_slug_key" ON "lp_programs"("slug");

-- CreateIndex
CREATE INDEX "lp_kc_attempts_student_kc" ON "lp_kc_attempts"("student_id", "kc_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "lp_token_ledger_student_id_source_type_source_id_key" ON "lp_token_ledger"("student_id", "source_type", "source_id");

-- CreateIndex
CREATE INDEX "lp_readiness_results_student" ON "lp_readiness_results"("student_id", "assessment_id", "submitted_at");

-- CreateIndex
CREATE INDEX "lp_assessment_attempts_student" ON "lp_assessment_attempts"("student_id", "assessment_id", "attempt_number");

-- CreateIndex
CREATE UNIQUE INDEX "lp_assessment_attempts_assessment_id_student_id_attempt_num_key" ON "lp_assessment_attempts"("assessment_id", "student_id", "attempt_number");

-- CreateIndex
CREATE UNIQUE INDEX "lp_attempt_questions_attempt_id_question_bank_item_id_key" ON "lp_attempt_questions"("attempt_id", "question_bank_item_id");

-- AddForeignKey
ALTER TABLE "lp_modules" ADD CONSTRAINT "lp_modules_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_units" ADD CONSTRAINT "lp_units_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "lp_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_knowledge_checks" ADD CONSTRAINT "lp_knowledge_checks_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_content_blocks" ADD CONSTRAINT "lp_content_blocks_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_enrollments" ADD CONSTRAINT "lp_enrollments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_student_units" ADD CONSTRAINT "lp_student_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_kc_attempts" ADD CONSTRAINT "lp_kc_attempts_kc_id_fkey" FOREIGN KEY ("kc_id") REFERENCES "lp_knowledge_checks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_unit_goals" ADD CONSTRAINT "lp_unit_goals_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_notes" ADD CONSTRAINT "lp_notes_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_readiness_assessments" ADD CONSTRAINT "lp_readiness_assessments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_readiness_results" ADD CONSTRAINT "lp_readiness_results_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "lp_readiness_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_topics" ADD CONSTRAINT "lp_topics_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "lp_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_standalone_assessments" ADD CONSTRAINT "lp_standalone_assessments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "lp_modules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_standalone_assessments" ADD CONSTRAINT "lp_standalone_assessments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "lp_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_question_bank_items" ADD CONSTRAINT "lp_question_bank_items_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "lp_standalone_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_question_bank_items" ADD CONSTRAINT "lp_question_bank_items_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "lp_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_assessment_attempts" ADD CONSTRAINT "lp_assessment_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "lp_standalone_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_attempt_questions" ADD CONSTRAINT "lp_attempt_questions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "lp_assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_attempt_questions" ADD CONSTRAINT "lp_attempt_questions_question_bank_item_id_fkey" FOREIGN KEY ("question_bank_item_id") REFERENCES "lp_question_bank_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lp_attempt_answers" ADD CONSTRAINT "lp_attempt_answers_attempt_question_id_fkey" FOREIGN KEY ("attempt_question_id") REFERENCES "lp_attempt_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
