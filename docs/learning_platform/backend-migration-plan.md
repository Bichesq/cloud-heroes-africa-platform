# Learning Platform Backend Migration — Discovery + Plan

> Status (2026-08-13): Phase 1 (schema.prisma + migration script, written but
> not run against real data) is complete and reviewed. Phase 2 (module-by-module
> `lib/store`/route swap to Prisma, per §3 below) is in progress. This file is
> the plan as originally approved — see `learning-platform/prisma/schema.prisma`
> and `learning-platform/scripts/migrate-to-postgres.ts` for the Phase 1
> deliverables it describes.

## Next-step scope (per `prompts/learning_platform/step_2_onwards.md`)

The user has reviewed the discovery + plan below and asked me to proceed with **Phase 1 only**: write `schema.prisma` (from §3) and the one-time migration script (§5/§2 below), and **show both before running the script against real data**. Explicitly **not** in scope for this pass: actually executing the migration, and any Phase 2 work (swapping `lib/store/*`/routes to Prisma module-by-module, §6 steps 2+). I will stop once schema + script are written and presented, before running anything or touching `lib/`/`app/`.

## Context

`prompts/learning_platform/learning-platform-backend-migration-brief.md` is a migration/rebuild brief for the existing `learning-platform/` app: rename points→tokens, collapse the Program→Module→**Section**→Item hierarchy down to Program→Module→**Unit** (three levels, period), move `lib/store/*.json` to Postgres/Prisma, and fully rebuild the standalone-assessment engine (randomization, difficulty mix, partial credit, cooldowns, weak-topic feedback).

The brief explicitly says it was written without seeing the actual `learning-platform/data/*.json` contents, and told me to inspect them for real before trusting that `docs/learning-platform/schema.sql`'s table boundaries match the JSON file boundaries. This document is that discovery, followed by the requested plan. **No code has been written.**

---

## 0. Discovery — actual shape of `learning-platform/data/*.json`

| File | Shape | Notes |
|---|---|---|
| `lp-programs.json` | **Single deeply-nested tree**, one array of Programs, each with `modules[]` → `units[]` → `sections[]` → `items[]` → `blocks[]` inline. | Confirms the brief's suspicion: this is *not* split into per-table files. Everything content-related lives in this one 83KB document. |
| `lp-knowledge-checks.json` | Flat array, one record per unit's KC. Fields: `id, unitId, title, passThreshold, questions[{id,prompt,options[{id,label}],correctOptionId,explanation}]`. | Already targets `unitId` directly (matches the *final* schema's meaning, not the item-level `kcId` used in the display tree). Single-answer only. |
| `lp-assessments.json` | Flat array, **2 records, both kinds in one file**: `readiness-cloud-practitioner` (`kind:"readiness", scope:"program"`) and `final-lp-m1` (`kind:"standalone", scope:"module"`, has a `config.practical` field). | Confirms `lp_assessments`' "two kinds, one table" union design is already how the JSON works today. Question schema is single-answer (`correctOptionId`), same shape as KC questions — no multi-select data exists yet. |
| `lp-enrollments.json` | Flat array, 1 record: `{studentId, programId, enrolledAt, status}`. | Already matches `lp_enrollments` 1:1. |
| `lp-student-units.json` | Flat array, 1 record: `{studentId, unitId, status, completedAt, verifiedAt, updatedAt}`. | Already matches target `lp_student_units` 1:1 — no change needed structurally. |
| `lp-student-items.json` | Flat array, 2 records: `{studentId, itemId, completedAt}`. | This table is **eliminated** per the brief §2. See Ambiguity #2 below — its elimination has real functional consequences. |

**No file exists yet** for `lp-points-ledger`, `lp-kc-attempts`, `lp-goals`, `lp-notes`, `lp-escalations`, or `lp-assessment-results` — `readStore()` returns `[]` on a missing file (per `json-store.ts`), so these stores are currently empty. **The migration only has real data to move for: catalog (programs/modules/units/sections/items/blocks), knowledge checks, assessments, enrollments, and student-units/items.** Everything else starts from zero rows.

---

## 1. Prisma schema (§3) — mapping issues found against real data

The brief's §3 SQL can be transcribed into `schema.prisma` largely as-is. The mapping problems below are things the brief could not have seen without the JSON contents:

**a. Per-item completion granularity has no home.** `lp_student_items` disappears, but it's the *only* signal driving today's left-rail completion dots and in-unit progress %. See Ambiguity #2 — this is the biggest gap, not a small one.

**b. `duration_min`/`hero_image` "fold in" language conflicts with the data.** The brief says the merged `lp_units.duration_min`/`hero_image` come from the old `lp_items`. But every coarse Unit *already* has its own authored `durationMin` (e.g. `55` for `lp-m1-u1`) that is **not** the sum of its items' individual durations (which sum to `82` for that same unit) — and no Unit currently has a `heroImage` at all (only a couple of items do, e.g. `lp-m1-u1-s1-i2`). I'd keep the Unit's own existing `durationMin` (real authored data) rather than resum from items, and set `hero_image` from the first item encountered that has one, else `null` — but this is a judgment call the brief didn't actually make explicit given the real data. Flagging rather than silently deciding.

**c. Item `title`/`durationMin` are dropped with no target column.** Once items disappear, each item's own title and per-item duration (shown today as `"{title} · {duration}mins"` in the left rail) have nowhere to go in §3's schema. Titles happen to be redundant with the item's first `heading` ContentBlock in every example inspected, so they're *recoverable* from content — durations are not recoverable at all.

**d. `lp_content_blocks.order` must be renumbered.** Today `order` is scoped per-item (each item's blocks restart at 1). Once all of a unit's blocks flatten into one list, `order` needs a single running counter across the unit, computed by walking sections→items in their existing sort order.

**e. `knowledge_check`-type items carry no unique data.** Their only field of interest, `kcId`, is already redundant with `lp_knowledge_checks.unitId` (which already points at the Unit, not at any item). These items can be dropped with zero data loss.

**f. Standalone-assessment fields with no source values.** `final-lp-m1` has no `difficulty` tag on its 3 questions and no `questions_per_attempt`/`difficulty_mix`/`time_limit_seconds` at the assessment level — all NOT NULL in the target schema. The migration has to *invent* these (proposed: `questions_per_attempt=3`, `difficulty_mix={"medium":3}`, `pass_threshold=0.75`, `time_limit_seconds` = a placeholder like `1800`). None of these can be derived from existing data, especially the time limit.

**g. `lp_topics`/weak-topic feedback will be inert on migrated content.** No question is topic-tagged today, so every migrated `lp_question_bank_items.topic_id` will be `NULL` — the weak-topic rollup (§4) will always hit the generic "review the full module" fallback for this content until topics are authored later. Not a blocker, just worth knowing before it's mistaken for a bug.

**h. `rubric` on the old `lp_assessments` has no target column anywhere in §3** (and isn't populated on the one real record either, so no actual data loss — just noting the column disappears).

---

## 2. Data migration script approach (§5)

A one-off script (`learning-platform/scripts/migrate-to-postgres.ts`, run via `tsx`) reading the existing `lp-*.json` files with plain `fs`/`JSON.parse` and writing via the Prisma client. Order:

1. **Programs → Modules**: walk `lp-programs.json` top level, insert `lp_programs` then each `program.modules[]` — ids/order/fields carry over unchanged.
2. **Units + ContentBlocks**: for each `module.units[]`, walk `unit.sections[]` (sorted by `order`) → each section's `items[]` (sorted by `order`). For `reading` items, emit their `blocks[]` (sorted by `order`) as `lp_content_blocks` rows keyed to `unit.id`, using one running order counter per unit (fixes 1d above). Skip `knowledge_check` items entirely (1e). Insert the `lp_units` row itself from the *coarse* unit's own fields per 1b's resolution.
3. **Knowledge Checks**: direct 1:1 copy from `lp-knowledge-checks.json`, only renaming `unitId→unit_id`, `passThreshold→pass_threshold`.
4. **Enrollments**: direct 1:1 copy.
5. **Student Units**: direct 1:1 copy (columns already match target).
6. **Student Items**: **not migrated into anything** (feature eliminated) — the script should log what it's discarding (student/item/timestamp) for an audit trail, not silently vanish it, but must not fabricate unit-level progress that was never true (e.g. must not mark a unit "completed" just because some of its items were marked done).
7. **Assessments**, split by `kind`:
   - `readiness-cloud-practitioner` → `lp_readiness_assessments` (`program_id` from `scopeId`), `config` carried as-is.
   - `final-lp-m1` → `lp_standalone_assessments` (`module_id` from `scopeId`) + 3 `lp_question_bank_items` rows using the invented defaults from 1f, dropping `config.practical` per the 2026-08-11 decision.
8. Original JSON files are left untouched (§5.5) — the script is additive only, no delete step.

Script should be **idempotent** (safe to re-run — upsert by known id, or check-before-insert) since content will likely be re-authored and re-migrated more than once during development, and should print row-count assertions at the end (e.g. total migrated content blocks == total blocks summed from source JSON) as a cheap check against silent data loss beyond what's flagged above.

---

## 3. Route handler / lib/ changes, grouped by module (§6 build order)

**content (catalog)**
- `lib/store/catalog.ts` — rewritten against Prisma; must reconstruct whatever tree shape downstream code needs (or downstream code changes to consume a flatter shape).
- `lib/lp-utils.ts` — `flattenItems`, `nextItem`, `itemAfter`, `readingItems`, `locateItem` all assume `Unit → Section → Item`; these are either deleted or rewritten now that Unit is the leaf content container.
- `types/index.ts` — `LpSection`/`LpItem` removed; `LpUnit` gains a direct `contentBlocks[]`; `points_*` → `tokens_*` throughout.
- *(Flagged, not built here per §7's backend-only scope but a hard blocking dependency — see Ambiguity #9):* `SectionRail.tsx`, `UnitShell.tsx`, `ReadingView.tsx`, `BlockRenderer.tsx`, `units/[unitId]/page.tsx` all render the old nested tree today and will not work against the new shape.

**progress**
- `lib/store/progress.ts` — the `StudentItem` half is deleted outright; `StudentUnit` half ports to Prisma with the same function signatures.
- `app/api/progress/route.ts` — today's cascade (`mark reading item complete` → `readingItems(unit).every(complete)` → flip unit to `completed` + award) has no equivalent once items are gone. **This needs a new completion signal, not just a storage swap** — see Ambiguity #2, this blocks the module.
- `lib/store/points.ts` → renamed `tokens.ts`, `awardPoints`→`awardTokens`, `points` param → `tokens`.
- `units/[unitId]/page.tsx`, `resume/route.ts`, `app/api/integration/summary/route.ts` — all call `flattenItems`/`nextItem`/`readingItems`/`pointsBalance`; touched by both the rename and the item-elimination.

**knowledge-checks**
- `lib/store/attempts.ts` — straight Prisma port, same signatures.
- `lib/kc-utils.ts` — unchanged; pure functions with no shape dependency.
- `app/api/knowledge-checks/[kcId]/attempts/route.ts` — swap store calls to Prisma; the current `flattenItems(unit).find(i=>i.kcId===kc.id)` scan across *all programs* to mark the KC "item" complete disappears entirely (no item to mark) — this route gets simpler, not just re-plumbed. Rename `KC_PASS_POINTS`→`KC_PASS_TOKENS`.

**assessments (full rebuild, §4)** — mostly new code, nothing to port:
- New `lib/store/*` for `lp_standalone_assessments`/`lp_question_bank_items`/`lp_assessment_attempts`/`lp_attempt_questions`/`lp_attempt_answers`/`lp_topics`.
- New pure engine module (randomization+difficulty-mix selection, partial-credit scoring, weak-topic rollup, cooldown calc) — built and unit-tested before any route, per §4's own instruction.
- New route(s) under `app/api/assessments/[assessmentId]/attempts/` (start/resume/save/submit) — nothing like this exists today.
- `lib/store/escalations.ts` — `Escalation.kind` widened to include `assessment_repeated_failure`.

**goals/readiness**
- `lib/store/goals.ts`, `notes.ts` — straight Prisma port, unchanged signatures (their tables are unchanged from the current schema.sql).
- `lib/store/results.ts` — splits: readiness-only going forward (`lp_readiness_results`); standalone results move under the assessments module's attempt tables.
- `catalog.ts`'s `getAssessment`/`getAssessments`/`getReadinessAssessments` split into separate readiness vs. standalone accessors reflecting the now-separate tables.
- `app/api/readiness/[assessmentId]/results/route.ts`, `integration/readiness/route.ts`, `integration/streak/route.ts` — swap store calls; `goalsStreak`/`latestReadiness` in `lp-utils.ts` are pure and already shape-compatible, port unchanged.

**Not touched by this migration:** `lib/current-student.ts`, `lib/shared-data.ts`, `lib/students.ts`, `lib/support-tickets.ts` — these own the *shared*, repo-root `data/*.json` stores (`approved_emails`, `students`, `support_tickets`, `audit_log`), explicitly out of scope per schema.sql's own "reference only" section (see Ambiguity #8). `lib/store/json-store.ts` becomes dead code once every LP store is ported — delete it last, not mid-migration, since other stores may still depend on it during the phased swap.

---

## 4. Things I'm flagging, not silently resolving

1. **The database engine itself isn't settled.** `docs/decision-log.md` (2026-07-09 rows, and its own "Next steps" list) shows *"Database final selection: Postgres vs NoSQL (MongoDB)... Open... urgent before data model is locked,"* explicitly noted as *replacing an earlier Postgres assumption*. The brief assumes Postgres+Prisma throughout, and other repo comments already claim schema-mirroring, but the decision log's own open-items list still carries this as unresolved. I'll proceed on the brief's explicit instruction (Postgres) since that's what was asked for, but this contradicts a decision-log item still marked open, so it should be confirmed for real before `schema.prisma` gets written.

2. **Per-item completion has no replacement mechanism — this blocks the progress module.** Eliminating `lp_student_items` removes the only signal driving the left-rail completion dots, the in-unit progress %, and the trigger for `in_progress → completed`. The brief frames this as "no separate leaf-level tracking needed" but doesn't say what *new* signal decides "this unit's content is done." Options: (a) a single "mark unit read" action (loses granular feedback), (b) client-side scroll/view tracking with a single server call at the end, (c) keep some lighter content-block-level completion after all (which would contradict §2's framing). I haven't picked one — it needs a team decision before build-order step 2 can actually be built.

3. **`duration_min`/`hero_image` "fold in" instructions don't match the real data** (detailed in §1b) — I'm proceeding on keeping the unit's own authored duration and first-available item hero image, but flagging it as my judgment call, not a literal reading of the brief.

4. **Item titles/durations are silently dropped** (§1c) — titles are recoverable from content (redundant with the first heading block in every example seen), durations are not recoverable at all. Confirm this loss is accepted.

5. **Standalone-assessment fields with no source data** (§1f) need invented defaults, especially `time_limit_seconds`, which has no reasonable value to infer from anything in the repo. Please confirm real values rather than have me guess placeholders that ship.

6. **Weak-topic feedback will be inert on the one migrated assessment** (§1g) — not a blocker, just flagging so it isn't read as a bug at launch.

7. **The brief attributes a specific staged migration order ("content → progress → knowledge-checks → assessments → goals/readiness") to "the existing json-store.ts comment's own stated intent" (§5.4) — that phrasing isn't actually in the code.** `json-store.ts`/`shared-data.ts`/`lp-utils.ts`/`types/index.ts` all say some version of "swapping to Postgres only changes the I/O layer," but none specify that staging order. It's a reasonable order regardless (matches §6, and what I used above) — just flagging it as this brief's proposal, not a promise already made in the codebase.

8. **Scope boundary on shared stores** — I'm treating the repo-root shared stores (`approved_emails`, `students`, `support_tickets`, `audit_log`) as untouched, per schema.sql's own "reference only" framing. `current-student.ts` and the support route depend on them; confirming this boundary since the brief's §0.2/§5 only ever discuss `learning-platform/data/*.json`.

9. **Frontend isn't in the brief's build order at all, but it's a hard blocker.** §2 issues a hard, explicitly-worded UI directive that today's `SectionRail.tsx` directly violates (it literally renders `"Section {section.order}"`). Independent of that directive, every component under `units/[unitId]/components/` (`SectionRail`, `UnitShell`, `ReadingView`, `BlockRenderer`, `ProgressFooter`, `RightPanel`, `KnowledgeCheckRunner`) consumes the old nested Section/Item shape and won't render against the new flattened Unit shape at all. §6/§7 only schedule backend modules — confirming frontend rework is understood as a separate, later pass, since a Prisma-backed API returning the new shape will otherwise have nothing that can display it.

---

*Per the original instruction, this is the full stop point — no schema.prisma, migration script, or route code has been written. Awaiting review/answers on the ambiguities above before touching code.*
