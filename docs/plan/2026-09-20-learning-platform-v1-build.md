# Learning Platform V1 build — sequencing plan

**Date:** 2026-09-20
**Status:** Draft — reviewed 2026-09-21 with Bichesq; decisions below applied inline (see Revision log)

## Context

`docs/plan/2026-09-17-learning-platform-assessment-requirements.md` extracted every V1-relevant
screen from the Figma file, and `docs/plan/2026-09-10-v1-requirements-reconciliation.md` +
`docs/backend-status-2026-09-14.md` record what the team actually decided and what's already built.
No implementation plan ties these together yet. This doc is that plan — it exists so we sequence the
remaining V1 work instead of building screens in Figma order, and so scope decisions (especially the
authoring/RBAC tension flagged below) are visible before code gets written.

I re-verified current state directly rather than trusting the backend-status doc's "frontend not
included" framing:

**Already built (backend, confirmed in `learning-platform/prisma/schema/lp-core.prisma`):**
Program → Module → Unit → ContentBlock hierarchy, enrollment, per-unit progress
(`in_progress/completed/retake/verified`), token ledger, Knowledge Checks (single fixed question set,
`single_choice` only — no bank/randomization), a fully-built Standalone Assessment engine (question
bank, topic tagging, difficulty mix, randomized selection, partial credit for `multi_select`,
save-and-resume, attempt lifecycle, weak-topic rollup, cooldown field `next_eligible_at`) supporting
only `single_choice`/`multi_select` question types (no `Code` type from requirements §6.4), Readiness
assessments (separate, simpler, no randomization by design), and escalations
(`kc_second_failure`/`assessment_repeated_failure`).

**Already built (frontend, found by reading `app/(learner)/`, not previously documented anywhere):**
catalogue page (`catalog/`), program overview with module accordion and readiness card
(`programs/[programId]/`), unit view with reading content, TTS control bar, right panel, unit rail,
and an inline Knowledge Check runner (`programs/[programId]/units/[unitId]/`), and a Readiness
assessment runner (`programs/[programId]/readiness/[assessmentId]/`).

**Not built at all:** the Module (Standalone) Assessment learner UI — requirements §5's full
pre-assessment → in-progress → submit-review → results → issue-reporting flow has no frontend and no
route; any admin/authoring app; the program-level bypass flow (§10.4); badges (§10.5); Knowledge
Check retake randomization (§10.3 — KC still uses a fixed question list, not a bank); the `Code`
question type; and reconciling whether Knowledge Checks and Standalone Assessments should share one
question-bank schema (open question, not yet decided — see below).

## Goal

A learner can go end-to-end — browse the catalogue, enroll, work through a program's modules and
units (reading content + per-unit Knowledge Check), take a Module Assessment, see results, and have a
passed Module Assessment reliably unlock the next module — using only what's built for V1 (no video,
no Notes tab, no course ratings). Authoring of that content has *some* UI (even if minimal per the
Sep 7 decision), so content doesn't have to be hand-seeded via Prisma Studio forever.

## Scope

**In scope for V1 (this plan sequences these):**
- Module (Standalone) Assessment learner UI — the single biggest missing learner-facing piece.
- Reliable module-unlock-on-pass, with an admin-safe manual resync action (§8's Help Desk signal —
  "automatic progress trigger didn't fire" is a named real scenario, not hypothetical).
- Knowledge Check retake randomization (§10.3) — extend the KC data model to a bank, matching the
  Standalone Assessment pattern, since the Sep 7 decision explicitly said KCs should work the same way.
- `Code` question type support in the question bank + runtime (schema says `Multi`/`MC`/`Code` per
  requirements §6.4; current enum only has two of three).
- Catalogue enrollment-state correctness (Locked/Enroll/Resume/Completed) — verify existing
  `CatalogClient.tsx` against the full 4-state machine in requirements §1, since prerequisite gating
  logic isn't confirmed to exist yet.
- **Full** content authoring UI per requirements §6.5: create/edit Program → Module → Unit, reorder
  units, Knowledge Check and Module Assessment authoring (direct-publish for KCs, review-gated for
  Module Assessments), a shared/importable question bank, draft versioning, and the six-role
  program-scoped RBAC (Editor/Reviewer/Viewer/Director/Owner/Creator, plus the separate per-program
  Instructor field from §6.1). **Decided 2026-09-21: build to the full §6.5 spec**, superseding the
  Sep 7 "minimal, no RBAC" decision for authoring scope specifically.
- Program-level bypass flow (§10.4) — new admin action + learner-visible bypass-eligible state, reusing
  the existing assessment engine.
- Badge issuance — one generic program-completion badge via a retroactive batch job (§10.5), not the
  real-time streak system drawn in the notifications mock.

**Explicitly out of scope for this plan (deferred per the reconciliation doc, listed so scope creep is
visible):**
- Video/audio unit type, playback controls, narrator/language selection (§10.1 — V2).
- Notes tab as drawn (§10.2 — descoped; summary/bookmarks alternative not committed, not building
  either without a separate decision).
- Course ratings/reviews UI (§10.10 — reversed out of V1).
- Help Desk ticket-workflow changes from §8/§10.9 (Reopen removal, satisfaction-survey removal,
  ticket search) — that's student-hub's ticketing engine, not learning-platform; tracked separately.
- Dashboard, Notifications, Profile (§7) — these are student-hub surfaces per the existing app split;
  this plan only covers the assessment-completion *event* learning-platform needs to emit for
  student-hub's notification feed to consume (see Phase 5).
- Real MFA, preferred-name field, hard profile gate — already decided against; no work needed here.
- Sentry integration — decided for V1 but cross-cutting/infra, not scoped in this doc.

## Approach

Phased so the learner-facing critical path ships before the admin/authoring surface, per the priority
call in this plan's brief.

### Phase 1 — Module Assessment learner UI (highest priority: the biggest gap)
Backend (`lib/assessment-engine.ts`, `lib/store/assessment-attempts.ts`, `app/api/assessments/**`) is
already built and unit-tested. This phase is almost entirely frontend, following the same pattern as
the existing Knowledge Check runner and Readiness runner.

1. New route group `app/(learner)/programs/[programId]/assessments/[assessmentId]/` mirroring the
   `readiness/[assessmentId]/` structure already in the codebase.
2. Pre-assessment screen: title/description, rules (question count, attempt limits, last-attempt
   history) — **do not hard-code question count**, read it from `LpStandaloneAssessment.questionsPerAttempt`
   (open question #1 below covers the mock's own internal inconsistency).
3. In-progress runner: one question per screen, supports `single_choice`/`multi_select` (Phase 3 adds
   `Code`), Previous/Next, Flag for Review, Report Question (separate from Flag — needs a lightweight
   `LpQuestionReport` table or reuse of `SupportTicket` with a typed category; recommend a dedicated
   table since this is learning-platform-owned data, not a support ticket).
   Question palette component (numbered grid + Answered/Flagged/Remaining counts) — new, reusable
   across Phase 1 and (if ever needed) KC.
4. Submission/review screen: recap counts, "cannot change answers" warning, jump-to-flagged.
5. Results screen: pass/fail banner, score breakdown, performance-by-topic (already computed as
   `weakTopics` in `LpAssessmentAttempt` — confirm shape covers "topic — pct (n/n correct)", extend if
   needed), detailed feedback list (All/Incorrect/Flagged filter, paginated).
6. Question-issue-reporting end screen: walks through `Report Question`-flagged items, free-text
   detail, Skip/Submit All — separate from step 3's per-question action, per requirements §5.5.
7. Exit-mid-assessment: **Decided 2026-09-21: save partial answers, allow resume.** Attempt state
   persists on exit; the learner returns to the in-progress runner at the same point. The attempt data
   model already supports save-and-resume, so this is UI wiring (an explicit save-state write on exit,
   plus a resume entry point from the pre-assessment screen when an in-progress attempt exists), not a
   schema change.

### Phase 2 — Module unlock reliability — ✅ built 2026-09-21, and the audit changed the plan

**The audit (step 1) found this plan's own premise was wrong.** There was no module-level unlock/gating
mechanism anywhere in the codebase — only unit-level token gating existed. `ProgramOverview.tsx`
rendered every module as always enterable, and neither the unit page nor the new Phase 1 assessment
page checked module-level access at all. Requirements §2 mandates gating ("module unlocks only once
its prerequisite module — or its assessment — is passed"), but nothing implemented it — so this wasn't
a reliability bug to fix, it was greenfield build, and it was also a live access-control gap (a learner
could deep-link straight into a locked module's content or assessment, an IDOR-adjacent issue per
SECURITY.md §3). The Help Desk "automatic progress trigger didn't fire" scenario in §8 was written
against a trigger that didn't exist yet.

What was actually built, given that finding:
1. `lib/lp-utils.ts#moduleGates` — module lock state **computed live** from `LpAssessmentAttempt.passed`
   / `LpStudentUnit.status` (falling back to unit-completion when a module has no assessment, per §2's
   own wording), not a separate stored "unlocked" flag. This removes the atomicity risk by construction
   rather than patching it — there's no second write that can fall out of sync with the first, since the
   underlying grade/submit write (`gradeAndSubmitAttempt`) was already transactional. Wired into the
   program, unit, and assessment pages as an access check, closing the deep-link gap.
2. Two admin endpoints, authenticated via a new `x-admin-token` pattern (`lib/admin-auth.ts`,
   deliberately separate from student-hub's integration token — least privilege): `GET
   /api/admin/module-access` (live diagnostic for Help Desk to see a student's actual gate state) and
   `POST /api/admin/assessments/attempts/[attemptId]/resync` (force-finalizes a genuinely stuck
   `in_progress`/`expired` attempt — the real failure mode once unlock is read-computed: a request that
   never reached the submit route at all, not a desynced flag).
3. 8 new tests (6 module-gate, 2 resync) alongside the existing 19; `tsc`/lint/build clean; verified
   live against the dev Postgres (gating, resync, idempotency) and via direct HTTP checks on the two new
   admin routes (auth rejection, input validation).

Files: `lib/lp-utils.ts`, `lib/store/module-access.ts` (new), `lib/store/{standalone-assessments,
assessment-attempts}.ts`, `lib/assessment-submission.ts` (new — shared grade/submit logic, reused by
both the student submit route and the admin resync route), `lib/admin-auth.ts` (new),
`app/api/admin/module-access/route.ts` (new), `app/api/admin/assessments/attempts/[attemptId]/resync/
route.ts` (new), gating checks added to the program/unit/assessment pages,
`lib/__tests__/module-gates.test.ts` (new) + 2 tests added to `submit-idempotency.test.ts`.

### Phase 3 — Knowledge Check bank + randomization, `Code` question type

**Steps 1 and 3 built 2026-09-21; step 2 (`Code` question type) explicitly deferred**, per the user's
call to tackle open question #5 (scoring model) separately before building anything that depends on it.

1. ✅ **Built**: `LpKnowledgeCheck` extended from its fixed-`questions` JSON blob to a bank model — a
   new `LpKcQuestionBankItem` table (separate from `LpQuestionBankItem`, per the 2026-09-21 decision;
   KC stays single_choice-only for now, so it carries no `type`/`topicId` — nothing consumes a topic
   rollup for KCs the way Standalone Assessments' `weakTopics` does). `LpKnowledgeCheck.questions` JSON
   dropped in favor of `questionsPerAttempt Int`. New `LpKcAttemptQuestion` snapshot table, mirroring
   `LpAttemptQuestion`'s pattern for Standalone Assessments.
   **Went further than scoped, for a real integrity reason found mid-build**: once questions come from
   a random bank, the prior submit-only KC attempt design had no server-pinned record of *which*
   questions were actually shown — a client could submit answers for a self-chosen subset and skew its
   own score (no different in kind from the client-controlled-scope class of bug SECURITY.md's Input
   Validation / Broken Access Control sections warn about). Fixed by switching KC attempts to a
   start→submit lifecycle: new `POST /api/knowledge-checks/[kcId]/attempts/start` pins the randomly
   selected question snapshot server-side before any answer is accepted; `POST .../attempts` now grades
   only against that stored snapshot and ignores/rejects answers for questions outside it. Verified via
   smoke test that a forged extra answer key doesn't inflate the score. This is a real attempt-API
   contract change, not internal-only plumbing — noting it here since nothing else in this plan
   anticipated it.
   No existing seeded KC content was found in the dev DB, so this was schema-only, no data migration
   needed (the Risks section below is updated accordingly); `scripts/migrate-to-postgres.ts`'s legacy
   JSON→Postgres KC path was updated to target the new bank shape rather than left broken for any future
   run against old data.
   Hit the same `prisma migrate dev` auto-diff hazard as the Phase 1/2 migrations (wanted to drop the 9
   hand-authored `student_id` FKs documented in `lp-core.prisma`'s header) — stripped by hand again,
   verified via `pg_constraint` afterward.
2. **Deferred** — not built. `code` is not added to `QuestionType`; no authoring-shape or runner changes
   for it. Blocked on open question #5 (auto-graded vs. manual review), which changes the attempt data
   model (a "pending grade" state Standalone Assessments don't otherwise need). Revisit once that's
   decided.
3. ✅ **Built**: `KnowledgeCheckRunner.tsx` now pulls a randomized subset from the bank per attempt via
   the same `selectQuestions` logic `lib/assessment-engine.ts` already uses for Standalone Assessments
   (genericized and reused, not reimplemented) — matching the Sep 7 decision's actual intent (KC works
   the same way as Standalone Assessments). The existing immediate per-question correct/incorrect
   feedback UX is preserved; the client still receives the correct answer inline for that feedback, same
   tradeoff the fixed-list version already had — flagged, not silently changed.

Files: `prisma/schema/lp-core.prisma` + migration `20260921091015_kc_question_bank_and_attempt_snapshot`;
`types/index.ts`; `lib/assessment-engine.ts` (`selectQuestions` genericized); `lib/kc-utils.ts`
(snapshot-based `scoreAttempt`); `lib/store/catalog.ts`, `lib/store/attempts.ts` (rewritten: `startAttempt`,
`submitAttempt`, `getInProgressAttempt`, `getAttemptQuestionSnapshot`); `app/api/knowledge-checks/[kcId]/
attempts/start/route.ts` (new); `app/api/knowledge-checks/[kcId]/attempts/route.ts` (rewritten contract);
`KnowledgeCheckRunner.tsx`, `UnitShell.tsx`; `scripts/migrate-to-postgres.ts`;
`lib/__tests__/kc-bank.test.ts` (new, 8 tests).

### Phase 4 — Full content authoring UI (per requirements §6.5)
**Decided 2026-09-21: build to the full drawn spec**, not the Sep 7 minimal-scope version — this
supersedes that decision for authoring specifically. Materially larger than originally planned: its
own IA (`Programs`, `Program Setup`, `Course Structure`, `Unit Editor`, `Knowledge Check`,
`Settings & Access`), per-program RBAC, and a review-gated publish path for Module Assessments.
Treat this phase as needing its own follow-on plan doc once Phases 1–3 land, given the scope.

1. App boundary — **Decided 2026-09-21: new standalone Next.js app, `learning-management/`**,
   resolving open question #4. This matches the standing 2026-06-04 "App partitioning" and "Learning
   delivery architecture" decisions (Learning Management is one of five named, separate application
   surfaces, distinct from both Learning Platform and Student Hub) and the 2026-06-08 "Learning
   Management authentication" decision (Microsoft SSO, no in-app profile/password management) — the
   Sep 7 "minimal internal UI" note never overrode that architecture, only the RBAC scope (now also
   reversed, see Scope). Scaffold it the same way `student-hub` was: own `package.json`, own
   `prisma/schema/` folder populated by `scripts/sync-shared-prisma.mjs` from `prisma-shared/`.
   `learning-platform` remains the sole `prisma migrate` runner against the shared database — per
   `docs/shared-schema-audit.md`'s migration-ownership table, `learning-management` reads/writes
   through the synced schema like `student-hub` does, but never runs `migrate` itself.
2. Programs list + Program Setup (§6.1): programs table (name, creator, status `Published`/`Draft`,
   module count, last updated, `Edit`/`View`, `Create Program`); Program Setup form with description,
   single **Creator** field ("owns and maintains this program's content"), thumbnail upload (PNG/JPG,
   16:9), multi-add/remove **Program Instructors** list (distinct from Creator — instructors can
   change without changing the creator).
3. Course Structure builder (§6.2): tree editor, `+ Add Module` → `+ Add Unit`, reorderable
   (`↑`/`↓`) units matching `order: Int` on `LpModule`/`LpUnit`, per-unit content-type display.
4. Knowledge Check editor (§6.3): draft/version label (e.g. `v1.4 - Draft`), name + **Associated
   Unit** binding (one KC per unit), direct-publish (no review gate) against the
   `LpKcQuestionBankItem` bank from Phase 3.
5. Module Assessment editor (§6.4): question CRUD against `LpQuestionBankItem`, topic/module-area
   tagging, per-question weight (points), `+ Import from Bank` (shared/importable bank across
   assessments), `Save Draft` / `Submit for Review` — this path is review-gated (routes to the
   Reviewer role), unlike Knowledge Checks.
6. Settings & Access (§6.5): three content roles — **Editor** (create/edit/structure, update
   quizzes, publish under-review courses), **Reviewer** (inspect pathways, preview drafts, suggest
   edits, approve program progression — what `Submit for Review` in step 5 routes to), **Viewer**
   (read-only: drafts, content metrics, historical grades); separate **Program Director** and
   **Program Owner** fields (distinct from Creator in step 2 and from Editor/Reviewer/Viewer);
   Contributors table (name, email, role, date added, remove) with per-program membership,
   independent of a user's global platform role.
7. Microsoft SSO — new auth provider alongside the existing Google OAuth NextAuth config
   (`lib/auth.config.ts`); scope to this authoring surface only, not the learner app.

### Phase 5 — Bypass, badges, and the notification event
1. Bypass (§10.4): admin action to grant a student direct access to a program's Module/Program-level
   assessment, bypassing curriculum gating; a `bypassGranted`-style flag on `LpEnrollment` (or a new
   small table if history/audit matters — recommend a table, since "who granted this and when" is
   exactly the kind of thing that needs an audit trail and `AuditEntry` already exists as a shared
   model). Failure sends the student back to the full program.
2. Badge issuance (§10.5): a retroactive batch job (script, not a live trigger) that scans completed
   enrollments and issues one generic completion badge per student per program. **Unblocked
   2026-09-21**: the display-name mechanism is the Sep 7 decision already on record (reconciliation
   doc §10.6 — students display their Google OAuth name); the badge shows **first name only**.
3. Assessment-completion notification event: learning-platform emits something student-hub's
   dashboard/notification feed can consume on attempt submission (requirements §7 — "You scored 93%...").
   Given the existing integration pattern (`/api/integration/*` endpoints, `x-integration-token`
   auth), this is likely a new `POST` from learning-platform to a new student-hub endpoint, mirroring
   the existing direction of the `students` integration call — confirm the direction with whoever owns
   student-hub's notification feed before building either side.

## Files / modules affected

- `learning-platform/app/(learner)/programs/[programId]/assessments/[assessmentId]/**` — new (Phase 1)
- `learning-platform/app/api/assessments/[assessmentId]/**` — likely extended, not rebuilt (Phase 1, 2)
- `learning-platform/lib/store/assessment-attempts.ts`, `lib/assessment-engine.ts` — read/extend for
  unlock trigger (Phase 2) and `Code` scoring (Phase 3)
- `learning-platform/prisma/schema/lp-core.prisma` — new `LpQuestionReport` table (Phase 1); KC bank
  table(s) and `code` enum value (Phase 3); bypass table/flag (Phase 5) — each is a real migration,
  not a config change
- `learning-platform/app/(learner)/programs/[programId]/units/[unitId]/components/KnowledgeCheckRunner.tsx`
  — randomized subset selection (Phase 3)
- `learning-platform/app/(learner)/catalog/components/CatalogClient.tsx` — verify/extend 4-state
  enrollment machine (in-scope check, not yet a confirmed gap)
- New `learning-management/` app — full Next.js scaffold, own `package.json`, `prisma/schema/`
  populated via `scripts/sync-shared-prisma.mjs`, Microsoft SSO auth config (Phase 4)
- `scripts/sync-shared-prisma.mjs` — add `learning-management/prisma/schema` to `TARGETS` (Phase 4)
- New badge batch script + student-hub notification integration endpoint — Phase 5

## Open questions / assumptions

1. **Question-count inconsistency** (requirements §5.1/§5.2: pre-assessment screen mock says 10,
   in-progress mocks say 24) — still unresolved per the requirements doc itself. Phase 1 reads the
   real count from `questionsPerAttempt` at runtime either way, so this doesn't block building, but
   whoever authors the actual assessment content needs the real number confirmed.
2. ~~Exit-mid-assessment behavior~~ — **Resolved 2026-09-21**: save partial + resume (see Phase 1
   step 7).
3. ~~KC/Module Assessment shared schema~~ — **Resolved 2026-09-21**: separate `LpKcQuestionBankItem`
   table, not shared with `LpQuestionBankItem` (see Phase 3 step 1).
4. ~~Where does the authoring UI live~~ — **Resolved 2026-09-21**: new standalone app,
   `learning-management/`, matching the 2026-06-04/2026-06-08 decisions (see Phase 4 step 1).
5. **`Code` question type scoring** — not specified in any source doc. Auto-graded (exact match /
   test harness) or routed to manual review? This changes the Phase 3 data model (does an attempt
   answer need a "pending grade" state that Standalone Assessments don't otherwise have?).
6. ~~Badge display-name mechanism~~ — **Resolved 2026-09-21**: the Sep 7 decision (reconciliation
   doc §10.6, Google OAuth name) counts as finalized; badge uses first name only (see Phase 5.2).
7. **Notification event direction/contract** (Phase 5.3) — assumed to follow the existing
   integration-endpoint pattern, but the specific payload/endpoint isn't designed yet; needs a short
   design pass of its own before implementation, likely deserving its own plan doc given it's a
   cross-app contract change.

## Risks / things that could go wrong

- ~~Phase 3's KC-to-bank migration... existing KC content needs a data migration~~ — **Checked
  2026-09-21**: no seeded KC content existed in the dev DB, so this was schema-only. Not yet verified
  against any staging/production data if that diverges from dev.
- ~~The module-unlock fix (Phase 2) touches pass/fail-critical logic; needs solid test coverage~~ —
  **Done 2026-09-21**: 8 new tests added (6 module-gate, 2 resync), matching `assessment-engine.ts`'s
  existing coverage bar; verified live against the dev Postgres. See Phase 2 section for what was
  actually built — the risk framing changed once the audit found there was no unlock mechanism to fix.
- Phase 4 (authoring UI) scope is now decided (full §6.5 RBAC, 2026-09-21), superseding the Sep 7
  "minimal, no RBAC" decision for authoring specifically. It's materially larger than the original
  minimal-scope plan — treat it as needing its own follow-on plan doc rather than building it straight
  off this section.
- **Now concretely in play, not hypothetical**: `learning-management` becomes a third Prisma-reading
  app (after `learning-platform` and `student-hub`), which is exactly the "two migration runners" risk
  `docs/shared-schema-audit.md` already evaluated — the mitigation is already established (only
  `learning-platform` runs `prisma migrate`; new apps consume the synced `prisma-shared/` schema
  read/write via Prisma client without ever invoking `migrate`), but Phase 4 scaffolding must actually
  follow it, not just cite it.

## Out of scope (explicitly deferred)

- Video/audio unit type and all its player/narration UI (V2 per 10.1).
- Notes tab / summary / bookmarks (no committed replacement design yet).
- Course ratings/reviews.
- Help Desk workflow changes (student-hub's surface, tracked separately).
- Dashboard/Notifications/Profile UI builds (student-hub's surface; only the cross-app event contract
  in Phase 5.3 is this plan's concern).
- Real MFA, preferred-name field, hard profile gate, streak/weekly badges, Sentry.

---

## Revision log

- 2026-09-20: initial draft.
- 2026-09-21: reviewed with Bichesq. Decisions applied: Phase 4 authoring UI builds to the full
  requirements §6.5 RBAC spec (Editor/Reviewer/Viewer/Director/Owner/Creator/Instructor), superseding
  the Sep 7 minimal-scope decision for authoring specifically; Phase 3 KC question bank gets its own
  `LpKcQuestionBankItem` table rather than sharing `LpQuestionBankItem`; Phase 1 step 7 exit-mid-
  assessment saves partial answers and allows resume; Phase 5.2 badge issuance is unblocked, using
  first name from Google OAuth per the existing Sep 7 display-name decision (reconciliation doc
  §10.6). Open questions #2, #3, #6 resolved; #4 and #5 remain open.
- 2026-09-21 (later same session): open question #4 resolved — Phase 4 ships as a new standalone
  `learning-management/` app, not a route group inside `learning-platform`, per the standing
  2026-06-04/2026-06-08 decision-log entries naming Learning Management as one of five separate
  application surfaces with its own Microsoft SSO auth. Scaffolds the same way `student-hub` did
  (own `package.json`, `prisma/schema/` synced from `prisma-shared/`); `learning-platform` stays the
  sole `prisma migrate` runner. Only open question #5 (`Code` question scoring) remains.
- 2026-09-21 (later same session): Phase 1 built (Module Assessment learner UI, all 7 steps). Phase 2
  built — audit found no module-unlock mechanism existed at all (this plan's step 1 premise was wrong),
  so it was greenfield build plus a real access-control fix, not a reliability patch; rewrote the Phase
  2 section to match what was actually found/built and marked the corresponding test-coverage risk
  done.
- 2026-09-21 (later same session): Phase 3 steps 1+3 built (KC question bank + randomization), step 2
  (`Code` type) explicitly deferred per user instruction pending open question #5. Rewrote the Phase 3
  section to match, including a mid-build integrity fix (KC attempts moved to a start→submit lifecycle
  so the server pins the random question snapshot before grading) that wasn't anticipated in the
  original plan. Marked the KC-bank data-migration risk resolved (no seeded content existed).
