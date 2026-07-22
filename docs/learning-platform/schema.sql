-- ============================================================================
-- Learning Platform — target Postgres schema
-- ============================================================================
-- Documents the relational model the LP's JSON stores mirror 1:1
-- (learning-platform/data/*.json ↔ these tables, learning-platform/lib/store/*
-- is the only code that changes in the migration). Decisions: custom backend
-- on Postgres (2026-07-13, Payload CMS abandoned); JSONB for flexible payloads
-- (question definitions, assessment configs, rubrics) per requirements §12.
--
-- Shared identity tables (approved_emails, students, support_tickets,
-- audit_log) are owned by the platform core, not the LP — they correspond to
-- the repo-root data/*.json stores and are listed at the bottom for reference
-- only.
-- ============================================================================

-- ------------------------------------------------------------------
-- Content hierarchy: Program → Module → Unit → Section → Item
-- Authored in Learning Management; the LP only reads published content.
-- ------------------------------------------------------------------

CREATE TABLE lp_programs (
    id          text PRIMARY KEY,              -- e.g. 'cloud-practitioner'
    title       text NOT NULL,
    slug        text NOT NULL UNIQUE,
    blurb       text NOT NULL DEFAULT '',
    hero_image  text,                          -- static visual (data-light strategy)
    language    text NOT NULL DEFAULT 'en',    -- English-only V1 (2026-07-16)
    delivery    text NOT NULL DEFAULT 'self-paced',
    creators    jsonb NOT NULL DEFAULT '[]',   -- [{name, role, avatarUrl}] — multi-creator credit (2026-07-06)
    published   boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE lp_modules (
    id          text PRIMARY KEY,
    program_id  text NOT NULL REFERENCES lp_programs(id) ON DELETE CASCADE,
    title       text NOT NULL,
    "order"     integer NOT NULL,
    description text NOT NULL DEFAULT ''
);

CREATE TABLE lp_units (
    id              text PRIMARY KEY,
    module_id       text NOT NULL REFERENCES lp_modules(id) ON DELETE CASCADE,
    title           text NOT NULL,
    "order"         integer NOT NULL,
    description     text NOT NULL DEFAULT '',
    duration_min    integer NOT NULL DEFAULT 0,
    points_award    integer NOT NULL DEFAULT 0, -- granted on completion (2026-07-09 points system)
    points_required integer NOT NULL DEFAULT 0, -- unlock threshold; 0 = always open
    creators        jsonb NOT NULL DEFAULT '[]'
);

CREATE TABLE lp_sections (
    id      text PRIMARY KEY,
    unit_id text NOT NULL REFERENCES lp_units(id) ON DELETE CASCADE,
    title   text NOT NULL,
    "order" integer NOT NULL
);

-- Items are the atoms of the left rail. V1 types: reading, knowledge_check.
-- 'video' (fast-follow, 2026-07-16) and 'assessment' are reserved.
CREATE TABLE lp_items (
    id           text PRIMARY KEY,
    section_id   text NOT NULL REFERENCES lp_sections(id) ON DELETE CASCADE,
    type         text NOT NULL CHECK (type IN ('reading', 'knowledge_check', 'video', 'assessment')),
    title        text NOT NULL,
    "order"      integer NOT NULL,
    duration_min integer NOT NULL DEFAULT 0,
    hero_image   text,                          -- optional static hero visual
    kc_id        text REFERENCES lp_knowledge_checks(id) -- knowledge_check items only
);

-- Ordered content blocks inside a reading item. payload shape per type:
--   heading  {text, level?}          richtext {md}
--   image    {src, alt, caption?}    code     {lang, code}
--   callout  {tone: info|tip|warning, md}
-- A future 'video' block ({src, poster}) needs no migration — payload is JSONB.
CREATE TABLE lp_content_blocks (
    id      text PRIMARY KEY,
    item_id text NOT NULL REFERENCES lp_items(id) ON DELETE CASCADE,
    "order" integer NOT NULL,
    type    text NOT NULL CHECK (type IN ('heading', 'richtext', 'image', 'code', 'callout', 'video')),
    payload jsonb NOT NULL
);

-- ------------------------------------------------------------------
-- Knowledge Checks — separate from unit content (2026-07-02) so
-- assessment updates never force students to redo units.
-- ------------------------------------------------------------------

CREATE TABLE lp_knowledge_checks (
    id             text PRIMARY KEY,
    unit_id        text NOT NULL REFERENCES lp_units(id) ON DELETE CASCADE,
    title          text NOT NULL,
    pass_threshold numeric NOT NULL DEFAULT 0.7,  -- fraction correct required
    -- [{id, prompt, options: [{id, label}], correctOptionId, explanation}]
    questions      jsonb NOT NULL DEFAULT '[]'
);

-- ------------------------------------------------------------------
-- Student learning state
-- ------------------------------------------------------------------

CREATE TABLE lp_enrollments (
    student_id  uuid NOT NULL REFERENCES students(id),
    program_id  text NOT NULL REFERENCES lp_programs(id),
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    PRIMARY KEY (student_id, program_id)
);

-- Per-item completion — drives rail dots and unit progress %.
CREATE TABLE lp_student_items (
    student_id   uuid NOT NULL REFERENCES students(id),
    item_id      text NOT NULL REFERENCES lp_items(id),
    completed_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, item_id)
);

-- Dual-state unit model (2026-05-21): Completed (content finished) vs
-- Competent/Verified (knowledge checks passed), each with its own timestamp
-- (requirements §6). 'retake' is the post-KC-failure state.
CREATE TABLE lp_student_units (
    student_id   uuid NOT NULL REFERENCES students(id),
    unit_id      text NOT NULL REFERENCES lp_units(id),
    status       text NOT NULL CHECK (status IN ('in_progress', 'completed', 'retake', 'verified')),
    completed_at timestamptz,   -- stamped once, never cleared (a Retake keeps it)
    verified_at  timestamptz,
    updated_at   timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, unit_id)
);

CREATE TABLE lp_kc_attempts (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES students(id),
    kc_id      text NOT NULL REFERENCES lp_knowledge_checks(id),
    attempt_no integer NOT NULL,
    answers    jsonb NOT NULL,   -- {questionId: optionId | null (skipped)}
    score      numeric NOT NULL, -- fraction correct 0..1
    passed     boolean NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lp_kc_attempts_student_kc ON lp_kc_attempts (student_id, kc_id, created_at);

-- Append-only ledger (2026-07-09): balance = SUM(points), never a stored
-- counter. source_type 'assessment'/'adjustment' are extension points
-- (badges/gamification can add sources without schema changes).
CREATE TABLE lp_points_ledger (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  uuid NOT NULL REFERENCES students(id),
    source_type text NOT NULL CHECK (source_type IN ('unit_completion', 'kc_pass', 'assessment', 'adjustment')),
    source_id   text NOT NULL,
    points      integer NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, source_type, source_id)  -- idempotent awards
);

-- ------------------------------------------------------------------
-- Goals & deadlines — Goals Meeting Streak counts consecutive deadlines
-- met (2026-07-09), not logins. The "actual" date joins from
-- lp_student_units.completed_at.
-- ------------------------------------------------------------------

CREATE TABLE lp_unit_goals (
    student_id  uuid NOT NULL REFERENCES students(id),
    unit_id     text NOT NULL REFERENCES lp_units(id),
    target_date date NOT NULL,
    set_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, unit_id)
);

-- ------------------------------------------------------------------
-- Assessments — two kinds in one table (requirements §5, §8):
--   'readiness'  — dedicated Exam Readiness assessments (fully used in V1)
--   'standalone' — MCQ + practical submissions (schema extension point;
--                  submission workflow is an open decision, §13)
-- ------------------------------------------------------------------

CREATE TABLE lp_assessments (
    id          text PRIMARY KEY,
    kind        text NOT NULL CHECK (kind IN ('standalone', 'readiness')),
    scope       text NOT NULL CHECK (scope IN ('program', 'module', 'unit')),
    scope_id    text NOT NULL,   -- program/module/unit id per scope
    title       text NOT NULL,
    description text NOT NULL DEFAULT '',
    -- {questions?: [...KcQuestion], levels?: [{min, label}], practical?: {...}}
    config      jsonb NOT NULL DEFAULT '{}',
    rubric      jsonb            -- grading rubric — open decision (§13)
);

CREATE TABLE lp_assessment_results (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    uuid NOT NULL REFERENCES students(id),
    assessment_id text NOT NULL REFERENCES lp_assessments(id),
    score         numeric NOT NULL,  -- fraction 0..1
    level         text,              -- categorical readiness level from config.levels
    detail        jsonb,
    submitted_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lp_assessment_results_student ON lp_assessment_results (student_id, assessment_id, submitted_at);

-- ------------------------------------------------------------------
-- Escalations — "second KC failure notifies a team member" (2026-05-21).
-- The notification channel (Teams/email) is an open decision; this table
-- is the durable record + queue.
-- ------------------------------------------------------------------

CREATE TABLE lp_escalations (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   uuid NOT NULL REFERENCES students(id),
    kind         text NOT NULL CHECK (kind IN ('kc_second_failure')),
    ref_id       text NOT NULL,   -- kc id for kc_second_failure
    payload      jsonb NOT NULL DEFAULT '{}',  -- {unitId, programId, attemptCount}
    acknowledged boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Notes — one free-text note per (student, unit); V1-simple by design.
-- ------------------------------------------------------------------

CREATE TABLE lp_notes (
    student_id uuid NOT NULL REFERENCES students(id),
    unit_id    text NOT NULL REFERENCES lp_units(id),
    body       text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, unit_id)
);

-- ============================================================================
-- Shared platform tables (reference only — owned by the platform core, mirror
-- the repo-root data/*.json stores; Help context snapshots live on
-- support_tickets.context as JSONB, so the LP needs no help table of its own):
--
--   approved_emails(id, email, status, source, notes, created_by, ...)
--   students(id uuid, approved_email_id, email, given_name, family_name,
--            active_program_id, status, last_login, profile_completed_at, ...)
--   support_tickets(id, student_id, desk, category_id, topic, description,
--            preferred_channel, status, status_log jsonb, context jsonb
--            {programId, programTitle, moduleId, moduleTitle, unitId,
--             unitTitle}, ...)
--   audit_log(id, student_id, actor, actor_role, action, changes jsonb, ts)
-- ============================================================================
