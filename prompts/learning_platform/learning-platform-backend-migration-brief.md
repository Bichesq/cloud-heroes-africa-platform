# Learning Platform — Backend Migration & Assessment Engine Rebuild

> Brief for Claude Code. Produced 2026-08-11 by Bichesq + Claude (chat), reconciling the existing repo (`learning-platform/`, `docs/learning-platform/schema.sql`) against decisions made through 2026-08-06 and a subsequent design session. This is a **migration and rebuild** brief, not a green-field scaffold — `learning-platform/` already exists and works; treat existing code as the starting point.

---

## 0. How to use this document

1. Read this whole document before touching code.
2. **Before writing the data migration script (§5), inspect the actual current shape of every file in `learning-platform/data/*.json`.** This brief was written from a repo audit that listed filenames but not full contents for every store. Do not assume a 1:1 file-per-table shape — some of the hierarchy (modules/sections/units/content-blocks) may be nested inside a single `lp-programs.json` document tree rather than flat files. Confirm before migrating.
3. Where this brief says a table/column is "renamed," the migration must move existing data, not just change code that writes new data going forward.
4. Everything in §3 is intended to fully replace `docs/learning-platform/schema.sql`. Update that file to match once the migration is implemented.

---

## 1. Terminology: points → tokens

Rename throughout — schema, JSON stores, route handlers, UI copy:
- `lp_points_ledger` → `lp_token_ledger`
- `points_award` → `tokens_award`
- `points_required` → `tokens_required`
- `points` (column) → `tokens`
- Any UI/copy string containing "points" in the LP context → "tokens"

This does not touch Knowledge Check `pass_threshold` or Assessment scoring — those were never "points" in the progression-currency sense, no change needed there.

---

## 2. Content hierarchy: Program → Module → Unit (no intermediate levels)

**Final decision (2026-08-11, supersedes an earlier draft of this brief):** exactly three levels — `Program → Module → Unit`. An earlier revision of this brief introduced a "Section" level between Module and Unit; that has been reversed. Unit is a plain content container: no `type` field, and no structure below it beyond its own `ContentBlock`s (which are content payload, not a hierarchy level).

Mapping from the **original** repo schema (`lp_units → lp_sections → lp_items → lp_content_blocks`) straight to the final target:

| Original table (original role) | → | Final table (final role) |
|---|---|---|
| `lp_units` (coarse grouping; held `points_award`/`points_required`/creators; tested by a KC as a whole) | merges into → | `lp_units` (single level now; keeps `tokens_award`/`tokens_required`/`creators` — see §1 rename) |
| `lp_sections` (grouping between Unit and Item) | eliminated entirely | — |
| `lp_items` (atomic content node with a `type`: reading/knowledge_check/video/assessment) | merges into → | `lp_units` (its `duration_min`/`hero_image` fold in; its `type` field and `kc_id` FK are **dropped** — see below) |
| `lp_content_blocks.item_id` | FK now points at → | `lp_units.id` directly |
| `lp_knowledge_checks.unit_id` | unchanged target/meaning | `lp_units.id` — a KC tests a Unit as a whole. A Unit "has" a Knowledge Check simply by a `lp_knowledge_checks` row referencing it; no `type` field needed to express that. |
| `lp_student_items` (per-item completion) | eliminated — no separate leaf-level tracking needed once there's no leaf below Unit | — |
| `lp_student_units` (dual completed/verified/retake, at the coarse level) | unchanged target/meaning | `lp_units.id` — this reverts to matching the **original** repo schema almost exactly |

Net effect: this schema ends up very close to the *original* repo schema, with three real differences from it: (1) the `lp_sections`/`lp_items` split is removed — original `lp_units` and `lp_items` merge into one `lp_units` table, (2) `points_*` → `tokens_*` (§1), (3) `lp_items.type` and `lp_items.kc_id` are dropped entirely — video content is just a `ContentBlock` of `type='video'`, and standalone Assessments were never unit-scoped anyway (they attach to Module/Program directly, see §3).

**Correct Eddie's Figma design accordingly, and be explicit about it this time:** the "Section 1 / Section 2" groupings with individually-timed sub-items in the Course View mockup are a **content-authoring/display convenience inside a single Unit's body** (e.g., heading-type content blocks creating visual breaks) — not trackable data entities of any kind. This is the second revision of this finding; make sure it's communicated to Eddie/Bashek clearly enough not to need a third.

**UI directive — no exceptions:** when the Course View is implemented, it must not display any Section-like grouping or label anywhere — not "Section 1," not a numbered/titled divider, nothing — **even purely as a cosmetic/visual element with no backing data.** A `heading`-type `ContentBlock` may create a visual break in the body text (per its own title), but that is authored content, not a structural "Section" indicator. If a design still shows a labeled section-style grouping in the Course View, treat that as the design being wrong, not as a harmless cosmetic layer to keep.

---

## 3. Target Postgres schema

This fully replaces `docs/learning-platform/schema.sql`. Comments preserve the decision-log rationale where it still applies; new comments mark what changed.

```sql
-- ============================================================================
-- Learning Platform — target Postgres schema (v2)
-- ============================================================================

-- ------------------------------------------------------------------
-- Content hierarchy: Program → Module → Unit → ContentBlock. Exactly
-- three navigational levels, period (2026-08-11, final). Authored in
-- Learning Management; LP only reads published content.
-- ------------------------------------------------------------------

CREATE TABLE lp_programs (
    id          text PRIMARY KEY,
    title       text NOT NULL,
    slug        text NOT NULL UNIQUE,
    blurb       text NOT NULL DEFAULT '',
    hero_image  text,
    language    text NOT NULL DEFAULT 'en',
    delivery    text NOT NULL DEFAULT 'self-paced',
    creators    jsonb NOT NULL DEFAULT '[]',
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

-- Unit is the only level between Module and content. It carries the
-- unlock-gating tokens, is what a Knowledge Check tests, and is a plain
-- content container otherwise — no `type` field, no children other than
-- its own ContentBlocks. (2026-08-11: merges the original lp_units and
-- lp_items; lp_sections is eliminated entirely.)
CREATE TABLE lp_units (
    id              text PRIMARY KEY,
    module_id       text NOT NULL REFERENCES lp_modules(id) ON DELETE CASCADE,
    title           text NOT NULL,
    "order"         integer NOT NULL,
    description     text NOT NULL DEFAULT '',
    duration_min    integer NOT NULL DEFAULT 0,
    hero_image      text,
    tokens_award    integer NOT NULL DEFAULT 0,  -- renamed from points_award
    tokens_required integer NOT NULL DEFAULT 0,  -- renamed from points_required; unlock threshold; 0 = always open
    creators        jsonb NOT NULL DEFAULT '[]'
);

-- A Knowledge Check tests a Unit as a whole. The unit having one is
-- expressed by this table referencing it, not by a type field on the unit.
CREATE TABLE lp_knowledge_checks (
    id             text PRIMARY KEY,
    unit_id        text NOT NULL REFERENCES lp_units(id) ON DELETE CASCADE,
    title          text NOT NULL,
    pass_threshold numeric NOT NULL DEFAULT 0.7,
    -- [{id, prompt, options: [{id, label}], correctOptionId, explanation}]
    questions      jsonb NOT NULL DEFAULT '[]'
);

-- Ordered content blocks inside a Unit's body. This is where video lives
-- (type='video'), not a separate unit-level type — payload is JSONB so a
-- future block type needs no migration.
CREATE TABLE lp_content_blocks (
    id      text PRIMARY KEY,
    unit_id text NOT NULL REFERENCES lp_units(id) ON DELETE CASCADE,
    "order" integer NOT NULL,
    type    text NOT NULL CHECK (type IN ('heading', 'richtext', 'image', 'code', 'callout', 'video')),
    payload jsonb NOT NULL
);

-- ------------------------------------------------------------------
-- Enrollment — thin, LP-owned until an Administration surface exists.
-- ------------------------------------------------------------------

CREATE TABLE lp_enrollments (
    student_id  uuid NOT NULL REFERENCES students(id),
    program_id  text NOT NULL REFERENCES lp_programs(id),
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    status      text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    PRIMARY KEY (student_id, program_id)
);

-- ------------------------------------------------------------------
-- Student progress
-- ------------------------------------------------------------------

-- Dual-state model (2026-05-21): Completed (content finished) vs
-- Competent/Verified (knowledge check passed), each with its own
-- timestamp. 'retake' is the post-KC-failure state. (2026-08-11: with
-- Section removed, this is the single progress table again — no separate
-- leaf-level completion table needed.)
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
    answers    jsonb NOT NULL,
    score      numeric NOT NULL,
    passed     boolean NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lp_kc_attempts_student_kc ON lp_kc_attempts (student_id, kc_id, created_at);

-- Append-only ledger. balance = SUM(tokens). Idempotent awards via the
-- unique constraint. (2026-08-11: renamed from lp_points_ledger.)
CREATE TABLE lp_token_ledger (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  uuid NOT NULL REFERENCES students(id),
    source_type text NOT NULL CHECK (source_type IN ('unit_completion', 'kc_pass', 'assessment', 'adjustment')),
    source_id   text NOT NULL,
    tokens      integer NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, source_type, source_id)
);

-- Goals Meeting Streak deadlines.
CREATE TABLE lp_unit_goals (
    student_id  uuid NOT NULL REFERENCES students(id),
    unit_id     text NOT NULL REFERENCES lp_units(id),
    target_date date NOT NULL,
    set_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, unit_id)
);

-- One free-text note per (student, unit).
CREATE TABLE lp_notes (
    student_id uuid NOT NULL REFERENCES students(id),
    unit_id    text NOT NULL REFERENCES lp_units(id),
    body       text NOT NULL DEFAULT '',
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, unit_id)
);

-- ------------------------------------------------------------------
-- Exam Readiness — UNCHANGED shape from the existing schema, kept
-- deliberately simple (fixed question set, no randomization/time-box).
-- ASSUMPTION: the Aug 6 assessment-engine rules (question banks,
-- randomization, cooldowns, time limits) apply to standalone Assessments
-- only, not Readiness. Flag if this is wrong.
-- ------------------------------------------------------------------

CREATE TABLE lp_readiness_assessments (
    id          text PRIMARY KEY,
    program_id  text NOT NULL REFERENCES lp_programs(id),
    title       text NOT NULL,
    description text NOT NULL DEFAULT '',
    -- {questions: [...], levels: [{min, label}]}
    config      jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE lp_readiness_results (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    uuid NOT NULL REFERENCES students(id),
    assessment_id text NOT NULL REFERENCES lp_readiness_assessments(id),
    score         numeric NOT NULL,
    level         text,
    detail        jsonb,
    submitted_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX lp_readiness_results_student ON lp_readiness_results (student_id, assessment_id, submitted_at);

-- ------------------------------------------------------------------
-- Standalone Assessments — FULL REBUILD per Aug 6 decisions. The old
-- lp_assessments/lp_assessment_results (fixed question list, no bank,
-- no randomization, no time-box, no cooldowns) is replaced entirely for
-- this assessment kind. Practical/file-upload submissions are DROPPED
-- from V1 per 2026-08-11 decision (existing 'practical' config field in
-- shipped data should be migrated out, not carried forward).
-- ------------------------------------------------------------------

CREATE TABLE lp_topics (
    id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name    text NOT NULL,
    unit_id text REFERENCES lp_units(id)  -- links a topic back to what to review
);

CREATE TABLE lp_standalone_assessments (
    id                    text PRIMARY KEY,
    module_id             text REFERENCES lp_modules(id),   -- module-end assessment
    program_id            text REFERENCES lp_programs(id),  -- program-end assessment
    title                 text NOT NULL,
    description           text NOT NULL DEFAULT '',
    questions_per_attempt integer NOT NULL,
    difficulty_mix        jsonb NOT NULL DEFAULT '{}',  -- e.g. {"easy":4,"medium":4,"difficult":2}
    pass_threshold        numeric NOT NULL DEFAULT 0.75,
    time_limit_seconds    integer NOT NULL,
    CHECK (num_nonnulls(module_id, program_id) = 1)
);

CREATE TABLE lp_question_bank_items (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id       text NOT NULL REFERENCES lp_standalone_assessments(id) ON DELETE CASCADE,
    topic_id            uuid REFERENCES lp_topics(id),
    type                text NOT NULL CHECK (type IN ('single_choice', 'multi_select')),  -- V1 scope only
    difficulty          text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'difficult')),
    prompt              text NOT NULL,
    options             jsonb NOT NULL,             -- [{id, label}]
    correct_option_ids  jsonb NOT NULL,             -- [id, ...]
    points_possible     numeric NOT NULL DEFAULT 1,
    explanation         text
);

CREATE TABLE lp_assessment_attempts (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id  text NOT NULL REFERENCES lp_standalone_assessments(id),
    student_id     uuid NOT NULL REFERENCES students(id),
    attempt_number integer NOT NULL,
    status         text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'expired')),
    score          numeric,
    passed         boolean,
    started_at     timestamptz NOT NULL DEFAULT now(),  -- clock start, for time-limit enforcement
    last_saved_at  timestamptz,                          -- updated on every autosave
    submitted_at   timestamptz,
    next_eligible_at timestamptz,                         -- cached cooldown, computed at grading
    weak_topics    jsonb,                                 -- [{topic_id, topic_name, unit_id, score_pct}]
    UNIQUE (assessment_id, student_id, attempt_number)
);
CREATE INDEX lp_assessment_attempts_student ON lp_assessment_attempts (student_id, assessment_id, attempt_number DESC);

-- Snapshot of which questions were randomly selected for a specific
-- attempt — preserves exact historical record even as retakes re-randomize.
CREATE TABLE lp_attempt_questions (
    id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id             uuid NOT NULL REFERENCES lp_assessment_attempts(id) ON DELETE CASCADE,
    question_bank_item_id  uuid NOT NULL REFERENCES lp_question_bank_items(id),
    order_index            integer NOT NULL,
    UNIQUE (attempt_id, question_bank_item_id)
);

-- 1:1 with lp_attempt_questions; written progressively (upsert) to support
-- save-and-resume. points_earned is numeric to encode multi-select partial
-- credit; both selected_option_ids and points_earned stay hidden from the
-- client until submission ("no correctness during attempt").
CREATE TABLE lp_attempt_answers (
    attempt_question_id uuid PRIMARY KEY REFERENCES lp_attempt_questions(id) ON DELETE CASCADE,
    selected_option_ids  jsonb NOT NULL DEFAULT '[]',
    points_earned        numeric,
    answered_at          timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------
-- Escalations — extended to cover repeated Assessment failure, not just
-- KC second failure. (2026-08-11.)
-- ------------------------------------------------------------------

CREATE TABLE lp_escalations (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   uuid NOT NULL REFERENCES students(id),
    kind         text NOT NULL CHECK (kind IN ('kc_second_failure', 'assessment_repeated_failure')),
    ref_id       text NOT NULL,   -- kc id, or standalone assessment id
    payload      jsonb NOT NULL DEFAULT '{}',
    acknowledged boolean NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now()
);
```

---

## 4. Assessment engine — build scope and business rules

This is the highest-risk part of the rebuild. Implement the scoring/randomization/cooldown logic as **pure, unit-tested functions first**, independent of HTTP and DB, before wiring into route handlers.

**Randomization & difficulty mix**: when a student starts a new attempt, select `questions_per_attempt` questions from `lp_question_bank_items` (filtered to `assessment_id`), respecting `difficulty_mix` proportions, and write them to `lp_attempt_questions`.

**Save-and-resume**: answers are persisted as the student selects them (upsert into `lp_attempt_answers` by `attempt_question_id`), with `lp_assessment_attempts.last_saved_at` updated on each save. Resuming an `in_progress` attempt reloads its existing `lp_attempt_questions`/`lp_attempt_answers` rows — do not generate new questions for a resumed attempt.

**Time limit enforcement**: must be server-side, not just a client countdown. At minimum, reject/force-submit on the submit endpoint if `now() > started_at + time_limit_seconds`. Consider a periodic sweep for attempts abandoned mid-way that never call submit.

**Scoring & partial credit**: for each `lp_attempt_question`, compare `lp_attempt_answers.selected_option_ids` against `lp_question_bank_items.correct_option_ids`. Multi-select questions get proportional partial credit distributed across required correct options (per the Aug 6 decision — e.g., a 1-point question with 3 required correct options awards partial credit per correct selection, not all-or-nothing).

**Weak-topic feedback**: at grading time, group the attempt's questions by `topic_id`, compute `sum(points_earned)/sum(points_possible)` per topic **for this attempt only** (not rolled up across attempt history), and flag any topic scoring below `pass_threshold` as weak. Store as `lp_assessment_attempts.weak_topics`, each entry carrying the `unit_id` to review (via `lp_topics.unit_id`). If the attempt fails but no topic individually falls below threshold, the API should return a generic "review the full module" fallback rather than an empty list.

**No correctness during attempt**: never return `correct_option_ids` or `points_earned` from any endpoint until after submission.

**Post-fail feedback**: return the `weak_topics` rollup, not a full per-question answer key. (This corrects Eddie's current "Oops You Failed" mockup, which shows full correct/incorrect + explanation per question — flag that mockup for revision, don't build against it as-is.)

**Retake cooldowns**: progressive — 1 hour after 1st failure, 3 hours after 2nd, 24 hours after 3rd and beyond. Compute and store `next_eligible_at` on the attempt row at grading time.

**Retake behavior**: always restarts from question 1 with freshly randomized questions from the bank — no partial progress carried forward from a failed attempt.

**Escalation**: after repeated failures on a standalone assessment (mirror the KC "notify on 2nd failure" pattern — confirm exact threshold with the team, not specified for Assessments as precisely as it is for KCs), insert into `lp_escalations` with `kind='assessment_repeated_failure'`.

**Idempotent submission**: guard against a retried "submit" request double-processing — the `UNIQUE(assessment_id, student_id, attempt_number)` constraint plus checking `status != 'submitted'` before processing should cover this.

---

## 5. Data migration plan

1. **Inspect current JSON shapes first** (see §0.2) — do not assume the schema.sql table boundaries match file boundaries 1:1 in the actual JSON stores.
2. Stand up Postgres locally (native install, not Docker — per team preference) and add Prisma to `learning-platform/` (introspect or hand-write `schema.prisma` from §3).
3. Write a one-time migration script that:
   - Walks existing program/module/unit/section/item/content-block JSON and re-maps into the single, flattened `lp_units` shape per the §2 table (original `lp_units` + `lp_items` merge; `lp_sections` data is dropped, its rows' content re-parented directly to their former unit_id's module).
   - Renames `points_*` fields to `tokens_*` as it migrates.
   - For the one existing standalone assessment (`final-lp-m1`), migrates its fixed 3-question list into `lp_question_bank_items` (as a starting bank, even though it's smaller than a "large randomized bank" — real content growth is a content-authoring task, not a migration blocker) and **drops the `practical` submission field** per the 2026-08-11 decision.
   - Leaves the readiness assessment (`readiness-cloud-practitioner`) essentially as-is, moved into `lp_readiness_assessments`/`lp_readiness_results`.
4. Swap `lib/store/*.json` calls for Prisma calls **module by module** (content → progress → knowledge-checks → assessments → goals/readiness), matching the existing `json-store.ts` comment's own stated intent — this was anticipated in the code already.
5. Do not delete the original JSON files until the Postgres-backed version has been verified against them.

---

## 6. Build order

1. Schema + migration script (§3, §5) — get real data into Postgres and verified before writing new business logic.
2. `content` + `progress` modules on Prisma (simplest, proves the swap works end-to-end).
3. `knowledge-checks` module (mostly unchanged logic — `unit_id` FK target is unchanged in meaning from the original schema).
4. `assessments` module — the full rebuild (§4). Write and test the pure scoring/randomization functions before the route handlers.
5. `goals`/`readiness` modules (smallest, do last).
6. Extend `lp_escalations` handling to cover assessment failures once the assessment module's failure-count logic exists.

---

## 7. Explicitly out of scope for this pass

- Badges/gamification, advanced student bypass, placement assessment location — still Open per the team decision log, not touched here.
- The "Report an Issue" → Learning Management content-feedback path — pending team confirmation, not built until confirmed.
- Course ratings/reviews — unresolved whether this is a real feature; do not build backend support for it yet.
- Video content delivery — reserved via `lp_content_blocks.type='video'` but not a V1 build target.

---

## 8. Testing expectations

Given this repo has no test runner configured at all yet, add one (Vitest recommended) as part of this work — at minimum:
- Unit tests for the randomization/difficulty-mix selection function.
- Unit tests for multi-select partial-credit scoring, including the proportional-distribution edge case from the Aug 6 example (1-point question, 3 required correct options).
- Unit tests for the weak-topic computation, including the "no topic below threshold despite failing" fallback case.
- Unit tests for cooldown progression (1h/3h/24h) across multiple consecutive failures.
- An integration test for the full submit flow verifying idempotency on a retried request.