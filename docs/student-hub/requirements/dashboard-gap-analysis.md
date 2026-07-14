# Dashboard — Gap Analysis vs `dashboard.md`

**Scope:** Current `/dashboard` implementation in `student-hub/` vs. `docs/requirements/dashboard.md` (Student Hub – Dashboard, Primary View) and the approved visual reference `student-hub/docs/references/Dashboard View Primary 2.png`.
**Analysis date:** 2026-07-09 · **Implemented:** 2026-07-09

> **Status: implemented.** All 9 phases below were executed: curriculum/enrollment data
> model, My Program page with simulated unit completion, the real resume banner, the
> approved-design 2-column grid (Recent Enrolled Program + To Do List | Your Progress +
> Activity Streak), a shared events store with a functional calendar widget, the Activity
> Streak widget, per-widget loading/error states, and a final verification pass (45
> logic-assertion test script, production build, full-project lint, route-auth smoke
> tests). The analysis and plan below are kept as the historical record; see the summary
> message for what shipped and what remains manual-test-only (no live Google login in
> this environment).

---

## Part A — What Exists Today

The dashboard is implemented with polished CHA styling, but **it does not match the approved design mock** — it appears to have been built against an earlier or different draft. Side-by-side with `Dashboard View Primary 2.png`:

| Approved design | Current code | Match? |
|---|---|---|
| Resume banner (orange, "Resume Where You Left Off", white progress panel) | `ResumeCard.tsx` | ✅ shape matches (data is mock) |
| Two-column grid: **Recent Enrolled Program** card + **To Do List** (left) / **Your Progress** + **Activity Streak** (right) | `LearningPath.tsx` renders tabs ("Self Paced Learning" / "Your Courses") + `NewCourseCard.tsx` ("Kubernetes Foundations" ocean promo) + `LessonsSection.tsx`/`LessonRow.tsx` (4 tabs, Jenkins/Docker lesson rows with instructor) | ❌ **no correspondence** — this entire block doesn't exist in the design or in `dashboard.md` |
| Your Progress inside the left 2-column grid | Rendered instead in the **right rail**, above the calendar | ❌ wrong location, and no Recent Enrolled Program / To Do List / Activity Streak exist anywhere |
| Calendar widget alone in the right rail | `CalendarWidget.tsx` in the right rail | ✅ shape matches (nav/filters non-functional, see below) |
| Sidebar main menu: Dashboard, **My Program**, Calendar, Analytics | `Sidebar.tsx`: Dashboard, **Courses**, **Assessments**, Calendar, Analytics | ❌ wrong items — no "My Program"; "Courses"/"Assessments" aren't in the design |
| Sidebar account section: Notes, Helpdesk, My Profile | Same | ✅ matches |
| Top bar tabs: Dashboard, Explore Programs | Same | ✅ matches (Explore Programs page itself doesn't exist yet) |

**Confirmed with the user (2026-07-09): the tabs/New Course card/Lessons section are to be removed and replaced with the real design layout — see Decisions.**

Architecture (files), for reference:

| Piece | File | What it does today |
|---|---|---|
| Route (server) | `student-hub/app/(student)/dashboard/page.tsx` | Auth check, loads the real student for greeting + track line, renders all widgets from mock data |
| Profile gate | `.../dashboard/components/ProfileGate.tsx` | Real — soft completion gate driven by `profileCompletedAt` |
| To be removed | `LearningPath.tsx`, `ResumeCard.tsx` (keep, restyle), `NewCourseCard.tsx`, `LessonsSection.tsx`, `LessonRow.tsx` | Tabs/promo/lessons content not in the approved design |
| Progress (to relocate) | `.../components/ProgressWidget.tsx` | Bars UI is reusable; needs to move into the left grid and read real data |
| Calendar | `.../components/CalendarWidget.tsx` | Visual shape matches design; not wired to real dates/events |
| Mock data | `.../dashboard/data/mock.ts` | Backs every widget; most of it will be deleted with the removed components |
| Shell | `app/(student)/layout.tsx`, `Sidebar.tsx`, `TopBar.tsx` | Hard-coded name/level/track/avatar for every student; sidebar menu doesn't match the design |
| Auth | `lib/auth.config.ts`, `proxy.ts` | Middleware guards `/dashboard`; returning students land on `/dashboard`, first-ever login on `/profile` |

**Additional issues found while reading the code (independent of the layout mismatch):**

1. **Greeting bug (affects the real user today):** `student?.displayName ?? session.user.given_name` — `displayName` is `""` in `students.json`, and `??` doesn't treat `""` as missing, so the page renders "Welcome back,  👋" with no name. There's also no field anywhere to set a preferred display name.
2. **Sidebar/TopBar identity is hard-coded:** `layout.tsx` passes literal `level="Student | Intermediate"` and `track="DevOps Engineer Track"` for every student, and never uses the avatar uploaded on the profile page (`student.avatarUrl`) — only the Google session image.
3. **No curriculum/progress data model exists anywhere** — no programs, modules, units, enrollments, or unit completions. Nothing for resume logic, module progress, or a streak to compute from.
4. **Calendar widget is visually right but functionally frozen:** grid cells are hard-coded to a June 2026 design snapshot; month nav changes only the label; "today" is a hard-coded flag on the 24th; the time chip is the literal string "10 : 30 AM WAT"; the "Live" badge comes from a mock boolean, not the clock.
5. **Dead navigation targets:** `/analytics`, `/notes`, `/settings` (sidebar), `/explore` (top bar) all 404. "My Program" doesn't exist under any name yet.
6. **Two unrelated calendar mocks:** the dashboard widget and the full `/calendar` page each have their own mock event data with different shapes — no shared events store.

---

## Part B — Requirement-by-Requirement Status

Legend: ✅ Done · ⚠️ Partial · ❌ Missing

### 1. Page-Level Behaviours

| Requirement | Status | Detail |
|---|---|---|
| Route `/dashboard`, approved students only | ✅ | Middleware guards the route; whitelist enforced at Google sign-in |
| Default landing after auth | ✅ | Sign-in uses `callbackUrl: "/dashboard"`; first-ever login intentionally detours to `/profile` |
| Skeletons for every widget on load | ❌ | No `dashboard/loading.tsx` (the profile page already has this pattern to copy) |
| Per-widget error state with Retry; other widgets still render | ❌ | No error boundaries; no per-widget data fetching exists yet that could fail independently |

### 2. "Welcome Back / Resume Where You Left Off" Banner

| Requirement | Status | Detail |
|---|---|---|
| Greeting with preferred display name | ⚠️ | Real name is used, but the `"" ?? fallback` bug blanks it; no field exists to set a preferred name |
| Track banner (e.g. "DevOps Track Lv1") | ⚠️ | Header line uses real `student.track`; the Resume card's own chip is mock |
| CTA "Resume Where You Left Off →" | ⚠️ | Rendered, matches the design, but is a static div — no link/handler |
| Progress % / current module / focus description | ❌ | All mock (`60%`, "Module 1: DevOps Foundations") for every student |
| Canonical next-unit logic (first incomplete unit, curriculum order, module rollover) | ❌ | No curriculum or completion data exists |
| Track-complete banner variant | ❌ | — |
| No-track "Get started" banner → Explore Programs | ❌ | No empty state; `/explore` itself 404s |
| Next-unit recalculated each load | ❌ | — |

### 3. Recent Enrolled Program Card

| Requirement | Status | Detail |
|---|---|---|
| Single active program, title + progress bar + `<completed>/<total> Modules Completed` | ❌ | **Doesn't exist.** The design shows a small utility card ("Cloud Practitioner", thin orange bar, "4/8 Modules Completed"); current code has an unrelated ocean promo card in a different location |
| Click → "My Program" page | ❌ | Neither the card nor the page exists yet |
| Empty state → Explore Programs | ❌ | — |

### 4. Your Progress (Module-Level)

| Requirement | Status | Detail |
|---|---|---|
| Modules of the active program with % + bar, in the left 2-column grid | ⚠️ | `ProgressWidget.tsx` renders exactly this shape but currently sits in the **right rail** with 3 hard-coded mock rows |
| Data from `completedUnits / totalUnits` per module | ❌ | No unit/completion model |
| Click module row → module detail in My Program | ❌ | Rows aren't interactive; no target page |
| Top-N + "View all modules" for long lists | ❌ | — |

### 5. To Do List

| Requirement | Status | Detail |
|---|---|---|
| Entire widget (checkbox list, title + date, strikethrough when complete) | ❌ | **Does not exist in code**, but **is** in the approved design — a card in the left grid below Recent Enrolled Program |
| Student tasks: add/edit/complete/delete | ❌ | — |
| System tasks: complete, non-deletable, dismiss-with-reason, limited edit | ❌ | — |
| Overdue-first ordering, completed section faded/collapsed | ❌ | — |
| Task links to units/modules/events | ❌ | — |

### 6. Activity Streak

| Requirement | Status | Detail |
|---|---|---|
| Entire widget (Mo–Su row + "N days" summary) | ❌ | **Does not exist in code**, but **is** in the approved design — weekday row of lightning-bolt icons (filled orange = active, outlined = inactive/future), "12 days" caption, small prev/next arrows |
| Activity = completing a unit; consecutive-day count; reset semantics | ❌ | Nothing records unit completions yet |
| Timezone-aware calculation (profile timezone) | ❌ | `student.timezone` now persists (from the profile work) but nothing consumes it |
| Click → streak history / activity log | ⚠️ | Design shows small nav arrows (likely prev/next week) rather than a full history view — clarify scope in Phase 7 |

### 7. Calendar & Events

| Requirement | Status | Detail |
|---|---|---|
| Month view with event indicators | ⚠️ | Grid renders per the design but is a hard-coded June 2026 snapshot, not generated from the real date |
| Month navigation | ⚠️ | Prev/next buttons change the month *label* only — the day grid never changes |
| "Upcoming Today / Tomorrow / Next Week" filters | ⚠️ | Chips render and toggle, but nothing changes as a result |
| "Today / Week / Month" view toggles | ⚠️ | Tabs render and toggle, but the view never changes |
| Event list (learning + beyond-learning) | ⚠️ | The design shows filter chips feeding a **single** live/next-event card, not a scrollable list — `dashboard.md` describes a list. Reconcile in Phase 6 (recommend: show the single most relevant event per filter, matching the visual; a fuller list belongs on the dedicated `/calendar` page which already has one) |
| Event model (type, title, description, start/end + timezone, link) | ❌ | No events store; dashboard and `/calendar` each use unrelated mock shapes |
| Live card: "Live" badge when now ∈ [start, end], Join/Open CTA, click-through | ❌ | Badge from a mock `live: true` flag; no real times, no CTA, not clickable |
| Times in student timezone | ❌ | Hard-coded "WAT" strings; `student.timezone` unused |

### 8. Sidebar / Navigation Context

| Requirement | Status | Detail |
|---|---|---|
| Main menu: Dashboard, My Program, Calendar, Analytics | ❌ | Has Dashboard ✅, Calendar ✅, Analytics (link 404s) — but "Courses" + "Assessments" instead of "My Program" (both 404, and don't belong per the design) |
| Account: Notes, Helpdesk, My Profile | ✅ | Helpdesk → `/support` exists; My Profile exists; Notes still 404s but the menu item itself is correct |
| Bottom: Settings, Log out | ⚠️ | Log out ✅ works; Settings 404s |
| Dashboard remains default landing | ✅ | — |

### 9. Non-Functional & Cross-Cutting

| Requirement | Status | Detail |
|---|---|---|
| Only the logged-in student sees/modifies own data | ✅ | Server resolves the student from the session; no cross-student access paths |
| Audit To Do changes | ❌ | No To Do feature yet (audit infra from the profile work is ready to reuse) |
| Track unit-completion timestamps | ❌ | No completion tracking |
| Track event attendance/join actions | ❌ | — |
| All dates/times in the student's timezone/locale | ❌ | Hard-coded WAT/June-2026 strings |

### Data-Layer Gaps (root cause of most ❌ above)

Missing entirely: **curriculum** (programs → modules → units with ordering and types), **enrollment** (`activeProgramId`), **unit completions** (the single event that powers resume logic, module %, and the streak), **tasks** (student + system), and a **shared events store**. Until these exist, the real widgets can only display mock data. The profile remediation established the pattern to follow: typed models + JSON file stores + validated API routes + audit logging.

---

## Part C — Summary of What Has NOT Been Done

**Broken/misleading (fix first):**
1. Greeting renders a blank name when `displayName` is an empty string; no way to set a preferred name.
2. Sidebar/TopBar show a hard-coded level/track for every student and ignore the uploaded profile avatar.
3. Sidebar main menu has the wrong items ("Courses"/"Assessments" instead of "My Program").
4. The main dashboard area shows content (tab switcher, New Course promo, Lessons list) that isn't in the approved design or requirements at all.
5. Calendar month navigation, period chips, and view toggles look interactive but do nothing.
6. Four navigation targets 404 (`/analytics`, `/notes`, `/settings`, `/explore`).

**Missing foundations:**
7. Curriculum data model (programs/modules/units) + enrollment (`activeProgramId`).
8. Unit-completion tracking (powers resume, progress, and streak) — simulated for now via a "Mark complete" action, isolated so it can be swapped for a real LMS integration later.
9. A "My Program" page (CTA target for resume, program card, and progress rows).
10. Shared events store with typed events (learning/community, start/end, timezone, link).

**Missing widgets/behaviours:**
11. Recent Enrolled Program card (real one, per the design — not the current New Course promo).
12. Your Progress — move into the left grid, wire to real module data.
13. To Do List — entire feature (widget, model, API, audit).
14. Activity Streak — entire feature (widget, timezone-aware computation).
15. Real resume logic: progress %, current module, canonical next unit, completion + no-track states.
16. Real, date-driven calendar: generated grid, working nav/filters/toggles, live-event time-window detection, join CTA.
17. Dashboard skeletons (`loading.tsx`) and per-widget error states with Retry.
18. Timezone-aware rendering of all dashboard times.
19. Audit logging for To Do changes, unit completions, event joins.

---

## Part D — Execution Plan

Same playbook as the profile remediation: extend the typed data model + JSON stores, add validated API routes, derive real values in unit-testable `lib/` utilities, match the approved design pixel-for-pixel where shown, and reuse the existing audit/skeleton/error patterns.

### Phase 1 — Foundation: data model, identity fixes, navigation cleanup
*Files: `types/index.ts`, new `data/programs.json`, new `data/progress.json`, new `lib/curriculum.ts`, `lib/mock-api.ts`, `layout.tsx`, `Sidebar.tsx`, `dashboard/page.tsx`*

1. Types: `Program { id, title, modules: Module[] }`, `Module { id, title, order, units: Unit[] }`, `Unit { id, title, type: "lesson"|"lab"|"assessment", order, durationMin }`; `UnitCompletion { studentId, unitId, completedAt }`.
2. Seed `data/programs.json` with a real "Cloud Practitioner" program (matching the design's card) containing a few modules/units (reusing the design's "What Is the Cloud?", "Global Cloud Infrastructure", "Virtual Networks" as module names).
3. Student gains `activeProgramId?: string` (normalized default; seed the existing record). Completions live in `data/progress.json`.
4. `lib/curriculum.ts`: `getProgram()`, `moduleStats()` (completedUnits/totalUnits → %), `programStats()` (overall % + modules completed), `nextIncompleteUnit()` (curriculum order; rolls to the next module; `null` when the track is complete). Recalculated on every load by construction.
5. Fix the greeting: `displayName || given_name` (empty-string safe).
6. `layout.tsx`: load the student and pass real name/track/avatar (uploaded `avatarUrl` preferred over the Google session image) to `Sidebar`/`TopBar`.
7. `Sidebar.tsx`: replace "Courses" + "Assessments" with a single **My Program** item (points to Phase 2's page). Add minimal "coming soon" stub pages for `/analytics`, `/notes`, `/settings`, and `/explore` so no nav item 404s.
8. Add an optional **Display Name** field to the profile form/schema/API (small addition, reuses the existing zod schema and `POST /api/profile` pattern from the profile work).

### Phase 2 — My Program page (real navigation target + completion source)
*Files: new `app/(student)/my-program/page.tsx` + components, new `app/api/progress/route.ts`, `proxy.ts`*

9. `/my-program`: active program header, module list with per-module progress, expandable unit list with status, and a **"Mark complete"** action per unit → `POST /api/progress` (zod-validated, session-scoped, audit-logged with timestamp). Deep-linkable module anchors (`/my-program#module-<id>`).
10. This is the **temporary, simulated activity source** until a real LMS exists — confirmed with the user (2026-07-09). Keep it strictly behind `lib/curriculum.ts` and this one API route so that swapping in a real LMS integration later only touches this boundary; nothing downstream (resume banner, progress widget, streak) should know the difference.
11. Guard `/my-program` in `proxy.ts` alongside `/dashboard` and `/profile`.

### Phase 3 — Resume banner wired to real data
*Files: `dashboard/page.tsx`, `ResumeCard.tsx`*

12. Resume card reads `programStats()` + `nextIncompleteUnit()`: real track chip, real %, real "Module N: {title}" and focus description; the whole card links to the next incomplete unit on `/my-program`.
13. Track-complete variant (completion copy, CTA → `/my-program` recap) and no-active-program variant ("Get started" → `/explore`).

### Phase 4 — Replace the mismatched content with the real 2-column grid
*Files: delete `LearningPath.tsx`, `NewCourseCard.tsx`, `LessonsSection.tsx`, `LessonRow.tsx`; trim `dashboard/data/mock.ts`; new `RecentProgramCard.tsx`, new `TodoList.tsx` (Phase 5), relocate `ProgressWidget.tsx`, new `StreakWidget.tsx` (Phase 7); `dashboard/page.tsx`*

14. Remove the tab switcher, New Course promo, and Lessons section — confirmed with the user as not part of the approved design or requirements.
15. Build the left-column 2×2 grid from the design: **Recent Enrolled Program** (small utility card — title, thin progress bar, "X/Y Modules Completed", clickable → `/my-program`; empty state encourages enrollment via `/explore`) + **To Do List** below it; **Your Progress** (moved out of the right rail, wired to real `moduleStats()`, capped at 4 rows + "View all modules →" → `/my-program`) + **Activity Streak** below it. Right rail keeps only the Calendar widget.

### Phase 5 — To Do List
*Files: new `data/todos.json`, new `app/api/todos/route.ts`, new `dashboard/components/TodoList.tsx`, `types/index.ts`, `lib/audit.ts` reuse*

16. `Todo { id, studentId, title, dueDate?, link?, source: "student"|"system", completedAt: string|null, dismissed?: { at, reason }, createdAt, updatedAt }`.
17. `/api/todos`: zod-validated CRUD, session-scoped. Policy per the requirement's recommendation: system tasks cannot be deleted, can be dismissed with a reason and have their due date adjusted; student tasks are fully editable. All mutations audit-logged (`todo.create/update/complete/delete/dismiss`).
18. Widget matches the design's checkbox-list look: title + weekday date subtext, strikethrough + filled checkbox when complete, overdue tasks sorted first with an accent. Seed 1–2 system tasks so the state is demonstrable.

### Phase 6 — Events store + functional calendar widget
*Files: new `data/events.json`, new `lib/events.ts`, `CalendarWidget.tsx`, `dashboard/page.tsx`*

19. `CalendarEvent { id, type: "learning"|"community"|"other", title, description, start, end, timezone, link }`; seed with a few classes plus a couple of community events. (Migrating the full `/calendar` page to this same store is a separate follow-up task, tracked but out of this plan's scope.)
20. Rebuild the widget's data flow: grid generated from the real current month in the **student's timezone** (real "today" highlight); prev/next actually move the grid; event dots derived from the store; the time chip shows the live clock in the student's timezone.
21. Period chips ("Upcoming Today"/"Tomorrow"/"Next Week") select which event is shown in the card — matching the design's single-event-card look rather than inventing a list the visual doesn't show.
22. Live event card: derived from `now ∈ [start, end]` (Live badge + Join CTA opening `event.link`); otherwise shows the next upcoming session. Join clicks are audit-logged (`event.join`) for analytics. Today/Week/Month toggle switches the grid between a single-day, week-strip, and month view.

### Phase 7 — Activity Streak
*Files: new `lib/streak.ts`, new `dashboard/components/StreakWidget.tsx`*

23. `lib/streak.ts`: given completions + the student's timezone — day-bucket completions, mark active weekdays for the current Mo–Su week, count consecutive active days ending today (0 after a gap). Pure and unit-testable.
24. Widget matches the design: weekday row of lightning-bolt icons (filled orange = active day, outlined = inactive/future), "N days" caption with icon, small prev/next-week arrows (confirmed scope: week navigation, not a full history modal).

### Phase 8 — Loading & error states
*Files: new `dashboard/loading.tsx`, new `dashboard/components/WidgetBoundary.tsx`*

25. `loading.tsx`: HeroUI Skeletons mirroring the real layout (banner, program card, todo, progress, streak, calendar) — same pattern as `profile/loading.tsx`.
26. Localized widget failures: each widget wrapped in a small client error boundary showing "Couldn't load — Retry" (`router.refresh()`); the rest of the dashboard still renders.

### Phase 9 — Cross-cutting & verification
27. Sweep: every dashboard-rendered date/time goes through the student-timezone formatters.
28. Logic tests (tsx script, same style as the profile verification): `nextIncompleteUnit` ordering/rollover/completion, `moduleStats`/`programStats`, streak day-bucketing + timezone + reset, todo ordering, event window/live detection.
29. `npm run build`, lint on touched files, dev-server manual checklist (resume CTA, mark-complete → progress + streak update, todo CRUD + audit entries, calendar nav/filters, live-card window, skeletons, widget retry, My Program navigation, all sidebar/topbar links).

**Suggested review checkpoints:** after Phase 2 (data model + My Program working end-to-end), after Phase 5, and after Phase 8.

---

## Part E — Decisions (confirmed by user, 2026-07-09)

1. **Recent Enrolled Program card** replaces the "New Course" promo, matching the approved design's small utility-card style (not the ocean hero-promo style).
2. **Remove and replace**: the "Self Paced Learning / Your Courses" tab switcher, `NewCourseCard`, and the Lessons section are deleted — none appear in the approved design or in `dashboard.md`. Replaced by the real 2-column grid (Recent Enrolled Program + To Do List | Your Progress + Activity Streak).
3. **Sidebar navigation**: "Courses" + "Assessments" replaced by a single real **My Program** item; lightweight "coming soon" stubs added for `/analytics`, `/notes`, `/settings`, `/explore` so nothing 404s.
4. **Events store**: dashboard reads a new shared `data/events.json` now; migrating the full `/calendar` page to the same store is a separate follow-up task.
5. **Display name**: add an optional "Display Name" field to the profile form now (small addition to the existing schema/API), fixing both the blank-greeting bug and the "preferred name" requirement.
6. **Completion source**: a real LMS will be built later. Until then, unit completions are simulated via a "Mark complete" action on `/my-program`, deliberately isolated behind `lib/curriculum.ts` + one API route so the later LMS integration only touches that boundary.
