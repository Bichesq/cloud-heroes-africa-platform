# Learning Management authoring app — Phase 4 implementation plan

**Date:** 2026-09-21
**Status:** Draft — awaiting review

## Context

`docs/plan/2026-09-20-learning-platform-v1-build.md` (Phase 4) already decided the two biggest
questions: this ships as a full requirements-§6.5-scoped authoring surface (not the Sep 7 minimal
version), and it lives in a new standalone app, `learning-management/`, per the standing
2026-06-04 "App partitioning" / "Platform naming" and 2026-06-08 "Learning Management core scope" /
"Learning Management authentication" decision-log entries — this was named and scoped as a separate
app months before Sep 7's scope-narrowing note, and that note never overrode the architecture.

That plan's Phase 4 section is a sequencing sketch, not an implementation plan — it doesn't resolve the
actual data-model questions (who can even *be* an Editor/Reviewer/Owner if none of those people are
`Student` rows), the schema-sharing mechanism for a third Prisma-writing app, or the session/auth
isolation this needs from the other two apps. This doc exists to resolve those before any code gets
written, per this project's plan-doc-writer workflow requirement.

Phases 1–3 of the parent plan are already built in `learning-platform` (Module Assessment learner UI,
module-gating, KC question bank + randomization) — this phase reads/writes the same `Lp*` Prisma models
those phases extended.

## Goal

An internal CHA staff member (Editor/Reviewer/Owner/etc.) can sign in to `learning-management` via
Microsoft SSO and create/edit a Program's structure (Module → Unit tree), author Knowledge Checks and
Module Assessments against the question banks Phase 3 already built, and manage who else has authoring
access to that specific program — with every action checked against that person's actual role on that
specific program, not just "is this an authenticated internal user."

## Scope

**In scope for this pass:**
- App scaffold: `learning-management/`, following the `student-hub` bootstrap pattern (own
  `package.json`, own `prisma/schema/`, own dev port).
- Schema-sharing mechanism so `learning-management` gets real Prisma relational access to `LpProgram`,
  `LpModule`, `LpUnit`, `LpKnowledgeCheck`, `LpKcQuestionBankItem`, `LpQuestionBankItem`,
  `LpStandaloneAssessment` — the models Phases 1–3 already extended.
- New data model for *who can author* — internal-staff identity plus program-scoped roles. Nothing like
  this exists today; `Student` is learner-only and `LpProgram.creators` is an untyped `Json` blob with
  no role concept.
- Microsoft SSO auth, isolated from the Google-OAuth session `learning-platform`/`student-hub` share.
- Screens: Programs list + Program Setup (§6.1), Course Structure builder (§6.2), Knowledge Check editor
  (§6.3), Module Assessment editor (§6.4), Settings & Access / Contributors (§6.5).
- Server-side authorization enforcement per screen/action, per SECURITY.md §3 (Broken Access Control).

**Explicitly out of scope for this pass (flagged, not silently dropped):**
- Thumbnail *storage* backend (S3/blob/etc.) — §6.1 asks for PNG/JPG upload; this plan assumes local
  filesystem or a placeholder for now and treats the real storage choice as a follow-up, since it's an
  infra decision this doc shouldn't make unilaterally.
- Draft *versioning* UI/history (§6's "draft versioning" requirement) — the editors will have a
  `published: Boolean` and a draft/live distinction, but a full version-history browser is deferred; noted
  as a gap, not built here.
- Any change to `learning-platform`'s or `student-hub`'s own auth — this only adds a third, isolated
  auth surface.
- Bypass/badges/notifications (Phase 5 of the parent plan) — untouched.

## Approach

### 1. Schema-sharing mechanism (do this first — everything else depends on it)

Today, `prisma-shared/*.prisma` (bucket-A models per `docs/shared-schema-audit.md`) is copied by
`scripts/sync-shared-prisma.mjs` into `learning-platform` and `student-hub`'s `prisma/schema/` folders.
`lp-core.prisma` (Program/Module/Unit/KnowledgeCheck/QuestionBank/etc.) is **not** in that shared set —
it's `learning-platform`-local, because until now only `learning-platform` needed it.

`learning-management` needs real relational access to those same models (a `@relation` from a new
`LpProgramContributor` to `LpProgram` requires `LpProgram` to be modeled inside `learning-management`'s
own schema build, not just reachable over an API). This is the exact "bucket A" situation
`shared-schema-audit.md` already worked through for `Student` — same mechanism applies:

1. Move `learning-platform/prisma/schema/lp-core.prisma`'s content into `prisma-shared/lp-core-models.prisma`.
2. Add `learning-management/prisma/schema` to `TARGETS` in `scripts/sync-shared-prisma.mjs` (this was
   already flagged as needed in the parent plan's Phase 4 file list).
3. `learning-platform` remains the **sole** `prisma migrate` runner — same rule already established for
   `student-hub`, reaffirmed here rather than re-litigated, per `shared-schema-audit.md` §4's explicit
   reasoning (one owner per shared database avoids `_prisma_migrations` collisions).
4. Side effect: `student-hub` also receives `lp-core.prisma`'s models via the same blanket copy (it
   already receives `student-hub-local-models.prisma` into `learning-platform` the same way — this
   over-copying is an existing, accepted pattern in this repo, not a new inefficiency introduced here).

### 2. Authorship identity + program RBAC data model

New models (added to the relocated `prisma-shared/lp-core-models.prisma`):

- **`LpAuthor`** — internal-staff identity, keyed by Microsoft SSO email (distinct from `Student`;
  someone can plausibly be both a student and an author, so this is deliberately a separate table, not
  a role flag on `Student`). Fields: `id`, `email` (unique), `name`, `createdAt`.
- **`LpProgramContributor`** — the Contributors table from §6.5: `programId`, `authorId`, `role`
  (`editor` | `reviewer` | `viewer`), `addedAt`, `addedBy`. One row per person per program; role is
  program-scoped, matching §6.5's "independent of a user's global platform role."
- **`LpProgramInstructor`** — the multi-add/remove Instructors list from §6.1: `programId`, `authorId`,
  `addedAt`. Kept separate from `LpProgramContributor` because Instructors aren't described as having
  Editor/Reviewer/Viewer authoring permissions — they're a distinct, non-role list per §6.1's own
  wording ("Instructors can change without changing the creator").
- **`LpProgram` gains one new nullable field**: `creatorAuthorId` (`@relation` to `LpAuthor`) — the
  creator stays a single, effectively-static field per the 2026-07-06 "creators are fixed once a program
  is created" decision; nothing since has revisited its plurality.
- **`LpProgramDirector`** and **`LpProgramOwner`** — two more multi-add/remove lists, same shape as
  `LpProgramInstructor` above (`programId`, `authorId`, `addedAt`, `addedBy`): resolves what was
  Open Question #1 in this doc's first draft. The 2026-09-17 planning session settled it directly while
  reviewing the actual Settings & Access screen: "Program Director and Program Owner are add-able lists
  (like the existing Contributors list) rather than single fields," explicitly to future-proof against a
  program having only one Director/Owner (see `decision-log.md`, 2026-09-17). Kept as their own tables
  rather than extra `LpProgramContributor.role` values because Director/Owner are already established
  (requirements §6.5) as a distinct concept from the Editor/Reviewer/Viewer authoring roles — same
  reasoning the first draft used to keep `LpProgramInstructor` separate.

### 3. Microsoft SSO, isolated from the existing Google-OAuth session

`learning-platform`'s `lib/auth.config.ts` header comment is explicit that it deliberately shares its
`NEXTAUTH_SECRET`/cookie/JWT strategy with `student-hub` so a session from either is valid on the other
(cookies aren't port-scoped on localhost) — that sharing was an intentional design for the *learner*
trust boundary. `learning-management` is a different trust boundary (internal staff, different
provider) and **must not** reuse that secret or rely on the same cookie namespace — see Risks. Concretely:

- New `learning-management/lib/auth.config.ts`, Microsoft (Entra ID) provider via `next-auth`.
- Its own, distinct `NEXTAUTH_SECRET` (not the value shared by the other two apps).
- `signIn` callback checks `LpAuthor` (or creates one on first login, mirroring the `Student`
  upsert-on-login pattern) — no `ApprovedEmail` gate reuse; that list is learner-specific
  (`docs/decision-log.md` 2026-06-11), and per-program access here comes from
  `LpProgramContributor`/instructor/creator/director/owner rows, not a platform-wide approved list.
  Whether there's a *global* allowlist for "who can even attempt to sign in to Learning Management at
  all" (vs. relying entirely on per-program rows existing) is Open Question #4.

### 4. Screens

Each screen enforces its own server-side authorization (SECURITY.md §3 — never a client-side-only
check), scoped to the specific `programId` in the URL, checked against that user's actual
`LpProgramContributor`/creator/director/owner rows for *that* program:

1. **Programs list + Program Setup (§6.1)** — list shows programs the signed-in author has any role on
   (or all programs if Owner/Director is treated as platform-wide — Open Question #2); create/edit form
   for name, description, Creator, thumbnail (see Scope note on storage), Instructors multi-add.
2. **Course Structure builder (§6.2)** — Module/Unit tree, add/reorder, matching existing `order: Int`
   fields already on `LpModule`/`LpUnit`. Editor role required to write; Viewer read-only.
3. **Knowledge Check editor (§6.3)** — CRUD against `LpKcQuestionBankItem` (Phase 3's bank), draft/version
   label, direct-publish (no review gate, per §6.3's own text distinguishing it from §6.4).
4. **Module Assessment editor (§6.4)** — CRUD against `LpQuestionBankItem`, `+ Import from Bank`,
   `Save Draft` / `Submit for Review`. "Submit for Review" transitions the assessment into a state a
   Reviewer must act on before it's live — needs a status field (`draft` / `in_review` / `published`)
   on `LpStandaloneAssessment`, which doesn't exist today (currently no draft/publish state at all on
   that model — Open Question #3).
5. **Settings & Access (§6.5)** — Contributors table CRUD (add/remove/change role), plus a Director list
   and an Owner list with the same add/remove UI (`LpProgramDirector`/`LpProgramOwner`, not single
   fields — see §2), all scoped to the current program and gated to Owner/Director (an Editor shouldn't
   be able to grant themselves Reviewer elsewhere, etc. — least privilege per SECURITY.md §3).

## Files / modules affected

- `prisma-shared/lp-core-models.prisma` — new file; content moved from
  `learning-platform/prisma/schema/lp-core.prisma`, plus new `LpAuthor`, `LpProgramContributor`,
  `LpProgramInstructor`, `LpProgramDirector`, `LpProgramOwner` models and the one new nullable
  `creatorAuthorId` field on `LpProgram`. Real migration (adds tables/columns), run from
  `learning-platform` only.
- `scripts/sync-shared-prisma.mjs` — add `learning-management/prisma/schema` to `TARGETS`.
- New `learning-management/` app — full Next.js scaffold (App Router, HeroUI v3 + CHA design system per
  the `build-page-from-screenshot` skill, `next-auth` with Microsoft provider, own `prisma/schema/`
  synced from `prisma-shared/`).
- `learning-management/lib/auth.config.ts` — new, Microsoft SSO, own secret (not shared with the other
  two apps).
- `learning-management/app/**` — the five §6.1–§6.5 screens.
- `learning-platform/prisma/schema/lp-core.prisma` — deleted (superseded by the relocated shared file).

## Open questions / assumptions

1. ~~Are Director/Owner separate `LpProgram` fields, or `LpProgramContributor` rows with those role
   values?~~ **Resolved 2026-09-17**: neither — they're their own multi-add/remove lists
   (`LpProgramDirector`/`LpProgramOwner`), matching the Contributors list's UI/shape but kept as distinct
   tables since Director/Owner aren't Editor/Reviewer/Viewer authoring permissions. See §2 above.
2. **Is program visibility in the Programs list scoped per-contributor, or do Owner/Director see every
   program platform-wide?** Affects the list query and whether "Owner"/"Director" are meaningfully
   per-program at all versus effectively global roles.
3. **`LpStandaloneAssessment` has no draft/publish/review-state field today** — Module Assessment
   authoring's "Save Draft / Submit for Review" (§6.4) needs one. Confirm the state machine (at minimum:
   `draft` → `in_review` → `published`; does a Reviewer's rejection go back to `draft` or a distinct
   `changes_requested` state?) before writing that migration.
4. **Is there a platform-wide allowlist gating who can sign in to `learning-management` at all**,
   separate from per-program contributor rows (mirroring how `ApprovedEmail` gates the learner apps), or
   does *any* successfully-Microsoft-SSO-authenticated CHA org account reach the app and then simply see
   zero programs until someone grants them a role? The latter is simpler and arguably sufficient (Entra
   ID/org-account SSO is itself an access boundary), but worth an explicit decision rather than a default.
5. **Thumbnail upload storage backend** — not decided here (see Scope); needs its own short decision
   before Program Setup's upload control is wired to something real.

## Risks / things that could go wrong

- **Session/cookie boundary risk if Microsoft SSO reuses the shared learner secret.** This is the most
  important risk in this plan. `learning-platform`/`student-hub` deliberately share one
  `NEXTAUTH_SECRET`/cookie so a session from either is valid on the other (see Context). If
  `learning-management` is scaffolded carelessly by copying that env value "for consistency," an internal
  staff member's Microsoft-authenticated session and a learner's Google-authenticated session would sit
  under the same trust boundary on localhost (cookies aren't port-scoped), which is exactly the kind of
  cross-boundary session risk SECURITY.md §4 warns against. **This plan requires a distinct
  `NEXTAUTH_SECRET` for `learning-management`, set explicitly during scaffolding, not inherited.**
- **Third Prisma-writing app reintroduces the "two migration runners" class of risk** the shared-schema
  audit already flagged for `student-hub` — mitigated the same way (only `learning-platform` runs
  `prisma migrate`), but worth re-verifying once `learning-management` actually exists, the same way
  Phase 2/3 sessions this cycle had to hand-fix `prisma migrate dev`'s auto-diff wanting to touch
  unrelated hand-authored constraints.
- **Moving `lp-core.prisma` into `prisma-shared/` is itself a non-trivial refactor** of an existing,
  already-migrated schema file — needs to be a pure rename/relocation with no model changes in the same
  step as adding the new RBAC models, so a broken migration is easy to isolate from a real schema change.
- **No existing concept of "internal staff" anywhere in this codebase** — `LpAuthor` is genuinely new
  ground, not an extension of `Student`. Getting the first Owner/Director bootstrapped for each existing
  program (the 4 already seeded via `data/lp-programs.json`, see this session's Phase-1-verification
  work) needs a one-off backfill step, not just new-program-forward logic.

## Out of scope (explicitly deferred)

- Thumbnail storage backend implementation.
- Full draft-version history browser.
- Any change to `learning-platform`/`student-hub` auth.
- Phase 5 of the parent plan (bypass, badges, notification event).
- The real-time streak/weekly badge system, and anything else already out of scope per the parent plan.

---

## Revision log

- 2026-09-21: initial draft.
- 2026-09-23: resolved Open Question #1 against the 2026-09-17 planning session (which this draft
  predates but hadn't incorporated) — Director/Owner are `LpProgramDirector`/`LpProgramOwner`
  multi-add/remove lists, not single nullable `LpProgram` fields. Updated §2, §4.5, and the affected-files
  list accordingly.
