# Learning Management authoring app — Phase 4 implementation plan

**Date:** 2026-09-21
**Status:** Approved 2026-09-24 — sub-steps 1–2 implemented; sub-step 3 (Course Structure) next

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

**Design source:** the `Create Course View (For Admins)` page of `docs/CHA Platform_4.fig` draws
seven screens (Programs, Program Setup, Course Structure, **Unit Editor**, Knowledge Check Editor,
Module Assessment Configuration, Settings & Access). As with the learner rebuild, each screen is
decoded frame-by-frame and built via `build-page-from-screenshot`, using the file's own assets.

Phases 1–3 of the parent plan are already built in `learning-platform` (Module Assessment learner UI,
module-gating, KC question bank + randomization) — this phase reads/writes the same `Lp*` Prisma models
those phases extended.

## Goal

An internal CHA staff member (Editor/Reviewer/Owner/etc.) can sign in to `learning-management` via
Microsoft SSO and create/edit a Program's structure (Module → Unit tree), author each Unit's content and its Topics
(the Sept 21 Unit → Topic layer), author Knowledge Checks and
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
- Screens: Programs list + Program Setup (§6.1), Course Structure builder (§6.2), **Unit Editor**
  (drawn in the Figma and listed in the parent plan's Phase 4 IA, but missing from this doc's first
  drafts), Knowledge Check editor (§6.3), Module Assessment editor (§6.4), Settings & Access /
  Contributors (§6.5).
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
3. **Unit Editor** (Figma "Unit Editor") — Course Context (program, module), Unit Details (name,
   description), Creator & Media (Creator, 16:9 PNG/JPG thumbnail), **Content Upload** (a `.md` file,
   with the drawn note *"Uploading an .md file will auto-generate the course structure, knowledge
   checks, and module assessments"*), and Delete Unit / Save Draft / Publish Unit. It also produces
   the unit's **Topics** (`LpTopic.order` + `LpContentBlock.topicId`, added 2026-09-23). Today only
   test topics exist, so this is the first real way to create them. Assumed mechanism: a topic
   separator convention in the Markdown file (Kris, 2026-09-21: "put in a separator"). How much the
   import auto-generates is Open Question #6.
4. **Knowledge Check editor (§6.3)** — CRUD against `LpKcQuestionBankItem` (Phase 3's bank), draft/version
   label (Figma: `v1.4 - Draft`), Associated Unit, per-question **Weight (pts)**, answer options with
   correct indicator, Explanation. Direct-publish (no review gate, per §6.3's own text distinguishing
   it from §6.4). Schema gaps: see Open Question #7.
5. **Module Assessment editor (§6.4)** — Figma "Module Assessment Configuration": scope module, name,
   description, Passing Threshold, **Attempts Allowed**, **Time Limitation** (enable toggle + minutes),
   and a question matrix (ID & type incl. **Code**, scenario, **Module Area**, Default Weight) with
   `+ Import from Bank`. CRUD against `LpQuestionBankItem`, `Save Draft` / `Submit for Review`.
   "Submit for Review" transitions the assessment into a state a Reviewer must act on before it's
   live — needs a status field (`draft` / `in_review` / `published`) on `LpStandaloneAssessment`,
   which doesn't exist today (currently no draft/publish state at all on that model — Open Question
   #3). "Module Area" reuses tag-only `LpTopic` rows (`order` null); the UI must keep these distinct
   from a unit's navigable topics.
6. **Settings & Access (§6.5)** — Contributors table CRUD (add/remove/change role), plus a Director list
   and an Owner list with the same add/remove UI (`LpProgramDirector`/`LpProgramOwner`, not single
   fields — see §2), all scoped to the current program and gated to Owner/Director (an Editor shouldn't
   be able to grant themselves Reviewer elsewhere, etc. — least privilege per SECURITY.md §3).

### 5. Build order — six sub-steps, each Figma-first

Same pattern as the learner rebuild (the 2026-09-23 learner UI rebuild, now complete; see git history): each sub-step
decodes its Figma frame(s) first, checks them against the relevant decisions, is reviewable on its
own, and gets a revision-log entry.

1. **Foundation** — scaffold `learning-management/`, pure relocation of `lp-core.prisma` into
   `prisma-shared/` (verified no-op: `migrate diff` shows only the known DB-only student-FK drift),
   then the RBAC models migration, Microsoft SSO with its own secret, and the Owner/Director backfill
   for the 4 seeded programs.
2. **Programs + Program Setup + Settings & Access** — these establish the role checks every later
   screen relies on.
3. **Course Structure** — Module/Unit tree, add/reorder.
4. **Unit Editor + Markdown/topic import** — the largest sub-step. Scope per Open Question #6.
5. **Knowledge Check editor.**
6. **Module Assessment editor** — including the review-gated publish path.

### 6. Cross-cutting requirements (every sub-step)

- **Editing live content** — learners only see `published` programs, but today nothing stops an
  edit to an already-published program reaching learners immediately (including adding or removing
  topics, which changes per-topic progress). Needs an explicit rule: Open Question #8.
- **Uploads** (thumbnails, unit images, `.md` files) — validate by content (magic bytes), enforce
  size limits, store outside the web root with randomized filenames (SECURITY.md §10). Storage
  backend is Open Question #5, which now covers content images, not just thumbnails.
- **Markdown rendering** — learner pages currently use a small custom renderer that escapes
  everything, so authored content is safe today. If a full Markdown parser is adopted (Kris's "just
  make it an MD viewer"), it must sanitize against an allowlist (SECURITY.md §2).
- **Input validation** — zod `strictObject` on every write route, same as learning-platform.
- **Audit log** for contributor/role/instructor changes — Kris asked for this (decision-log open
  item 23). Assumed in scope for sub-step 2 unless you say otherwise.
- **Rate limiting** — the new write routes join the cross-route follow-up deferred in
  the 2026-09-24 per-topic progress work.

### 7. Sub-step 2 detail — Programs, Program Setup, Settings & Access (decided 2026-09-28)

**Permission rules** (Bichesq, 2026-09-28, recommended options). Every rule is checked on the server
for the `programId` in the request, in one place (`lib/program-access.ts`):

| Action | Allowed |
|---|---|
| See a program (list, Setup read-only, Settings read-only) | any role on it (decision #2) |
| Create a program | Director on **at least one** program. The creator becomes the new program's Creator, Owner and Director |
| Edit Program Setup (name, description, thumbnail, Instructors) | Owner, Director, Editor |
| Change the program's Creator | Owner, Director (creators are fixed by default, 2026-09-07) |
| Add/remove/change Contributors | Owner, Director |
| Add/remove Directors and Owners | Director only. The **last Director can't be removed**, so a program is never orphaned |

- **People pickers** list existing `LpAuthor` rows by name (2026-09-17: "assigned by name via
  dropdown… not free-text email"). Someone new has to sign in once before they can be added.
- **Audit log**: new append-only `LpAuthoringAuditEntry` (actor, program, action enum, subject
  author, before/after JSON). It's written in the same transaction as each role, Creator,
  Instructor, create or setup change.
- **Thumbnail** (decision #5): `lib/storage` interface with a local-disk backend under
  `learning-management/storage/` (gitignored, outside `public/`). Files are PNG/JPEG only, checked by
  magic bytes, 2 MB cap, random UUID names. They're served by
  `GET /api/programs/[programId]/thumbnail`, which checks the program role and reads the key from
  the database, never from the URL. Stored in a **new `LpProgram.thumbnailKey`**; `heroImage`
  stays unchanged because the learner catalogue uses it as a public `<img src>`. Showing authored
  thumbnails to learners is a follow-up.
- **Schema** (one migration, `--create-only` with the student-FK drops stripped): `LpProgram.updatedAt`
  (for "Last Updated"), `LpProgram.thumbnailKey`, `LpAuthoringAuditEntry` + `LpAuthoringAuditAction`.
- **Routes**: `/` (Programs table), `/programs/new`, `/programs/[programId]/setup`,
  `/programs/[programId]/settings`. Writes are server actions with zod `strictObject`. "View"
  opens the program in the learner app (`LM_LEARNER_APP_URL`) only when it's published.
- **Figma vs. decisions**: Settings & Access draws Director and Owner as single dropdowns; they're
  built as add/remove lists (2026-09-17). Program Setup has no Instructors control in the frame; it's
  added below the details as a labelled custom section (§6.1).
- **Deferred**: rate limiting (cross-route follow-up, §6); deleting programs; publishing a program
  (publishing is per unit, decision #8).

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
- `learning-management/app/**` — the six screens (§6.1–§6.5 plus the Unit Editor).
- A Markdown → Unit/Topic import module (location decided in sub-step 4). It writes `LpUnit`,
  `LpTopic` (with `order`) and `LpContentBlock` (with `topicId`).
- Further `lp-core` schema changes pending Open Question #7 (KC question weight, attempt cap,
  optional time limit, `code` question type, one-KC-per-unit constraint).
- `learning-platform/prisma/schema/lp-core.prisma` — deleted (superseded by the relocated shared file).

## Open questions / assumptions

**Resolved 2026-09-24 (Bichesq accepted the recommendations for #2–#9):**

| # | Resolution |
|---|---|
| 2 | Program visibility is **per program**: the Programs list shows only programs where the author is Creator, Instructor, Contributor, Director or Owner. No platform-wide role. |
| 3 | Review states: `draft` → `in_review` → `published`; a Reviewer's rejection returns it to **`draft`**, with the reviewer's comment stored. No separate `changes_requested` state. |
| 4 | **No global allowlist.** Microsoft SSO restricted to the CHA organisation tenant is the sign-in boundary. A signed-in author with no program rows sees an empty Programs list. |
| 5 | V1 media storage is **local disk outside the web root**, behind a small storage interface (`put`/`get`/`delete`), served through an authenticated route. It uses randomized filenames and content (magic-byte) + size validation. A cloud backend (S3/Azure Blob) plugs in later behind the same interface. |
| 6 | The `.md` upload imports **unit content and Topics only** in V1; KCs and assessments are authored in their own editors. Topic separator: **each `## ` heading starts a new topic**, and text before the first `##` belongs to topic 1. Import shows a dry-run preview before writing. |
| 7a | KC question weight: add `pointsPossible Decimal @default(1)` to `LpKcQuestionBankItem`, matching `LpQuestionBankItem`. |
| 7b | Attempts Allowed: add `maxAttempts Int?` to `LpStandaloneAssessment` (null = unlimited). It's a **cap in addition to** the 2026-08-06 progressive cooldown. At the cap, the learner is blocked and pointed to support, and staff can grant one more attempt. |
| 7c | Time limit becomes optional: `timeLimitSeconds Int?` (null = untimed, the Figma toggle off). |
| 7d | **Code questions are out of V1 authoring** until decision-log open item 32 (grading) is settled; the type is hidden in the picker. |
| 7e | **One KC per unit** is enforced with a unique constraint on `LpKnowledgeCheck.unitId` (dev data checked: at most one per unit today). |
| 8 | **Per-unit publishing**: edits to a published unit are saved as a draft copy and only reach learners on **Publish Unit** (the Figma's Save Draft / Publish Unit). Learners' progress on republish: removed topics are ignored and a completed unit is never downgraded (already how the progress code works). |
| 9 | Unit-level Creator becomes a real **`LpUnit.creatorAuthorId` → `LpAuthor`** relation; the untyped `creators` JSON is kept only for existing data until backfilled. |

The original questions below are kept for the record.


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
   before Program Setup's upload control is wired to something real. (2026-09-24: now also covers
   unit thumbnails and content images, so it's a general media-storage decision.)
6. **How much does the Unit Editor's `.md` upload auto-generate in V1?** The Figma note says
   structure, knowledge checks, *and* module assessments. **Recommended: V1 imports the unit's content
   and Topics only**, and KCs and assessments are authored in their own editors, which already have a
   bank model and review path. Generating questions from Markdown needs a question syntax plus
   validation and is a feature of its own. Also confirm the topic separator convention (e.g. each
   `## ` heading starts a topic, or an explicit marker).
7. **Figma fields with no schema behind them** — decide each before the migration:
   (a) KC question **Weight (pts)**: `LpKcQuestionBankItem` has no points field;
   (b) assessment **Attempts Allowed** (Figma "3 times"): no cap exists today, and the current rule is
   a cooldown after each fail. Is it a cap, a replacement for the cooldown, or both?
   (c) **Time Limitation** enable toggle: `timeLimitSeconds` is required, so "off" can't be stored;
   (d) **Code** question type (Figma Q-104): not in `QuestionType`; still decision-log open item 32
   (manual vs. automated grading), so a `code` type likely needs a manual-review grading path;
   (e) Associated Unit implies **one KC per unit**, but the schema allows several. Should it be enforced?
8. **Draft vs. live for published content** — do edits to a published program go live immediately,
   or through a draft copy that's published as a whole (Unit Editor's "Save Draft / Publish Unit"
   suggests per-unit publishing)? Also, what happens to learners' per-topic progress when a
   published unit's topics change? (The progress code already ignores removed topics and never
   downgrades a completed unit.)
9. **Unit-level Creator** — the Unit Editor draws a per-unit Creator ("owns and maintains this unit's
   content"). Is that an `LpAuthor` relation on `LpUnit` (new), or does `LpUnit.creators` (untyped
   JSON) stay?

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

- **Markdown import is the riskiest new piece** — malformed or hostile files, silent content loss on
  re-upload (does "Replace file" wipe topic ids that learners' progress rows point to?), and the
  auto-generate scope. It gets its own tests and a dry-run preview before anything is written.
- **Scope size** — comparable to the learner rebuild. The six sub-steps keep each diff reviewable.

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
- 2026-09-24: reviewed against the Figma `Create Course View (For Admins)` page, the current schema,
  and this week's decisions. Added the missing **Unit Editor** screen (Figma + parent-plan IA),
  including `.md` content upload and Topic authoring (Sept 21 Unit → Topic). Filled in the KC and
  Module Assessment screens from their Figma frames. Added §5 (six Figma-first sub-steps) and §6
  (cross-cutting: live-content editing, upload validation, Markdown sanitization, audit log, rate
  limiting). Added Open Questions #6–#9 (import scope, Figma-vs-schema field gaps, draft vs. live,
  unit Creator) and a Markdown-import risk. Status unchanged: draft, awaiting review.
- 2026-09-24: Open Questions #2–#9 resolved with the recommended options (table at the top of the
  Open questions section). #5 and #7 were made concrete at the same time: local-disk storage behind
  an interface, plus the specific schema changes for each Figma field gap. Status: awaiting approval
  to start sub-step 1.
- 2026-09-24: plan approved; **sub-step 1 implemented** (branch `feat/lp-learner-ui-rebuild`).
  - Pure relocation of `lp-core.prisma` → `prisma-shared/lp-core-models.prisma`. LP's
    generator/datasource moved to `learning-platform/prisma/schema/schema.prisma`. Verified no-op:
    `migrate diff` shows only the 10 known DB-only student FKs. Committed alone.
  - RBAC migration `…_author_program_roles`: `LpAuthor` (email + Entra `oid`),
    `LpProgramContributor` (editor/reviewer/viewer), Instructor/Director/Owner lists, and
    `creatorAuthorId` on `LpProgram` and `LpUnit`. Student-FK drops stripped by hand; 10 constraints
    verified.
  - `learning-management/` scaffold on port 3002. Microsoft Entra ID only, with a tenant-specific
    issuer plus an explicit `tid` check, failing closed without a tenant. Its own `AUTH_SECRET`,
    `lm.*` cookie names (no collision with the learner apps' `authjs.*` on localhost), 8h sessions.
    `LpAuthor` upsert binds the Entra oid and refuses an oid mismatch.
  - Default-deny proxy plus nonce-based CSP and security headers (new here; learning-platform has
    no CSP yet — follow-up). `prisma:migrate` refuses to run.
  - Sign-in page (design-system Login layout) and the authoring shell from the Figma Programs frame,
    with the Figma logo asset. The Programs landing lists the author's programs read-only; the full
    table is sub-step 2.
  - Bootstrap script `npm run bootstrap:roles` for the first Owners/Directors; validates input and
    has not been run.
  - Verified: tsc/eslint clean, 9 tests (tenant check, cookie isolation, CSP); runtime: `/` → 307
    `/signin`, CSP nonce on every script, only `lm.*` cookies, sign-in without a tenant →
    `/signin?error=Configuration`. **Not verified:** a real Microsoft sign-in (no Entra
    credentials yet).
  - Divergence from the plan: the parent plan put Director/Owner "fields" on Settings & Access; built
    as lists per the 2026-09-17 decision already recorded here. Helpdesk tabs, notifications, search
    and the theme toggle from the Figma header are deferred to the sub-steps that give them
    something to do.
- 2026-09-24: **dev authentication decided** (Bichesq): Entra credentials only in production. For
  development, a guarded email login (`lib/dev-login.ts`, option 1 of 4 considered: dev
  Credentials login / local mock OIDC server / personal Azure tenant / reusing the learner Google
  client). Enabled only when `NODE_ENV` isn't production and `LM_DEV_LOGIN=1`, for `LM_DEV_EMAILS`
  addresses only; the app refuses to start in production if the flag is set. Dev author
  `bichesq@gmail.com` bootstrapped as Owner + Director of all four seeded programs. Verified end to
  end: listed email → session → Programs page lists 4 programs; an unlisted email, a forged cookie,
  and a token under the learner `authjs.*` cookie name are all refused. **Before production:**
  exercise the real Entra flow once (a mock OIDC server is the suggested route) — dev login skips
  the tenant check.
- 2026-09-28: **sub-step 2 implemented** (Programs, Program Setup, Settings & Access). Permission
  rules decided by Bichesq (§7).
  - Migration `…_authoring_audit_program_setup`: `LpProgram.updatedAt` + `thumbnailKey`, and
    `LpAuthoringAuditEntry`. The 10 student-FK drops were stripped by hand; the 10 constraints were
    verified afterwards. Existing programs' `updatedAt` starts at the migration time, so the list shows
    "Today" for them until they're next edited.
  - Rules live in `lib/permissions.ts` (pure) and `lib/program-access.ts` (loads the roles, 404s
    pages, refuses actions, logs denials). Server actions are in `lib/actions/`. Each one validates
    with zod, checks the capability on that `programId`, and writes its audit entry in the same
    transaction. Removing a Director runs Serializable, so the last Director can't be removed even
    by two removals at once.
  - Thumbnails: `lib/storage.ts` (local disk under `storage/media`, random UUID keys re-validated
    before any filesystem call), `lib/image-upload.ts` (magic bytes, 2 MB), and
    `GET /api/programs/[programId]/thumbnail` (role-checked). The server-action body limit is 3 MB.
  - The sidebar links Program Setup and Settings & Access to the program in the URL.
  - **Deviation from the Figma:** the Contributors table is a semantic `<table>`, not HeroUI Table.
    Inside HeroUI Table cells, pointer presses on overlay triggers (the row's role Select, Remove's
    AlertDialog) don't open them; only the keyboard does. Links in cells work, so the Programs table
    stays HeroUI Table.
  - Verified: tsc and eslint clean; 34 unit tests (20 new). A headless Edge run with four dev
    authors (Director, Editor, Viewer/Reviewer, outsider) passed all 25 checks:
    - create with PNG → thumbnail served;
    - disguised non-image rejected;
    - setup edit saved;
    - contributors added, re-roled and removed;
    - second Director added and removed; last Director protected;
    - Editor can edit but not change the Creator, manage people or create programs;
    - Viewer is read-only;
    - outsider gets 404 on the pages and thumbnail;
    - a removed contributor loses access at once;
    - the audit log has one entry per change.
    The test data was deleted afterwards.
  - **Not done / follow-ups:** rate limiting (cross-route follow-up); learners don't see authored
    thumbnails yet (`heroImage` is unchanged); "Last Updated" renders in the server's time zone.
