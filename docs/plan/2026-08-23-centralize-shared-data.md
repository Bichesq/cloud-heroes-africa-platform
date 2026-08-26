# Centralize repo-root `data/` and student-hub's local data into Postgres

**Date:** 2026-08-23 (revised 2026-08-24, implemented 2026-08-26)
**Status:** Implemented — pending manual browser verification and final JSON
cleanup (see Revision log)

## Context

The repo-root `data/` directory (`approved-emails.json`, `students.json`,
`support-tickets.json`, `audit-log.json`) has always been documented as a
placeholder, not a destination: `docs/decision-log.md` (2026-06-04 "Shared
backend architecture," 2026-07-13 "Payload CMS abandoned... enables a unified
database architecture") calls for one shared data store, and both
`docs/database-evaluation.md` and `docs/learning-platform/schema.sql`
describe these four stores as "platform-core-owned... reference only."
`learning-platform/prisma/schema.prisma`'s own header comment says every
`studentId` column is a plain `String @db.Uuid` with no real FK "until/unless
`students` itself moves into this same database." The learning-platform
backend migration (`docs/learning_platform/backend-migration-plan.md`,
Ambiguity #8) explicitly carved these four stores out as out of scope.

Now that Postgres is running in Docker and learning-platform's own
content/progress/assessment domain is fully migrated (see
`docs/plan/2026-08-19-docker-postgres-setup.md`), the user asked to close
this gap: make the database "central for all data for all the surfaces."

**Revision note (2026-08-24):** before writing implementation code, an audit
(`prompts/audit_prisma.md` → `docs/shared-schema-audit.md`) was run against
this plan's step 5 proposal (student-hub gaining its own `schema.prisma`
duplicating 4 shared models). It found the plan's premise was wrong on one
point (`audit-log.json` is not actually read/written by both apps today —
only `student-hub` uses it) and surfaced a pre-existing correctness defect
this migration would otherwise carry forward unchanged (both apps
independently create/update `Student` rows via hand-duplicated logic, a
split-brain writer problem). This revision incorporates those findings; see
`docs/shared-schema-audit.md` for the full analysis and reasoning.

## Goal

No app in this repo reads or writes a JSON file for persistent data (except
avatar image uploads on disk, which are files, not records, and stay
out of scope). Both `learning-platform` and `student-hub` read/write the same
Postgres database for the identity/support/audit data they already share
today, and student-hub's own local data (todos, events, mock program
catalog/progress) also moves off JSON.

## Scope

**In scope:**
- Repo-root shared stores: `approved-emails.json`, `students.json`,
  `support-tickets.json` (genuinely read/written by both apps today), and
  `audit-log.json` (in scope for the Postgres move since `student-hub` needs
  it persisted, but **not** a shared table in practice — see the
  "Corrected model classification" decision below; `learning-platform` has
  zero current references to it).
- Student-hub's own local stores: `todos.json`, `events.json`,
  `programs.json`, `progress.json` (currently has no DB story at all).
- New Prisma setup for `student-hub` (it has none today).
- A new write API on `student-hub` for `Student` records (see decisions
  below) — the one piece of new application code this migration adds beyond
  "move JSON into Postgres."

**Explicitly out of scope:**
- Avatar image uploads (`public/uploads/avatars/`) — stay on disk.
- Reconciling student-hub's mock program catalog (`programs.json`, ids like
  `m1-u1`) with learning-platform's real catalog (already in Postgres, ids
  like `lp-m1-u1`) — these are independent today and stay independent after
  this migration, just replatformed as-is under clearly-mock-labeled table
  names. Consolidating "my program" onto LP's real catalog is a separate,
  larger change.
- Any change to `learning-platform`'s own content/progress/assessment tables
  beyond the FK-tightening in step 2 below.
- Redesigning `ApprovedEmail`/`SupportTicket` access into a full DTO+API
  pattern on the `learning-platform` side. The audit recommends this
  direction long-term (LP's usage of both is narrow and read-mostly/write-once
  today), but building new API surface for it now is a larger change than
  "move JSON to Postgres." This plan instead keeps LP's existing direct
  Prisma access to these two tables, but locks in a guardrail (see decisions
  below) that LP must not grow write logic against them just because direct
  table access becomes available. Revisiting this is flagged as recommended
  follow-up work, not built here.
- Building the "Administration" application. Per the audit, `Administration`
  is the decision-log's actual named owner of `ApprovedEmail`, `SupportTicket`,
  and (by analogy) `AuditEntry`, but it doesn't exist yet — `student-hub`
  continues informally standing in for it, as it already does today.

## Decisions made in scoping this (confirmed with the user)

- **Topology:** fold everything into the **existing `learning_platform`**
  Postgres database — no new database. Same Docker Postgres container, same
  `DATABASE_URL` value learning-platform already uses. Confirmed:
  `student-hub/.env`'s `DATABASE_URL` is an exact copy of
  `learning-platform/.env`'s value — no separate credentials per app in dev.
- **Migration ownership:** `learning-platform`'s existing Prisma project
  remains the **sole owner of migrations** against `learning_platform` — it
  already holds this database's migration history. `student-hub` gets a
  **new, separate** Prisma setup (its own `schema.prisma`, `@prisma/client`)
  pointed at the same `DATABASE_URL`, but its workflow only ever runs
  `prisma generate`, never `prisma migrate` — this avoids two independent
  migration histories fighting over one `_prisma_migrations` table.
  **Revised (2026-08-24):** the audit confirmed this stays correct even
  though the decision-log's real domain owner for 3 of these 4 tables is
  "Administration" (not built yet) — "migration runner" is a separate
  question from "domain/business owner," and centralizing the technical
  runner remains the pragmatic choice regardless of who owns the business
  logic. This distinction is being formalized in `docs/decision-log.md` as
  part of step 7 below.
- **Shared model declarations — resolved, supersedes the original "accepted
  tradeoff":** the original draft accepted hand-duplicating the 4 shared
  models' field lists across both apps' `schema.prisma` files, with only a
  header-comment convention to catch drift. The audit checked this
  repo's installed Prisma version (**6.19.3**) against Prisma's own
  changelog and confirmed multi-file schema (`prismaSchemaFolder`) has been
  **GA since v6.7.0** — no `previewFeatures` flag needed. This plan now uses
  that mechanism instead: each of the 4 shared models
  (`ApprovedEmail`, `Student`, `SupportTicket`, `AuditEntry`) is declared
  **once**, in a new `prisma-shared/*.prisma` file at repo root, symlinked
  into both `learning-platform/prisma/schema/` and
  `student-hub/prisma/schema/`. This eliminates the duplication tradeoff
  entirely rather than just documenting it. **Windows caveat (flagged by the
  audit, relevant since this repo is developed on Windows):** symlinks
  require Developer Mode or an elevated shell, and Git's Windows symlink
  support is opt-in (`core.symlinks`) — on a checkout where it's off, a
  symlink becomes a plain text file containing the link target, silently
  breaking the shared-file property. Step 1 below includes verifying the
  team's `core.symlinks` config before relying on this, with an NTFS
  junction or a pre-`generate` copy script as fallback if symlinks prove
  unreliable across the team's machines.
- **Student write ownership — new decision (2026-08-24), from the audit:**
  both apps currently run independent, hand-duplicated `upsertStudent` logic
  (`learning-platform/lib/students.ts` and `student-hub/lib/mock-api.ts`) —
  a split-brain writer problem that predates Postgres and would simply
  become two Prisma clients racing on the same row if ported unchanged.
  Resolved: **`student-hub` becomes the sole authoritative writer for
  `Student` rows.** `learning-platform` keeps a `Student` Prisma model for
  its own relational reads (the FK-tightening in step 2 needs it) but no
  longer performs direct creates/updates — it calls a new `student-hub` API
  instead (step 4 below). Per the user's explicit direction, this API is
  **not** scoped narrowly to just replace LP's current `upsertStudent` call —
  it's designed as the general student-write surface so that when
  "Administration" (per decision-log, the real eventual owner of
  admin-status fields like `status: banned`) is built, it calls the same API
  rather than requiring a second redesign. See step 4.
- **`ApprovedEmail.id` switches to UUID now** (reverses the original draft's
  "keep existing string ids like `ae-001`" assumption). No code path reads
  or looks up an approved-email row by id today (`findApprovedEmail` looks
  up by email), so this is a safe one-time id reassignment during the data
  migration (step 3), done now rather than risking a second migration later
  when an admin "approve email" flow is built.

## Approach

1. **Add Prisma models**, split across two locations per the decisions
   above:
   - **New shared file** `prisma-shared/platform-core-models.prisma`
     (repo root) — the 4 shared models, declared once:
     - `ApprovedEmail` → `approved_emails` (`id` now `String @default(uuid())`,
       `email` stays the natural lookup key)
     - `Student` → `students`
     - `SupportTicket` → `support_tickets`
     - `AuditEntry` → `audit_log` — **reclassified**: table/column names
       unchanged, still created in Postgres (student-hub needs it), but no
       longer framed as "platform-core, both apps." `learning-platform` gets
       no reads/writes wired to this model in step 5 (it has none today).
       Kept as a shared-file declaration rather than moved into a
       student-hub-only section, since the audit flagged its future scope as
       genuinely ambiguous (an LP-side audit trail is plausible later) —
       revisit if/when that materializes.
     Symlink this file into `learning-platform/prisma/schema/` and (once
     created in step 6) `student-hub/prisma/schema/`. Verify
     `core.symlinks` is enabled repo-wide (`git config --get core.symlinks`,
     and check `.gitattributes`) before relying on this; fall back to an
     NTFS junction (`New-Item -ItemType Junction`) or a small
     `scripts/sync-shared-prisma.ts` copy-before-`generate` step if any
     contributor's checkout can't honor symlinks.
   - **In `learning-platform/prisma/schema.prisma` directly** (new section
     after the existing Escalations section, unchanged from the original
     draft) — the student-hub-local tables, still living in `learning_platform`
     per the topology decision, since `learning-platform`'s Prisma project
     is the sole migration runner and must declare every table in this
     database:
     - `Todo` → `todos`
     - `Event` → `events`
     - `ShMockProgram` → `sh_mock_programs` (whole nested modules/units tree
       stored as one `Json` blob — static demo content read wholesale via
       `getProgram()`, so normalizing into real tables would be
       over-engineering for what it is; named distinctly from LP's real
       `LpProgram`/`lp_programs` in the same database)
     - `ShUnitCompletion` → `sh_unit_completions`

2. **Retroactively wire the 9 existing `lp_*` tables** that today hold a
   bare `studentId String @db.Uuid` with no relation (`LpEnrollment`,
   `LpStudentUnit`, `LpKcAttempt`, `LpTokenLedger`, `LpUnitGoal`, `LpNote`,
   `LpReadinessResult`, `LpAssessmentAttempt`, `LpEscalation`) into real
   `student Student @relation(...)` fields — this is exactly the gap the
   schema's own header comment flagged, now closeable because `Student`
   lives in the same database. This is a **read-side/relational** need only
   — it doesn't imply `learning-platform` writes `Student` rows (see the
   student-write-ownership decision above). **Must be a separate migration
   applied only after step 3's data migration has populated `students`** —
   adding the FK in the same migration that creates the table would fail
   against already-existing `lp_enrollments`/etc. rows referencing student
   ids not yet present anywhere.

3. **New migration script** `learning-platform/scripts/migrate-shared-data.ts`
   — same idempotent pattern as the existing `scripts/migrate-to-postgres.ts`
   (`tsx`, plain `fs`/`JSON.parse`, upsert by known id, row-count assertions
   at the end). Reads repo-root `data/*.json` (4 files) and
   `student-hub/data/*.json` (4 files). Generates new UUIDs for
   `approved_emails` rows (see id-format decision above) — no other table
   changes id scheme. Insert order:
   `approved_emails` → `students` → `support_tickets` → `audit_log` →
   `todos` → `events` → `sh_mock_programs` → `sh_unit_completions` (FK
   dependency order). Original JSON files stay on disk untouched until the
   app-side swap is verified end-to-end (final cleanup step).

4. **New: `student-hub` Student-write API** (added 2026-08-24, per the
   write-ownership decision above) — this is the one new piece of
   application logic in this migration, not just a JSON→Prisma port:
   - New route, e.g. `student-hub/app/api/integration/students/route.ts`,
     authenticated with the same `x-integration-token` pattern
     `learning-platform/lib/integration-auth.ts` already uses (today only in
     the LP→student-hub direction; this is the first use of the reverse
     direction, student-hub serving LP).
   - Designed as a general student-write surface, not a narrow
     upsert-only endpoint: accepts an action/operation discriminator
     covering (a) upsert-on-first-login (create if absent, update
     `lastLogin` otherwise — what `learning-platform`'s current
     `upsertStudent` does inline) and (b) partial field updates keyed by
     student id, with a request shape that isn't closed off from admin-style
     fields (`status`, moderation reason, etc.) even though no caller uses
     those yet — so that "Administration," once built, can call the same
     endpoint for status changes / admin overrides instead of requiring a
     second design pass. Concretely: a discriminated-union or
     verb-in-path shape (e.g. `POST .../students:upsertLogin` vs.
     `PATCH .../students/:id`) rather than a single flat "create-or-update"
     body — exact shape to be finalized during implementation, but the
     admin-forward-compatibility requirement is fixed here.
   - Implemented against student-hub's own new Prisma client (step 6),
     since student-hub is now the authoritative writer.
   - `banStudent` in `student-hub/lib/mock-api.ts` (currently dead code, no
     callers) is superseded by this endpoint's admin-update path once
     built — not separately ported.

5. **Rewire learning-platform's store modules to Prisma** (same exported
   signatures, so callers don't change):
   - `lib/approved-emails.ts`, `lib/support-tickets.ts` → Prisma calls on
     the new models (unchanged from original draft — narrow, read-mostly
     usage preserved as-is; see the "guardrail" note in Out of Scope: do not
     grow this into broader write logic).
   - `lib/students.ts` → `getStudent` becomes a direct Prisma read (LP still
     has relational access); `upsertStudent` becomes an HTTP call to the new
     student-hub API from step 4, instead of a direct Prisma write.
   - `lib/current-student.ts`, `lib/integration-auth.ts` — unchanged call
     sites.
   - `lib/shared-data.ts` — deleted once nothing imports
     `sharedDataPath`/`localDataPath` (delete last, mirroring how
     `json-store.ts` was retired at the end of the prior LP migration).
   - Remove the `SHARED_DATA_DIR` env var.

6. **Set up Prisma in student-hub from scratch and rewire its stores:**
   - `student-hub/package.json` — add `prisma`, `@prisma/client` (match
     learning-platform's `^6`); add a `prisma:generate` script only (no
     `migrate:*` scripts, per the ownership decision).
   - `student-hub/prisma/schema/` — new folder-based schema (multi-file, per
     the GA `prismaSchemaFolder` feature): the symlinked
     `platform-core-models.prisma` from step 1, plus a new file for
     student-hub's own `Todo`/`Event`/`ShMockProgram`/`ShUnitCompletion` —
     wait, those are declared in `learning-platform`'s schema per step 1 (LP
     is sole migration owner); student-hub's copies of these 4 are
     **also** symlinked from the same source LP declares them in, to avoid
     recreating the original duplication problem for these tables too. No
     `prisma/migrations/` directory in student-hub either way.
   - `student-hub/.env` (new, gitignored) — same `DATABASE_URL` value as
     `learning-platform/.env` (confirmed above).
   - `student-hub/lib/prisma.ts` — new, same singleton pattern as
     `learning-platform/lib/prisma.ts`.
   - Implement the Student-write API from step 4 here, backed by this new
     Prisma client.
   - Rewire `lib/approved-emails.ts`, `lib/mock-api.ts` (now calling its own
     Prisma models directly, since it's the authoritative writer — no HTTP
     round-trip needed for its own use), `lib/support-tickets.ts`,
     `lib/audit.ts`, `lib/todos.ts`, `lib/curriculum.ts`, `lib/events.ts` to
     Prisma, same signatures. No route handlers or pages change beyond
     these `lib/` modules and the new API route from step 4.

7. **New: append the audit's proposed decision-log entry** — before or
   alongside implementation (this is a documentation-only step, low risk to
   do early), add the entry from `docs/shared-schema-audit.md` §6 to
   `docs/decision-log.md`, formalizing that "migration runner" and
   "domain/business owner" are separate questions, and that direct
   cross-app Prisma access is reserved for genuine relational needs while
   read-mostly/write-once shared data goes through a narrow owning-domain
   API — codifying the guardrail this plan relies on for `ApprovedEmail`/
   `SupportTicket`.

8. **Verification, in order:**
   - `learning-platform`: `tsc --noEmit`, `npm run test`,
     `prisma migrate dev` (new tables), run `migrate-shared-data.ts`, verify
     row counts, apply the FK-tightening migration (step 2), dev server
     smoke test.
   - `student-hub`: `tsc --noEmit`, `prisma generate` against the same
     `DATABASE_URL`, dev server boots, manual OAuth login walkthrough
     (profile edit, MFA toggle, todo create/complete, support ticket submit,
     dashboard/calendar render) — student-hub has no dev auth bypass either,
     same manual-step pattern as the LP migration's verification.
   - **New: Student-write API check** — log in on `learning-platform` with
     a brand-new student (no existing `Student` row); confirm it calls
     student-hub's API and a real row appears in `students`, rather than LP
     writing it directly. Confirm the `x-integration-token` auth rejects an
     unauthenticated call.
   - **Cross-app check** (the actual thing being verified — not just "both
     apps independently still work"): log in on student-hub (port 3000),
     confirm the same student/session and a ticket filed from either app is
     visible through the other app's queries.
   - **Symlink sanity check**: fresh-clone the repo on a clean checkout (or
     simulate via `git stash -u && git clean -fdx` on a throwaway branch)
     and confirm `prisma-shared/*.prisma` symlinks resolve correctly before
     relying on them in CI or teammates' machines.
   - Only after all of the above passes: delete the now-dead
     `data/*.json` and `student-hub/data/*.json` files (git history retains
     them).

## Files / modules affected

- `prisma-shared/platform-core-models.prisma` — new, single source of truth
  for the 4 shared models.
- `learning-platform/prisma/schema/` — new folder (migrating off the single
  `schema.prisma` file to enable multi-file schema), containing a symlink to
  the shared file above plus the existing content and the new
  student-hub-local models.
- `learning-platform/scripts/migrate-shared-data.ts` — new.
- `learning-platform/lib/approved-emails.ts`, `support-tickets.ts` —
  rewritten to Prisma.
- `learning-platform/lib/students.ts` — `getStudent` rewritten to Prisma;
  `upsertStudent` rewritten to call student-hub's new API.
- `learning-platform/lib/shared-data.ts` — deleted (last step).
- `student-hub/package.json`, `student-hub/prisma/schema/` (new, symlinked
  + local student-hub-owned models), `student-hub/.env` (new),
  `student-hub/lib/prisma.ts` (new).
- `student-hub/app/api/integration/students/route.ts` — new, the
  Student-write API.
- `student-hub/lib/approved-emails.ts`, `mock-api.ts`, `support-tickets.ts`,
  `audit.ts`, `todos.ts`, `curriculum.ts`, `events.ts` — rewritten to Prisma.
- `docs/decision-log.md` — new entry per step 7.
- Repo-root `data/*.json`, `student-hub/data/*.json` — deleted at the end,
  once verified.

## Open questions / assumptions

- Exact request shape for the Student-write API (step 4) — the
  admin-forward-compatibility requirement is fixed, but the concrete
  discriminated-union/verb-in-path design is left to implementation time.
- The shared-`.prisma`-file mechanism assumes the team's Windows checkouts
  can be made to honor symlinks (or the junction/copy-script fallback is
  adopted); not yet verified across every contributor's machine — flagged
  as step 1's first sub-task.
- `AuditEntry`'s continued placement in the "shared" file (rather than a
  student-hub-only one) is a judgment call given its ambiguous (bucket C)
  classification — cheap to move later if it turns out `learning-platform`
  never ends up needing it.

## Risks / things that could go wrong

- **FK-tightening migration (step 2) can fail** if any existing `lp_*` row's
  `studentId` doesn't match a row in the new `students` table — mitigated by
  strict ordering (data migration must fully succeed and be verified before
  this migration is authored/applied).
- **Symlinked Prisma schema breaks silently on a checkout without
  `core.symlinks` enabled** (Windows-specific, flagged by the audit) —
  mitigated by the fresh-clone sanity check in step 8, and a junction/copy
  script fallback if symlinks prove unreliable.
- **New cross-app runtime dependency**: `learning-platform` creating a
  `Student` row now requires a live call to `student-hub`'s API (previously
  a purely local Prisma write). If `student-hub` is down, first-time LP
  logins for brand-new students fail closed. This is a deliberate tradeoff
  for fixing the split-write correctness problem — worth confirming this
  failure mode (fail closed vs. some fallback) during implementation.
- **Two apps, one DB, two Prisma clients**: if this plan is ever revisited
  and someone runs `prisma migrate dev` from `student-hub` by mistake, it
  will attempt to create its own `_prisma_migrations` bookkeeping against a
  database learning-platform already tracks — must stay disciplined about
  student-hub only ever running `prisma generate`.
- Rollback: schema additions are new tables + one FK-tightening migration on
  existing tables; if the FK migration needs to be rolled back, the existing
  data migration script is idempotent so it's safe to leave `students`/etc.
  populated and just revert the FK-adding migration alone.

## Out of scope (explicitly deferred)

- Avatar image uploads (stay on local disk).
- Consolidating student-hub's mock program catalog with learning-platform's
  real one.
- Any admin/moderation surface for `approved_emails` (`revokeEmail`) beyond
  what the new Student-write API's admin-forward-compatible design enables —
  no actual admin UI is built here.
- Redesigning `ApprovedEmail`/`SupportTicket` access into a full DTO+API
  pattern on the learning-platform side (see Scope section above) — flagged
  as recommended follow-up by the audit, not built in this migration.
- Building the "Administration" application itself.

---

## Revision log

- 2026-08-23: initial draft.
- 2026-08-24: revised per `docs/shared-schema-audit.md` findings — corrected
  the `audit-log.json` "shared" claim, resolved the shared-model-duplication
  tradeoff via symlinked multi-file Prisma schema (verified GA at the
  installed Prisma version), added the Student split-write fix (student-hub
  becomes sole authoritative writer, with a new forward-compatible write API
  for learning-platform and, eventually, "Administration" to call), switched
  `ApprovedEmail.id` to UUID, and added a step to formalize the
  runner-vs-owner distinction in `docs/decision-log.md`.
- 2026-08-26: implemented, with two deviations discovered mid-build:
  1. **Symlinks → copy script.** This checkout has `core.symlinks=false` and
     no `.gitattributes` override, so the symlink mechanism was replaced
     with the plan's own documented fallback: `scripts/sync-shared-prisma.mjs`
     copies `prisma-shared/*.prisma` into both apps' `prisma/schema/`
     folders before every `generate`/`migrate` (wired into
     `package.json#scripts`). The copied files are gitignored; only
     `prisma-shared/*.prisma` is the tracked source of truth.
  2. **FK-tightening (step 2) landed at the DB level only, not as a Prisma
     relation.** Attempting to add `student Student @relation(...)` to the 9
     `Lp*` tables failed `prisma generate` in student-hub: Prisma requires
     both sides of a relation (a back-relation array field on `Student`) to
     resolve within the SAME generated client, but `Student` is copied
     verbatim into student-hub's independently-generated client too, which
     has no `Lp*` models to reference. Resolved by keeping the FK as a real
     Postgres constraint (hand-authored migration `add_student_fk`, applied
     after `migrate-shared-data.ts` populated `students`, per the original
     ordering requirement) while leaving `studentId` a plain scalar column
     in `lp-core.prisma` — no `@relation`, no `.include({ student: true })`
     convenience on those 9 models. This still closes the stated gap
     ("Postgres cannot enforce that FK... until students moves into this
     same database" — now it does), just without the relational-read sugar
     the original step 2 language soft-implied. Documented at length in
     `lp-core.prisma`'s header, including a warning that a future
     `prisma migrate dev` will show this FK as drift and must NOT be
     "fixed" by dropping it.

  Also completed: `prisma.config.ts` added to both apps (package.json#prisma
  is deprecated at the installed 6.19.3); `ApprovedEmail`/`SupportTicket`/
  `AuditEntry`/`Todo` ids modeled as plain text rather than `@db.Uuid`,
  since legacy seed rows use non-UUID ids (`st-0001`, `t1`) — only
  `Student.id` (an FK target) and `*.studentId` columns stay `@db.Uuid`.
  All 8 tables' data migrated and row counts verified;
  `POST /api/integration/students` verified end-to-end (create, idempotent
  re-login, 403 without the token); a cross-app support-ticket write
  verified via the shared table. **Not yet done**: the full manual
  browser/OAuth walkthrough (profile edit, MFA toggle, todo/calendar render)
  from plan step 8, and the final deletion of the now-dead `data/*.json` /
  `student-hub/data/*.json` files, which is gated on that walkthrough.
