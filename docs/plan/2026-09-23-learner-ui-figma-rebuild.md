# Learning Platform learner UI — rebuild against `CHA Platform_4.fig`

**Date:** 2026-09-23
**Status:** Approved 2026-09-23 — all five steps implemented 2026-09-24; awaiting review

## Context

Phases 1–3 of `docs/plan/2026-09-20-learning-platform-v1-build.md` built out the learner-facing
surface (catalogue, program/module view, unit view, Knowledge Check runner, Module Assessment
runner, Readiness runner) against the data model and the `2026-09-17-learning-platform-assessment-
requirements.md` requirements extraction. That build happened without going through this project's
mandatory `build-page-from-screenshot` / `figma-to-heroui` workflow — none of the existing learner
pages import HeroUI v3 (`grep` for `@heroui/react` across `app/(learner)` turns up nothing; every
screen is hand-rolled Tailwind against the `cha-*` CSS custom-property classes) and none of them were
built by decoding the actual Figma frames from `docs/CHA Platform_4.fig` frame-by-frame — they were
built from the prose requirements extraction instead. The requirements doc itself is derived from the
same `.fig` file, so the *content* is broadly right, but layout, component choice, and visual fidelity
were never checked against the actual frames or built with HeroUI v3 components.

This plan is the "revisit and rebuild" pass: go back through the relevant Figma pages/frames in
`docs/CHA Platform_4.fig`, and rebuild each learner-facing screen against what's actually drawn,
using HeroUI v3 + the CHA design system tokens (`docs/Cloud Heroes Africa Design System/`), per
`build-page-from-screenshot`. **Video is out — treat any video-player frames as V2 reference only**,
per the standing 2026-07-06/07-16 "data-light strategy" decisions and requirements-doc §10.1.

**Skill choice, checked against the alternative:** the generic `anthropic-skills:figma-to-heroui`
skill was considered (per request) as a `.fig`-native alternative. Checked its actual instructions:
it requires either a connected Figma MCP server (not available in this environment) or a plain
PNG/PDF export/share-link as a fallback — it has no bundled `.fig`-binary decoder, and its reference
files (`references/design-system.md`, `references/heroui-conventions.md`) are generic placeholders,
not this repo's real CHA design system or the real `heroui-react` MCP. `build-page-from-screenshot`'s
own `.fig` path (Step 1, added by the `42090a3` commit) ships `decode_fig.py`, which decodes the
`.fig` Kiwi binary directly with no MCP dependency and extracts the exact original embedded media
files (images/icons, unmodified, by content hash) plus the full node/frame/text tree — and it's wired
to this repo's real tokens and the connected `heroui-react` MCP. That's the one with genuine asset
access here, so this plan keeps using it rather than switching.

**Sept 21 unit-view decisions, verified against current code, not just the decision log:**
- **Remove the duplicate "Lesson Script" panel** — `decision-log.md` (2026-09-21, Team/Kris/Bichesq/
  Flora): the right-hand panel duplicated the middle reading-content panel, a leftover from the
  video-based design. Checked `RightPanel.tsx` directly: **this has not been implemented yet** — it
  still renders a `"script"` tab (`ScriptTab`, label "Lesson Script") that re-renders the same
  `contentBlocks` already shown in the main `ReadingView` panel via `blocksToScript`. This rebuild
  removes that tab.
- **Topic sub-layer (Unit → Topic)** — `decision-log.md` (2026-09-21, Team/Kris/Elvis/Herman/
  Harriet): a Unit's content breaks into ~6–12 Topics instead of one long scroll. Checked the schema
  and frontend directly: `LpTopic` and `LpUnit.topics` already exist in
  `prisma/schema/lp-core.prisma`, but `UnitShell.tsx`/`ReadingView.tsx` still have zero topic-aware
  logic — both carry an explicit `2026-08-11: Section/Item are gone` comment treating a unit's
  `contentBlocks` as one flat reading with no sub-structure, which predates and is now superseded by
  the Sept 21 Topics decision. This rebuild wires in Topic-aware navigation (see Open Question #1 for
  the one remaining unresolved detail: which navigation mechanism).

## Goal

Every learner-facing screen in `learning-platform/app/(learner)/` matches its corresponding Figma
frame(s) in layout and component choice (built with real HeroUI v3 components, not hand-rolled
Tailwind), while preserving every standing V1 decision that already overrides the raw Figma drawing
(no video, no Notes-as-drawn, no Section as a schema level, data-light TTS, etc.) and without
changing the underlying data contracts (API routes, Prisma models, server-side gating logic) that
Phases 1–3 already built and verified — this is a UI-layer rebuild, not a re-architecture.

## Scope

**In scope for this pass** — rebuild these existing learner pages against their Figma source:

| # | Figma page (from `2026-09-17` requirements doc) | Current implementation |
|---|---|---|
| 1 | Learning Platform (Program Catalogue View) | `catalog/page.tsx`, `catalog/components/CatalogClient.tsx` |
| 2 | Learning Platform (Program+Module View) — Active/Rest states | `programs/[programId]/page.tsx`, `.../components/ProgramOverview.tsx` |
| 3 | Learning Platform (Module Content View) — rollup stats, section/unit list | Not built as a distinct screen today — currently folded into ProgramOverview with no completion-rate/quiz-count/enrollment/review rollups |
| 4 | Learning Platform (Unit View) — **reading-unit frames only**, video frames excluded | `units/[unitId]/page.tsx`, `UnitShell.tsx`, `ReadingView.tsx`, `RightPanel.tsx`, `UnitRail.tsx`, `TtsControlBar.tsx`, `BlockRenderer.tsx`, `KnowledgeCheckRunner.tsx`, `ProgressFooter.tsx` |
| 5 | Learning Platform (Assessment View) — all 12 frames (pre-assessment → in-progress → submit → results → issue reporting) | `assessments/[assessmentId]/page.tsx`, `AssessmentRunner.tsx`, `QuestionPalette.tsx` |
| — | Readiness assessment (no distinct Figma page; reuses Assessment View styling per existing build) | `readiness/[assessmentId]/page.tsx`, `ReadinessRunner.tsx` |

For each: decode the actual frame(s) from `docs/CHA Platform_4.fig` (per `build-page-from-screenshot`
/ `figma-to-heroui`'s .fig-extraction workflow), cross-check against `docs/Cloud Heroes Africa Design
System/` tokens, query `heroui-react` MCP tools for the right v3 components, then rebuild the
page/component tree. Existing props/data-fetching contracts (server components, API calls, Prisma
queries) are reused as-is unless a frame requires data the current contract doesn't expose (flagged
per-page as it's found, not pre-guessed here).

**Explicitly out of scope for this pass:**
- Video unit type, player, playback-speed control, narrator/language selector, `Transcript` tab —
  **V2**, per the 2026-07-06/07-16 decisions and requirements §10.1. Any video frames in the Unit
  View page are reference-only, not a build target.
- `Notes` tab as drawn — already descoped (2026-09-07 decision, requirements §10.2); not resurrected
  here.
- Any *new* backend functionality, schema changes, or API contract changes — if a frame turns out to
  need one (see Open Questions #1 on `LpTopic` navigation below), that's flagged for a separate
  decision, not built inline as part of this UI pass.
- The admin/authoring app (`learning-management/`, Phase 4 of the parent plan) — untouched here.
- Program-level bypass (§10.4), badges (§10.5), the notification event (Phase 5) — untouched.
- Catalogue/Dashboard/Notifications/Profile screens that live in `student-hub`, not
  `learning-platform` — out of this app's scope entirely.

## Approach

Sequenced by the same learner-journey priority Phases 1–3 used (catalogue → program/module →
unit → assessment), so the highest-traffic screens get fixed first and each page rebuild can be
reviewed/shipped independently rather than as one giant diff.

1. **Program Catalogue** (`catalog/`) — decode the Catalogue frame(s), rebuild the program grid,
   search/filter bar, category tabs, and the four enrollment-state card variants
   (Enroll Now / Resume / Completed / Locked) with HeroUI v3 components. Global nav (`TopBar.tsx`)
   rebuilt once here since it's shared across every learner screen.
2. **Program/Module view + Module Content View** — reconcile #2 and #3 from the table above into
   whatever the Figma frames actually show as one flow or two; rebuild the module accordion, unit
   rows, instructor card, and (new, currently missing) the rollup stats block (completion %, quiz
   count, completion rate, duration, enrollment/review counts — reviews display only, no rating UI
   per §10.10) and section-style grouping within a module's unit list (display-only per the
   Program→Module→Unit hierarchy decision, not a new schema level).
3. **Unit View (reading path only)** — rebuild the left rail, breadcrumb, progress bar/section
   counter, reading content panel, TTS control bar, and inline Knowledge Check against the actual
   reading-unit frames; explicitly do not build the video-player chrome. Two Sept 21 decisions are
   mandatory parts of this step, not optional cleanup: (a) drop `RightPanel.tsx`'s duplicate
   "Lesson Script" tab, and (b) add Topic-aware navigation (`LpTopic`/`LpUnit.topics`) so a unit's
   content is browsed as ~6–12 topics instead of one long scroll — mechanism per Open Question #1.
4. **Assessment flow** — rebuild all five stages (pre-assessment, in-progress runner + question
   palette, submission/review, results, question-issue-reporting) against the 12 Assessment View
   frames. Reuse the existing attempt/grading API contracts (`app/api/assessments/**`,
   `assessment-engine.ts`) unchanged — this step is presentation-layer only.
5. **Readiness runner** — apply the same rebuilt Assessment-flow components/patterns from step 4
   (Readiness has no distinct Figma frames of its own; it's already built to mirror the Assessment
   View's styling, so bring it along using whatever HeroUI v3 patterns step 4 establishes rather than
   re-deriving it from scratch).

Each step: invoke `build-page-from-screenshot` (which itself mandates reading the design-system
tokens and querying `heroui-react` MCP docs before writing component code), present the rebuilt
page for a quick look, then move to the next step. Given the size, treat steps 1–5 as five
separate implementation passes rather than one — this plan doc stays until all five are done, then
gets deleted per your standing instruction once the whole pass is approved-and-implemented.

### Step 3 addendum — Topic navigation needs a (small, additive) schema change

Found while starting step 3 (2026-09-23): `LpTopic` today is `{ id, name, unitId }` only — it exists
as the weak-topic tag on assessment question-bank items (`standalone-assessments.ts`,
`assessment-engine.ts`), with **no ordering and no link to content**. `LpContentBlock` is
`{ unitId, order, type, payload }`, so there is nothing that says which blocks belong to which
topic. Topic routes can't be built on the current schema. Proposed:

- **Schema (additive migration, nullable):** `LpTopic.order Int?`, `LpTopic.description String
  @default("")`; `LpContentBlock.topicId String? @db.Uuid` → `LpTopic` (`onDelete: SetNull`),
  index `(unitId, order)` on topics. Same `LpTopic` row keeps doubling as the assessment weak-topic
  tag — one concept, not two.
- **Fallback:** a unit with no ordered topics (all current seed data) renders exactly as today — one
  flat reading. No data backfill required.
- **Routes:** `units/[unitId]/page.tsx` redirects to the first topic when topics exist;
  `units/[unitId]/topics/[topicId]/page.tsx` runs the same enrollment / token / module gates as the
  unit page, and additionally rejects any `topicId` whose `unitId` ≠ the URL's `unitId` (IDOR, per
  SECURITY.md §3). Previous/Next move between topics; Next on the last topic goes to the unit's KC.
- **Progress:** stays unit-level — finishing the last topic triggers the existing `POST
  /api/progress` completion call, unchanged. No per-topic progress rows in V1.
- **Figma "Section N" groups in the rail** stay display-only per the hierarchy decision (not built
  as a schema level) — the rail lists the unit's topics, then its Knowledge Check.

## Files / modules affected

- `learning-platform/app/(learner)/components/TopBar.tsx` — rebuilt (shared nav)
- `learning-platform/app/(learner)/catalog/**` — rebuilt
- `learning-platform/app/(learner)/programs/[programId]/page.tsx`,
  `.../components/ProgramOverview.tsx` — rebuilt, extended with rollup-stats block
- `learning-platform/app/(learner)/programs/[programId]/units/[unitId]/**` — rebuilt (reading path
  only)
- `learning-platform/app/(learner)/programs/[programId]/assessments/[assessmentId]/**` — rebuilt
- `learning-platform/app/(learner)/programs/[programId]/readiness/[assessmentId]/**` — rebuilt
- No changes expected to `lib/`, `app/api/**`, or `prisma/schema/**` unless Open Question #1
  resolves toward building Topic navigation now rather than deferring it.

## Open questions / assumptions

1. ~~Topic navigation mechanism~~ — **Resolved 2026-09-23**: separate topic views/routes
   (`units/[unitId]/topics/[topicId]/`, one level deeper than the existing per-unit page pattern),
   with Previous/Next between topics — not a single scrollable page with an anchor/jump list.
2. **Program/Module view vs. Module Content View (table rows #2/#3) may be one screen or two in the
   actual `.fig` frames** — the 2026-09-17 requirements doc treated them as separate Figma pages, but
   the currently-built app has them as one (`ProgramOverview.tsx` inside `programs/[programId]/
   page.tsx`). Step 2 will decode the actual frames to settle this, but flagging now in case you
   already know the answer and want to shortcut that.
3. **Readiness runner has no dedicated Figma frames** — assumption in step 5 is that it should reuse
   whatever HeroUI v3 patterns the Assessment flow rebuild (step 4) establishes, matching how it was
   already built. Flag if Readiness should instead look visually distinct.

## Risks / things that could go wrong

- **Scope size** — five learner-facing screens plus shared nav is a large rebuild; sequencing as five
  independent passes (see Approach) keeps any one diff reviewable and lets you redirect mid-way
  without a half-rebuilt page in an inconsistent state.
- **Data-contract drift risk is low but not zero** — if a Figma frame shows data the current API/props
  don't expose (e.g., review counts, enrollment counts for the Module Content View rollup in step 2),
  that's a real (small) backend addition, not just a UI change. Each step flags this if/when found
  rather than assuming zero backend touch upfront.
- **Regression risk on already-verified server-side gating logic** (module locks, KC start→submit
  snapshot pinning, attempt idempotency) if the UI rebuild accidentally changes request shapes to
  those API routes. Mitigation: steps 3–5 explicitly reuse existing API contracts unchanged; any
  request-shape change gets called out and tested, not silently introduced.

## Out of scope (explicitly deferred)

- Video unit type/player (V2).
- Notes tab as drawn (descoped, no committed replacement yet).
- Any admin/authoring app work (Phase 4 of the parent plan).
- Program bypass, badges, notification event (Phase 5 of the parent plan).
- New backend/schema work, unless Open Question #1 changes that.

---

## Revision log

- 2026-09-23: initial draft.
- 2026-09-23: reviewed with Bichesq. Skill choice confirmed (`build-page-from-screenshot`'s own
  `.fig` decoder over the generic `figma-to-heroui` skill, which lacks real asset access in this
  environment). Sept 21 unit-view decisions (drop duplicate Lesson Script panel, add Topic
  navigation) verified as not-yet-implemented and made mandatory parts of step 3. Open Question #1
  resolved: Topic navigation ships as separate topic routes (`units/[unitId]/topics/[topicId]/`),
  not an anchor/jump list. Plan approved; proceeding step 1 (Program Catalogue) first.
- 2026-09-23: steps 1–2 implemented (catalogue, TopBar, program view, new ModuleContentView;
  typecheck clean). Step 3 paused: added the "Step 3 addendum" — Topic routes need an additive
  schema change (`LpTopic.order`, `LpContentBlock.topicId`) the original plan assumed away. Awaiting
  approval.
- 2026-09-24: addendum approved; step 3 implemented. Migration `20260923194902_unit_topic_navigation`
  (student FK drops stripped by hand, same as the 09-21 migrations); `topics/[topicId]` route +
  shared `load-unit.ts` gates; rail/reading/TTS/KC/progress on HeroUI v3; Lesson Script tab removed.
  Typecheck, lint, 35 tests pass; routes compile and auth-gate. Browser visual check still pending
  (needs a signed-in session). Next: step 4 (Assessment flow).
- 2026-09-24: step 4 implemented. AssessmentRunner reduced to state + the same four API calls
  (URLs/bodies unchanged); screens split into stage components (AssessmentHeader, PreAssessment,
  QuestionStage, QuestionPalette, SubmitReviewModal, ResultsStage, FeedbackStage, ReportingStage)
  on HeroUI v3, matching the 12 Assessment View frames. Flow changes per Figma: submit review is a
  modal over the last question; Reported Question Feedback follows submit when reports are pending;
  detailed feedback is its own screen. Typecheck, lint, 35 tests pass; route compiles/auth-gates.
  Not visually verified — dev DB has no standalone assessments seeded. Next: step 5 (Readiness).
- 2026-09-24: test module assessment seeded in dev DB (`test-lp-m1-assessment`, 24-item bank, 20
  per attempt; scratchpad seed/cleanup SQL).
- 2026-09-24: step 5 implemented. ReadinessRunner rebuilt from the step-4 components
  (AssessmentHeader gains a `kind` label; QuestionStage's flag/report controls became optional).
  Navigation is now free (Previous + palette) with local-only flags; submit call unchanged. Also
  fixed: readiness page no longer ships `correctOptionId`/`explanation` to the client (server grades
  from its own config). Typecheck, lint, 35 tests pass; route compiles/auth-gates. No readiness
  assessment seeded in dev, so not visually verified. **All five steps implemented — plan doc to be
  deleted once the rebuild is reviewed and approved.**
- 2026-09-24: Sept 21 review follow-ups (Kris), checked against the Figma reading frames first.
  (a) TTS/topic controls row made sticky at the top of the reading card. Figma's own answer was
  image + controls fixed with only a side text column scrolling (Kris's "option 2"), but the team
  chose option 1 (single scrolling reading, no script panel), so the controls pin instead.
  (b) TopBar hides on unit/topic routes ("learning mode"). Every Figma unit frame shows the full
  header, so this is a deliberate departure; the breadcrumb Home brings it back.
  (c) The Figma topic illustration (`e74b00c1…`, "Understanding Cloud Computing Basics") is now
  `public/figma-assets/unit-cloud-basics-illustration.jpg` and is `lp-m1-u1`'s hero, in both
  `data/lp-programs.json` and the dev DB. Per-topic progress is split out to
  `2026-09-24-per-topic-unit-progress.md` (awaiting approval).
