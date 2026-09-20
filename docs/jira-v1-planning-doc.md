# Cloud Heroes Africa — Jira V1 Planning Doc

> Structure follows Kris's proposed approach (meeting summary, [Fathom recording](https://fathom.video/share/9PLh9WKYuUDqYXCo1szvrrFb86ix2mb3)): list by module → break into buildable features → estimate hours → sum → compare against available capacity → push overflow to V2/backlog.
>
> **What this doc does:** organizes every feature/decision from `decision-log.md` and the LP design docs into Epic → Story → Sub-task shape, ready to paste into Jira. **What it does NOT do:** invent hour estimates. Effort columns are left blank — that's a team estimation exercise, not something to be pulled from meeting notes. Fix Version is a *proposed starting point* based on what's actually been decided vs. what's still Open — not a final call.

A companion file, `jira-import.csv`, has the same content in Jira's CSV-import column format so this can be bulk-loaded rather than re-typed.

---

## How to read the Fix Version column

- **V1** — tied to a "Decided" status in the log, or explicitly named in the 2026-07-16 V1-scope decision.
- **V2/Backlog** — explicitly deferred by a team decision (not just my judgment).
- **Needs decision** — status in the log is "Open" or "Working Assumption," or the item wasn't reconciled against the anchor V1 scope line. These need a yes/no before they can be typed as V1 or V2 in Jira — sizing them without that risks estimating work that gets cut anyway.

---

## Epic: Student Hub

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| Google OAuth login vs. approved-email list (no invite code, no reCAPTCHA) | V1 | Decided | 2026-06-11 |
| Login page: two buttons → same Google Auth flow | V1 | Decided | 2026-06-11 |
| Login page: Africa map imagery, adult-only imagery, mission headline | V1 | Decided | 2026-06-29, 2026-07-02 |
| Welcome/community video embed on login page | V1 | Decided | 2026-06-11 |
| Registration redirect flow for non-approved emails | V1 | Decided | 2026-06-11 |
| Profile: hard completion gate before platform access | V1 | Decided | 2026-07-13 |
| Profile: edit name/email at top; stats excluded from profile | V1 | Decided | 2026-06-18 |
| Profile: Country of Origin + Time Zone fields, privacy toggles | V1 | Decided | 2026-06-25 |
| Profile: long-name wrap (not truncate) | V1 | Decided | 2026-06-25 |
| Profile: preferred-name change requires human/AI review | V1 | Decided | 2026-07-13 |
| MFA: phone/authenticator/passkey only, integrated into profile form | V1 | Decided | 2026-07-13, 2026-06-25 |
| MFA: device management only (revoke/rename); city field removed | V1 | Decided | 2026-06-29 |
| MFA: categorized sections (Email MFA / SMS MFA / Passkeys) | V1 | Decided | 2026-07-16 |
| Passkeys: 24–48hr provisional delay, dual-email notice, one-click revoke, admin reset | V1 | Decided | 2026-07-16 |
| Dashboard: static V1 layout (same for all users) | V1 | Decided | 2026-06-29 |
| Dashboard: zero-state for unenrolled students | V1 | Decided | 2026-06-29 |
| Dashboard: progress previews only (current unit, courses remaining, badges placeholder) | V1 | Decided | 2026-07-02 |
| Mobile-responsive design across all screens | V1 | Decided | 2026-06-25 |
| Bio field + pronouns on profile | V2/Backlog | Decided (deferred) | 2026-06-25 |
| Customizable/widget-based dashboard | V2/Backlog | Decided (deferred) | 2026-06-29 |
| Student-to-student calendar event invites | V2/Backlog | Decided (rejected for V1) | 2026-06-29 |
| Calendar view (dashboard widget + events) | V2/Backlog | Decided (explicitly excluded) | 2026-07-16 |
| Calendar RSVP / attendance | Needs decision | Open | 2026-06-11 |
| Pre-login recruitment/info page | Needs decision | Open | 2026-06-29 |
| Admin/volunteer + Donor Hub sign-in co-located on Student Hub login | Needs decision | Open | 2026-06-11 |
| Student display/preferred-name policy (separate name vs. verified identity) | Needs decision | Open | 2026-06-08 |

## Epic: Learning Platform — Content & Progress

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| LP as separate app: own nav, handshake from Student Hub, shared auth | V1 | Decided | 2026-07-06 |
| Content hierarchy: Program → Module → Unit (final, no Section) | V1 | Decided | 2026-07-02 (orig.), 2026-08-11 (final) |
| Data-light delivery: static visuals + local TTS, no video/audio files | V1 | Decided | 2026-07-06 |
| Multiple creators/instructors credited per unit/program | V1 | Decided | 2026-07-06 |
| Unit view: main content + secondary tabs (Notes/Assignments) | V1 | Decided | 2026-07-09 |
| Unit view: remove redundant heading, author info, nav arrows | V1 | Decided | 2026-07-16 |
| Sidebar toggle icon (existing Student Hub icon, not hamburger) | V1 | Decided | 2026-07-16 |
| Token-based unit unlock (complete unit → tokens → threshold to start next) | V1 | Decided | 2026-07-09 |
| Progression currency renamed points → tokens (schema/UI) | V1 | Decided | 2026-08-10/11 |
| Embedded Help button per unit, sends context (student/program/module/unit) to Help Desk | V1 | Decided | 2026-06-04, per requirements doc |
| Postgres migration off flat JSON stores | V1 | Decided | 2026-07-13, 2026-08-11 |
| Video content delivery | V2/Backlog | Decided (fast follow) | 2026-07-16 |
| Badges/gamification (unit/module/program scope + display) | Needs decision | Open | 2026-07-02 |
| Placement/level assessment location (onboarding vs. inside LP) | Needs decision | Open | 2026-05-18 |
| Advanced student bypass mechanism | Needs decision | Open | 2026-05-18 |
| Course ratings/reviews | Needs decision | Unresolved, no backing decision | flagged in design-session doc §7 |

## Epic: Learning Platform — Assessment Engine

> Flag for the roadmap session: none of these are literally named in the 2026-07-16 V1-scope line ("course consumption, written content first"). They're included here as V1 candidates because (a) assessments were decided as belonging inside LP as far back as 2026-05-18, and (b) the current migration brief is actively building the full engine — but this scope call is an inference and should be confirmed explicitly with Kris, not assumed by this doc.

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| Knowledge Checks: in-unit, separate from content, unlock after unit completion | V1 (proposed) | Working Assumption | 2026-05-21 |
| Knowledge Checks: immediate correctness + explanation shown | V1 (proposed) | Decided | 2026-08-06 |
| Knowledge Checks: fail → unit "Retake"; 2nd failure notifies a team member | V1 (proposed) | Working Assumption | 2026-05-21 |
| Knowledge Check UI: progress bar + skip-question option | V1 (proposed) | Decided | 2026-07-16 |
| Standalone Assessments: single-choice + multi-select only | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: proportional multi-select partial credit | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: no correctness shown during attempt | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: variable question count (no hard-coded count) | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: numbered question grid navigation | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: randomized bank + difficulty tagging/mix | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: progressive retake cooldowns (1h/3h/24h) | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: retake restarts at Q1, freshly randomized | V1 (proposed) | Decided | 2026-08-06, reinforced 2026-08-20 |
| Standalone Assessments: repeated-failure escalation to a team member | V1 (proposed) | Decided | 2026-08-06 |
| Standalone Assessments: weak-topic-focused failure guidance | V1 (proposed) | Decided | 2026-08-06 |
| Assessment marks kept separate from progression tokens | V1 (proposed) | Decided | 2026-08-06 |
| Module-level assessments: detailed answer review after submission | V1 (proposed) | Decided | 2026-08-20 |
| Program-level assessments: high-level guidance only, no detailed review | V1 (proposed) | Decided | 2026-08-20 |
| Per-assessment config: allow/deny unanswered submission; program-level must allow it | V1 (proposed) | Decided | 2026-08-20 |
| Server-enforced time limits + auto-submit | V1 (proposed) | Decided | design session 2026-08-11 |
| Save-and-resume (progressive answer persistence) | V1 (proposed) | Decided | design session 2026-08-11 |
| Forward-only navigation gated by answer/flag | V1 (proposed) | Decided | 2026-08-20 |
| Readiness/competency gate before module assessment attempt | V1 (proposed) | Decided (mechanism Open) | 2026-08-20 |
| **"Report Question" flagging during attempt + post-submit comment prompt** | **V2/Backlog** | **Decided (deferred)** | **explicitly moved to V2 in the [latest Jira-planning meeting](#)** |
| Practical/file-upload assessment submissions | Out of scope (dropped) | Decided | 2026-08-11 |
| Advanced question types (drag-drop, matching, short-answer, code eval) | V2/Backlog | Decided (deferred beyond V1) | 2026-08-06 |
| Practical/presentation assignments at module or program level | Needs decision | Open | 2026-05-21 |
| Retake-cooldown extension after detailed module review | Needs decision | Open | 2026-08-20 |
| Confidence-level / readiness self-rating capture | Needs decision | Working Assumption | 2026-08-20 |
| Pre-assessment module review/knowledge-check gate proposal | Needs decision | Working Assumption | 2026-08-20 |
| Student ratings/satisfaction on assessments | V2/Backlog (Phase 2) | Decided (deferred) | 2026-06-01 |

## Epic: Help Desk

> Flag for the roadmap session: 2026-06-04 explicitly put Administration (which owns Help Desk) **outside** the minimum POC scope ("may follow later"). The team then made a full, detailed Help Desk workflow decision on 2026-08-20. This doc lists that work as decided-but-unscoped rather than assuming it's in or out of V1 — that call belongs to the capacity exercise, not to this list.

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| Ticket intake → shared/master queue, no student-chosen assignee | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Manual self-assign by staff; claim → auto "In Progress" | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Ticket statuses: New / In Progress / Escalated + Resolved/Unresolved closure | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Closure requires explicit outcome + reason | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Full audit trail retained post-closure | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Escalation returns ticket to shared queue (no direct-to-person assignment) | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| No manual status dropdown — state changes via controlled actions only | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Reopen model: default-allowed once, then staff-controlled "no reopen" flag | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Reopen action labeled "Reopen Ticket"; "View Logs" is separate | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Export ticket logs + resolution report as PDF (not CSV) | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Attachments stored externally, shown as links | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Post-ticket satisfaction feedback (managerial reporting only, not per-agent) | Needs decision (scope vs. capacity) | Decided | 2026-08-20 |
| Contextual tagging on ticket creation (student, program, module, unit) | Needs decision (scope vs. capacity) | Decided | 2026-06-04 |
| Stack Overflow-style threaded community model + KB | Needs decision (scope vs. capacity) | Decided | 2026-05-28 |
| Ticketing tool selection + SLA timeframes | Needs decision | Open | 2026-05-18 |
| Queue structure: general vs. expertise-based | Needs decision | Open | 2026-06-01 |
| Service Desk intake/recovery process | Needs decision | Open | 2026-06-04, 2026-06-08 |
| Immediate-help classification criteria | Needs decision | Open | 2026-05-28 |

## Epic: Instructor Portal / Learning Management

> The decision log defines Learning Management's *scope* (program/module/unit authoring, assessment/KC design, materials admin — 2026-06-08) but contains very little on its own UI/workflow decisions. This epic will need its own requirements pass before it can be broken into stories — listing what's confirmed vs. genuinely undefined below.

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| Program/module/unit authoring & management | Needs decision (scope vs. capacity) | Decided (scope only, no UI spec) | 2026-06-08 |
| Assessment & Knowledge Check authoring | Needs decision (scope vs. capacity) | Decided (scope only, no UI spec) | 2026-06-08 |
| Learning-materials metadata administration | Needs decision (scope vs. capacity) | Decided (scope only, no UI spec) | 2026-06-08 |
| Event creation (surfaced via Student Hub calendar) | Needs decision (scope vs. capacity) | Decided (scope only) | 2026-06-08 |
| Microsoft SSO auth for volunteers/authors | Needs decision (scope vs. capacity) | Decided | 2026-06-08 |
| Owner-based permissions (creator owns program; delegated read/edit/admin; super-admin override) | Needs decision (scope vs. capacity) | Decided | 2026-06-04 |
| No student-management capability for course creators | Needs decision (scope vs. capacity) | Decided | 2026-06-04 |
| Content-sharing model for reusing units/modules across programs | Needs decision | Open | flagged in decision-log §5 candidates list |

---

## Cross-cutting items not tied to one module

| Item | Fix Version | Status | Notes |
|---|---|---|---|
| Database final selection (Postgres vs. NoSQL) | **Blocker — resolve before any estimation** | Open in decision-log §4, despite being treated as settled everywhere else (2026-07-13 Payload abandonment, system design, migration brief) | This needs a formal close-out entry, or every downstream estimate in LP/Assessments is provisional |
| Shared-data access pattern (Prisma direct access vs. narrow API) | V1 | Decided | 2026-08-24 |
| English-only for V1 | V1 | Decided | 2026-07-16 |

---

## Suggested next steps (per Kris's process)

1. Import `jira-import.csv` (or retype from the tables above) as Epics + Stories in Jira, `Fix Version` field pre-set from the "Fix Version" column.
2. In grooming, break each Story into Sub-tasks (UI / API / DB / testing / deployment) — not pre-done here since that's implementation-detail work, not decision-log content.
3. Add hour estimates per Story/Sub-task as a team exercise.
4. Sum V1-tagged hours, compare against available capacity before the target launch date.
5. Resolve every "Needs decision" row first — moving them to V1 or V2 without a decision means estimating (and possibly building) something the team hasn't actually agreed to build.
6. Reduce V1 scope with Kris and Harriet until total hours fit the available time.
