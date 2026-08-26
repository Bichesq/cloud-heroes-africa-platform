-- CreateEnum
CREATE TYPE "approved_email_status" AS ENUM ('approved', 'revoked', 'pending');

-- CreateEnum
CREATE TYPE "approved_email_source" AS ENUM ('form', 'manual', 'import');

-- CreateEnum
CREATE TYPE "student_status" AS ENUM ('active', 'banned');

-- CreateEnum
CREATE TYPE "support_desk" AS ENUM ('help', 'service');

-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('open', 'pending', 'responded', 'resolved', 'cancelled');

-- CreateEnum
CREATE TYPE "audit_actor_role" AS ENUM ('student', 'admin');

-- CreateEnum
CREATE TYPE "todo_source" AS ENUM ('student', 'system');

-- CreateEnum
CREATE TYPE "learning_event_type" AS ENUM ('learning', 'community', 'other');

-- CreateTable
CREATE TABLE "approved_emails" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "status" "approved_email_status" NOT NULL DEFAULT 'pending',
    "source" "approved_email_source" NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" TEXT,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "approved_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "approved_email_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "given_name" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "legal_name" TEXT,
    "display_name" TEXT,
    "phone" TEXT,
    "alternate_email" TEXT,
    "birth_date" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT,
    "track" TEXT,
    "avatar_url" TEXT,
    "photo_public" BOOLEAN NOT NULL DEFAULT true,
    "country_public" BOOLEAN NOT NULL DEFAULT true,
    "mfa_methods" JSONB NOT NULL DEFAULT '[]',
    "passkeys" JSONB NOT NULL DEFAULT '[]',
    "active_program_id" TEXT,
    "status" "student_status" NOT NULL DEFAULT 'active',
    "last_login" TIMESTAMP(3) NOT NULL,
    "profile_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL,
    "student_id" UUID,
    "desk" "support_desk" NOT NULL,
    "category_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "preferred_channel" TEXT,
    "status" "ticket_status" NOT NULL DEFAULT 'open',
    "status_log" JSONB NOT NULL DEFAULT '[]',
    "assigned_to" TEXT,
    "resolved_by" TEXT,
    "resolution_summary" TEXT,
    "context" JSONB NOT NULL DEFAULT '{}',
    "closed_at" TIMESTAMP(3),
    "contact_name" TEXT,
    "contact_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "actor" TEXT NOT NULL,
    "actor_role" "audit_actor_role" NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '[]',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "due_date" TEXT,
    "link" TEXT,
    "source" "todo_source" NOT NULL DEFAULT 'student',
    "completed_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "dismissed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "type" "learning_event_type" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "link" TEXT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sh_mock_programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "modules" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "sh_mock_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sh_unit_completions" (
    "student_id" UUID NOT NULL,
    "unit_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sh_unit_completions_pkey" PRIMARY KEY ("student_id","unit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "approved_emails_email_key" ON "approved_emails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");
