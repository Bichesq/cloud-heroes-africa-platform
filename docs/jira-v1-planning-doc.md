# Cloud Heroes Africa — Jira V1 Planning Doc

> Structure follows Kris's proposed approach (meeting summary, [Fathom recording](https://fathom.video/share/9PLh9WKYuUDqYXCo1szvrrFb86ix2mb3)): list by module → break into buildable features → estimate hours → sum → compare against available capacity → push overflow to V2/backlog.
>
> **What this doc does:** organizes every feature/decision from `decision-log.md` and the LP design docs into Epic → Story → Sub-task shape, ready to paste into Jira. **What it does NOT do:** invent hour estimates. Effort columns are left blank — that's a team estimation exercise, not something to be pulled from meeting notes. Fix Version is a *proposed starting point* based on what's actually been decided vs. what's still Open — not a final call.

A companion file, `jira-import.csv`, has the same content in Jira's CSV-import column format so this can be bulk-loaded rather than re-typed.

> **2026-08-31 update:** the team walked the full V1/V2 feature list end-to-end in the "Project Sync" meeting
> ([Fathom recording](https://fathom.video/share/CRS2S8a16ZgosAh65CKLND3vYAMESJHX)) and closed out several
> long-standing "Needs decision" rows below. See `decision-log.md` §2 (rows dated 2026-08-31) for the full
> reasoning. Rows changed by that session are marked "2026-08-31" in the Notes/Source column.
>
> **2026-09-03 update:** the follow-up "Project Sync" ([Fathom recording](https://fathom.video/share/2wTPsDwBzz3-SwJ94Cz4vFsmxYHjVtgt))
> was a screen-review session, not the broader Help Desk scope discussion that had been deferred to it — it
> refined the Help Desk ticket-status UI and the Assessment navigation/submission flow. Rows changed by that
> session are marked "2026-09-03".
>
> **2026-09-07 update:** the team did the actual line-by-line V1 close-out session
> ([Fathom recording](https://fathom.video/share/QnKoxZkZ_WnHffaC-UWzmuLypsxbsBEY)) — walking this exact
> document top to bottom. Several earlier calls were reversed (course ratings back out of V1, the pre-login
> page back in, the profile gate softened, preferred name removed outright, Help Desk reopen removed in
> favor of ticket search) and the Help Desk scope/SLA/tool-selection questions were finally narrowed (single
> queue, no separate Service Desk in V1). See `decision-log.md` §2 (rows dated 2026-09-07) for full reasoning
> on each reversal. Rows changed by that session are marked "2026-09-07". Kris introduced a "V+" rule during
> this session: if a nominally-V1 feature turns out to cause real trouble, bump it to V2 rather than debate
> it further.
>
> **2026-09-14 update:** Bichesq presented the current database architecture
> ([Fathom recording](https://fathom.video/share/cxWAz1A2Lr-pDRxSxswFao5uwzZp5Sgn)) — single shared Postgres
> across Student Hub/Learning Platform, split by domain (Identity, Content, Progress, Testing & Assessment,
> Support, Catalog). This closes out the long-open "Database final selection" cross-cutting blocker below.
> The session also reconfirmed assessment save-and-resume is cut, and raised (but did not decide) three new
> questions: Knowledge Check difficulty tagging, JSON-vs-Markdown content storage, and a missing "Event"
> entity for scheduled live sessions — see `decision-log.md` §3/§4 (rows dated 2026-09-14).
>
> **2026-09-17 update:** Eddie walked the team through updated Instructor Portal / Learning Management
> screens ([Fathom recording](https://fathom.video/share/Umsh7G-oco43TsUtYpvVea5V5WnG8yLK)) — Unit Editor
> (Markdown-driven, native S3 image upload), Knowledge Check bank/editor (versioned uploads, cross-unit
> reuse cut), publish-time validation, and the Director/Owner/Contributor role model. A PR-style
> publish-review workflow was explicitly deferred beyond V1. See `decision-log.md` §2 (rows dated
> 2026-09-17).
>
> **2026-09-21 update:** Kris and Bichesq walked through the actual built Unit View
> ([Fathom recording](https://fathom.video/share/sxL-zyBxfLyrDyVvYRAKTbyaMJKHPvu4)) instead of the static
> mockup, and found real UX problems: a duplicate content panel and TTS controls that scrolled out of
> view. Fixing those led to a bigger structural change — units now break into ~6-12 "Topics" with
> per-topic progress, a new sub-unit layer (distinct from the settled no-Section Program→Module→Unit
> hierarchy). See `decision-log.md` §2/§3/§4 (rows dated 2026-09-21).

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
| Welcome/community video embed — location leans toward the main external Cloud Heroes Africa website rather than a Student Hub screen; Harriet leads production/editing (mixing Samoa + others + past-event material) | V1 | Decided (placement leaning, not final) | 2026-06-11, revisited 2026-09-07 |
| Registration redirect flow for non-approved emails | V1 | Decided | 2026-06-11 |
| Profile: soft completion gate (persistent reminder, not a hard block) | V1 | Decided | 2026-07-13, reversed to soft 2026-09-07 |
| Profile: required-field list still undefined (birthday? country? photo?) | Needs decision | Open | 2026-09-07 |
| Profile: edit name/email at top; stats excluded from profile. Email is visible to Help Desk staff only | V1 | Decided | 2026-06-18, clarified 2026-09-07 |
| Profile: Country of Origin + Time Zone fields, privacy toggles | V1 | Decided | 2026-06-25 |
| Profile: long-name wrap (not truncate) | V1 | Decided | 2026-06-25 |
| Profile: preferred-name field removed entirely — student shows whatever name Google returns, optionally choosing first name vs. full name (not free text) | Out of scope (dropped) | Decided | 2026-09-07 |
| MFA: Authenticator app only for V1 — Email OTP and SMS OTP both dropped (cost/value) | V1 | Decided | 2026-09-07 (revises 2026-07-13/2026-07-16 scoping) |
| MFA: device management only (revoke/rename); city field removed (belongs in profile privacy toggles, not MFA) | V1 | Decided | 2026-06-29, 2026-09-07 |
| MFA / session: "stay signed in" duration ~1 week between re-authentications | V1 | Decided | 2026-09-07 |
| Passkeys: 24–48hr provisional delay, dual-email notice, one-click revoke, admin reset — status vs. the Authenticator-only V1 call above not explicitly reconciled | Needs decision | Open | 2026-07-16; ambiguity flagged 2026-09-07 |
| Dashboard: static V1 layout (same for all users) | V1 | Decided | 2026-06-29 |
| Dashboard: zero-state for unenrolled students | V1 | Decided | 2026-06-29 |
| Dashboard: progress previews only (current unit, courses remaining, badges placeholder) | V1 | Decided | 2026-07-02 |
| Mobile-responsive design across all screens | V1 | Decided | 2026-06-25 |
| Bio field + pronouns on profile | V2/Backlog | Decided (deferred) | 2026-06-25 |
| Customizable/widget-based dashboard | V2/Backlog | Decided (deferred) | 2026-06-29 |
| Student-to-student calendar event invites | Needs decision (may be cut entirely, not just V2) | Decided (rejected for V1); escalated | 2026-06-29; 2026-09-07 raised harassment/moderation risk against the feature existing in any version |
| Calendar view (dashboard widget + events) | V2/Backlog | Decided (explicitly excluded) | 2026-07-16 |
| Admin scope for V1: Help Desk admin view + Volunteer/Instructor view (course creation). Donor Hub pushed to V2+ | V1 | Decided | 2026-08-31, resolved further 2026-09-07 |
| Calendar RSVP / attendance | V2/Backlog | Decided (bumped, "V+" rule) | 2026-06-11, confirmed cut 2026-09-07 |
| Pre-login info/intro page — reinstated: a simple info page + "click to log in" CTA (not the earlier "double login" concept, which stays rejected) | V1 | Decided | Reversed 2026-08-31 exclusion; back in as of 2026-09-07 |
| Admin/volunteer + Donor Hub sign-in co-located on Student Hub login — which portals exist in V1 is resolved (row above); whether their sign-in entry points share one page is still open | Needs decision | Open | 2026-06-11, partially resolved 2026-09-07 |
| Student display/preferred-name policy | Out of scope (dropped) | Decided | 2026-08-31 verified-ID rejection stands; 2026-09-07 removed the preferred-name mechanic entirely rather than deferring it — see Profile rows above |

## Epic: Learning Platform — Content & Progress

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| LP as separate app: own nav, handshake from Student Hub, shared auth | V1 | Decided | 2026-07-06 |
| Content hierarchy: Program → Module → Unit (final, no Section) | V1 | Decided | 2026-07-02 (orig.), 2026-08-11 (final) |
| Data-light delivery: static visuals + local TTS, no video/audio files | V1 | Decided | 2026-07-06 |
| Content storage format: JSON vs. Markdown files (possibly S3-stored) — implementation detail, doesn't change the V1 scope above | Needs decision | Working Assumption | 2026-09-14 — proposed for simplicity; needs the existing TTS pause/pacing tuning re-verified against MD-sourced rendered output before switching |
| Event entity (scheduled live sessions — support/office-hours, guest speakers — with student attendance) | Needs decision | Open | 2026-09-14 — genuinely missing from the data model; relates to the still-open program-level support channel and V2 calendar items |
| Multiple creators/instructors credited per unit/program — creators are fixed once a program is created (list only grows if someone adds new content later); instructors can rotate over time (e.g. ~every 6 months) | V1 | Decided | 2026-07-06, refined 2026-09-07 |
| Instructor/creator rotation audit log | Needs decision | Open | 2026-09-07 |
| Unit view: main content + secondary tabs. Knowledge Check tab sits at the end of the unit content. Notes tab is descoped for written/reading content (it was designed for video, itself deferred to V2); a content Summary and/or Bookmarks were floated as alternatives, not committed | V1 (Notes removed for written content) | Decided (alternatives are Working Assumption) | 2026-07-09, revised 2026-09-07 |
| Unit view: remove redundant heading, author info, nav arrows | V1 | Decided | 2026-07-16 |
| Sidebar toggle icon (existing Student Hub icon, not hamburger) | V1 | Decided | 2026-07-16 |
| Unit view: remove the duplicate right-side lesson-script panel (leftover from the video-based design; redundant with the middle content now that V1 is text-only) | V1 | Decided | 2026-09-21 |
| Unit view: TTS controls fixed in place while scrolling (were scrolling out of view with the content) | V1 | Decided | 2026-09-21 |
| Unit content structure: Topics — a unit breaks into ~6-12 Topics (target ~10), each a smaller digestible chunk; a new sub-unit layer, distinct from the settled Program→Module→Unit (no Section) hierarchy | V1 | Decided | 2026-09-21 |
| Unit progress: per-topic granularity (e.g. 10 topics → 10% each) instead of a single 0%/100% flip; 100% still gated on passing the Knowledge Check | V1 | Decided | 2026-09-21 |
| Topic navigation mechanism: separate per-topic views vs. one scrollable page with an anchor/jump list | Needs decision | Open | 2026-09-21 |
| Unit view: program/module header collapses in "learning mode" (unit view), reappears on navigating back out | V1 | Decided | 2026-09-21 |
| Unit content: multiple images per topic allowed (not capped at one slide) | V1 (proposed) | Working Assumption | 2026-09-21 — Kris in favor, not put to full group confirmation |
| Search control scope: top-nav catalogue-wide search, not scoped to a single unit's content | V1 | Decided | 2026-09-21 |
| Token-based unit unlock (complete unit → tokens → threshold to start next) | V1 | Decided | 2026-07-09 |
| Progression currency renamed points → tokens (schema/UI) | V1 | Decided | 2026-08-10/11 |
| Embedded Help button per unit, sends context (student/program/module/unit) to Help Desk | V1 | Decided | 2026-06-04, per requirements doc |
| Postgres migration off flat JSON stores | V1 | Decided | 2026-07-13, 2026-08-11 |
| Video content delivery | V2/Backlog | Decided (fast follow) | 2026-07-16, reconfirmed 2026-08-31 |
| New "Beginner" level program (e.g. "Introduction to IT/Technology") — optional per program track, mandatory prerequisite for technical tracks (e.g. DevOps); no new "Level" schema field, Program→Module→Unit hierarchy unchanged | V1 | Decided | 2026-08-31 |
| Beginner-level practicals: optional, low-pressure, visuals-only for V1 (not interactive/mandatory) | V1 | Decided | 2026-08-31 |
| Badges/gamification: single generic, program-level badge for social sharing; fuller gamification deferred. Delivery held until display-name mechanics settle, then issued via a retroactive batch (query completions, send badges after the fact) rather than at V1 launch | V1 (post-launch batch, not day-one) | Decided (simplified; timing refined) | 2026-08-31, refined 2026-09-07 |
| Badges retroactive-batch trigger/cadence | Needs decision | Open | 2026-09-07 |
| Course ratings/reviews | V2/Backlog | Decided (deferred again) | Moved into V1 2026-08-31, reversed back out 2026-09-07 |
| Placement/level assessment location (onboarding vs. inside LP) | V1 | Decided | 2026-08-31 — inside the Learning Platform, at Program level, reusing the program's own assessment |
| Advanced student bypass mechanism (policy) | V1 | Decided (backend mechanism still Open — see decision-log §4) | 2026-08-31 — admin-granted exception, restricted to privileged accounts (e.g. board members); student attempts the program assessment directly; failing it requires completing the full program |

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
| Save-and-resume — cut. A network-interrupted attempt is lost / deemed incomplete, not resumable | Out of scope | Decided (reversed) | design session 2026-08-11 proposed it; confirmed cut 2026-09-14 ("pretty categorical") |
| Incomplete-attempt handling: reconnection grace window + "deemed incomplete" policy + proactive student comms | Needs decision | Open | 2026-09-14 |
| Forward-only navigation gated by answer/flag | V1 (proposed) | Decided (reaffirmed: flagging alone satisfies the gate, distinct from answering) | 2026-08-20, 2026-09-03 |
| Readiness/competency gate before module assessment attempt | V1 (proposed) | Decided (mechanism Open) | 2026-08-20 |
| Program-level bypass assessment: an admin-granted bypass routes a student straight into that program's existing summative (Program-level) assessment — no separate placement-test engine needed | V1 (proposed) | Decided (grant mechanism Open) | 2026-08-31 |
| Navigation button labeled "Next" (not "Next Question"/"Last Question"), for symmetry with "Previous"; inactive/grayed out on the last question | V1 (proposed) | Decided | 2026-09-03 |
| Last-question actions: separate "Review Flagged/Unanswered Questions" + "Submit Assessment" buttons both shown (not one standing in for the other) | V1 (proposed) | Decided | 2026-09-03 |
| Flag-for-review control always active (incl. last question, incl. unanswered questions); gray = unflagged, yellow = flagged | V1 (proposed) | Decided | 2026-09-03 |
| Questions palette: no maximize/expanded view in V1; auto-scrolls to current question; resizable/scrollable for large question counts (50+); scrollable or dropdown on mobile | V1 (proposed) | Decided | 2026-09-03 |
| **"Report Question" flagging during attempt + post-submit comment prompt** — distinct from "review flagged/unanswered questions," which is in-attempt navigation, not a defect report | **V2/Backlog** | **Decided (deferred)** | **2026-09-07 (reconfirmed; earlier placeholder citation resolved)** |
| Practical/file-upload assessment submissions | Out of scope (dropped) | Decided | 2026-08-11 |
| Advanced question types (drag-drop, matching, short-answer) | V2/Backlog | Decided (deferred beyond V1) | 2026-08-06 |
| `Code` question type — tension: 2026-08-06 deferred "code eval" to V2 as an "advanced question type," but requirements §6.4 lists `Code` as one of three question types (MC/Multi/Code) for the Module Assessment matrix, and `docs/plan/2026-09-20-learning-platform-v1-build.md` treats it as V1-scoped missing work. Re-raised 2026-09-21 (manual vs. automated/exact-answer grading), still unresolved either way | Needs decision | Open | 2026-08-06, 2026-09-20, 2026-09-21 — reconcile V1-vs-V2 scope explicitly before building either direction |
| Practical/presentation assignments at module or program level | Out of scope (deprioritized indefinitely) | Decided | 2026-09-07 — grading doesn't scale (e.g. 50 submitted files per cohort) without a defined review mechanism, not even prioritized for V2 planning yet |
| Retake-cooldown formula | Needs decision | Open | 2026-08-20; 2026-09-07 leaned toward a progressive curve capped around a week, exact formula still undecided |
| Confidence-level / readiness self-rating capture | Out of scope (dropped) | Decided | 2026-09-07 — self-report judged unreliable; the separate objective performance-based readiness widget (knowledge checks + assessments) is unaffected and stays |
| Pre-assessment module review/knowledge-check gate | V1 (proposed) | Decided | 2026-09-07 — resolved by reusing the existing per-unit Knowledge Check retake as a refresher; no separate practice-test feature needed |
| Knowledge Check question banks oversized for randomized retakes (e.g. author 10–15 questions for a 5-question check) | V1 (proposed) | Decided | 2026-09-07 — extends the 2026-08-06 randomized-bank principle down to per-unit Knowledge Checks |
| Knowledge Check difficulty tagging (Easy/Medium/Difficult) — proposed as creator/internal-only (not shown to students), cross-checked later against real per-question pass/fail rates | Needs decision | Working Assumption | 2026-09-14 — Kris flagged the extra-work cost (bigger banks, tagging pipeline) against unclear value; not adopted yet |
| Student ratings/satisfaction on assessments | V2/Backlog (Phase 2) | Decided (deferred) | 2026-06-01 |

## Epic: Help Desk

> 2026-06-04 originally put Administration (which owns Help Desk) **outside** the minimum POC scope. The
> team made a full, detailed Help Desk workflow decision on 2026-08-20, and then **explicitly confirmed
> Help Desk is in V1** on 2026-09-07 ("this is version one") — resolving the "scope vs. capacity" hedge that
> previously sat on every row in this epic. Several 2026-08-20 specifics were also reversed that same
> session (reopen removed, export cut, satisfaction feedback cut, contextual tagging simplified, the
> community model walked back), and the long-open queue-structure/Service-Desk-channel questions were
> finally resolved.

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| Ticket intake → shared/master queue, no student-chosen assignee | V1 | Decided | 2026-08-20, confirmed V1 2026-09-07 |
| Ticket status: Pending — staff awaiting further info or confirmation from the requester, triggered via a "Mark as Pending" action | V1 | Decided | 2026-09-03, broadened 2026-09-07 |
| Escalated ticket keeps its "Escalated" badge after being claimed/assigned, until closed | V1 | Decided | 2026-09-03 |
| Ticket queue default filters: Status ≠ Closed AND (Assigned to me OR Unassigned), user-adjustable | V1 | Decided | 2026-09-03 |
| Manual self-assign by staff; claim → auto "In Progress" | V1 | Decided | 2026-08-20, confirmed V1 2026-09-07 |
| Ticket statuses: New / In Progress / Escalated / Pending + Resolved/Unresolved closure | V1 | Decided | 2026-08-20, 2026-09-03 |
| Closure requires explicit outcome + reason | V1 | Decided | 2026-08-20 |
| Full audit trail retained post-closure | V1 | Decided | 2026-08-20 |
| Escalation returns ticket to shared queue (no direct-to-person assignment) | V1 | Decided | 2026-08-20 |
| No manual status dropdown — state changes via controlled actions only | V1 | Decided | 2026-08-20 |
| Reopen — removed entirely. A student with a still-open issue submits a new ticket referencing the old ticket number; staff use ticket search (below) for history/context | Out of scope (dropped) | Decided | Reverses 2026-08-20 "reopen model" and "Reopen Ticket" label decisions; removed 2026-09-07 |
| Ticket search by student or by ticket number (reuses the existing ticket table/filter view) | V1 | Decided | 2026-09-07 — new, needed once reopen was removed |
| Export ticket logs + resolution report as PDF | Out of scope for V1 | Decided (deferred) | Reverses 2026-08-20; cut 2026-09-07 (not worth the tuning effort right now) |
| Attachments stored externally, shown as links | V1 | Decided | 2026-08-20 |
| Post-ticket satisfaction feedback | Out of scope for V1 | Decided (deferred) | Reverses 2026-08-20; cut 2026-09-07 |
| Contextual tagging on ticket creation (student, program, module, unit) — dropped as structured fields; captured in free-text description/conversation instead | Out of scope (simplified) | Decided | Reverses 2026-06-04 scope intent; simplified 2026-09-07 |
| Stack Overflow-style threaded community model + KB | Out of scope for V1 | Decided (walked back) | 2026-05-28 "Decided" status reversed for V1 on 2026-09-07 — see the separate "community hours" idea below |
| Community hours — students may need to contribute community hours (peer support, content creation) to progress past Intermediate | Needs decision | Open (Working Assumption) | 2026-09-07 — new idea, well-received, no tracking mechanism designed |
| Ticketing tool selection + SLA timeframes (incl. alerting when a ticket sits in New too long) | Needs decision | Open | 2026-05-18; reaffirmed necessary 2026-09-07, still no tool/timeframe chosen |
| Queue structure: single general queue for V1; expertise-based split deferred to V2 | V1 | Decided | 2026-06-01, resolved 2026-09-07 |
| Service Desk vs. Help Desk: no separate Service Desk in V1 — a locked-out student emails a Help Desk address (e.g. helpdesk@cloudheroesafrica.com), which routes into the same shared queue. Full Service Desk deferred to V2 | V1 (as a Help Desk email fallback) | Decided | 2026-06-04, 2026-06-08, resolved 2026-09-07 |
| Immediate-help classification criteria — dropped; rely on free-text description | Out of scope (dropped) | Decided | 2026-05-28, resolved 2026-09-07 |

## Epic: Instructor Portal / Learning Management

> 2026-09-07 gave this epic its first concrete V1 spec: a deliberately minimal, internal-only tool — upload
> content files under a defined naming convention, and set metadata (unit name, program, module, order,
> thumbnail, description, authors, instructors) via simple fields/dropdowns. Eddie will build a simple
> (not polished) front-end for it once Bichesq specifies the exact fields, rather than leaving it
> database-view-only. Nobody outside the content-creation team touches this in V1.
>
> **2026-09-17 update:** the actual screens Eddie built go well beyond "minimal" — Markdown-driven unit
> content with native S3 image handling, a versioned Knowledge Check bank/editor, publish-time validation,
> and a three-tier Director/Owner/Contributor role model. See `docs/plan/2026-09-21-learning-management-authoring-app.md`,
> which independently decided this ships as a full requirements-§6.5-scoped surface rather than the minimal
> Sep-7 version — this session's screens are consistent with, and predate, that call.

| Story | Fix Version | Status (per log) | Notes / Source |
|---|---|---|---|
| Program/module/unit authoring & management — minimal internal upload+metadata form (see note above) | V1 (minimal internal tool) | Decided (concrete V1 spec, not just scope) | 2026-06-08, spec'd 2026-09-07 |
| Unit Editor: Markdown-file-driven unit content, parsed and previewed on upload | V1 | Decided | 2026-09-17 |
| Unit Editor: images uploaded to S3 natively through the interface (not a manual S3-link-paste step) | V1 | Decided | 2026-09-17 |
| Knowledge Check bank/editor: versioned uploads (never silently overwritten; a wrong upload is fixed by deleting that version) | V1 | Decided | 2026-09-17 |
| Knowledge Check reuse across units/programs — cut; a KC stays specific to its one unit | Out of scope | Decided | 2026-09-17 |
| Publish-time completeness validation (e.g. a unit can't publish without an associated Knowledge Check) | V1 | Decided | 2026-09-17 |
| PR-style publish review/approval workflow | V2+ (deferred) | Decided | 2026-09-17 — V1 authors publish directly; flagged as a real future need once volunteers get access, since one person could otherwise hold every authoring role on a program unchecked |
| Authoring roles: Program Director (platform-wide) → Program Owner (one program) → Program Contributor (unit-level content); assigned by name, not email | V1 | Decided | 2026-09-17 |
| Program Director/Owner fields are add-able lists (multiple directors/owners supported), matching the Contributors list pattern | V1 | Decided | 2026-09-17 — cheap future-proofing for the review-workflow gap above |
| Assessment & Knowledge Check authoring — explicitly owned by whoever creates the course; Help Desk admins must not have this capability | V1 | Decided (scope only, no UI spec; ownership clarified 2026-08-31) | 2026-06-08, 2026-08-31 |
| Admin bypass grant: a privileged-only action (e.g. board members) that grants a student a program bypass | V1 | Decided (policy only, mechanism Open) | 2026-08-31 |
| Learning-materials metadata administration | V1 (minimal internal tool) | Decided (scope only, no UI spec) | 2026-06-08 |
| Event creation (surfaced via Student Hub calendar) | Needs decision (scope vs. capacity) | Decided (scope only) | 2026-06-08 |
| Microsoft SSO auth for volunteers/authors — if SSO proves too complex short-term, a private/internal-network-restricted access path is an acceptable stopgap (only Bichesq/Eddie use this tool initially) | V1 | Decided | 2026-06-08, fallback option added 2026-09-07 |
| Owner-based permissions (creator owns program; delegated read/edit/admin; super-admin override) | Needs decision (scope vs. capacity) | Decided | 2026-06-04 |
| No student-management capability for course creators | Needs decision (scope vs. capacity) | Decided | 2026-06-04 |
| Content-sharing model for reusing whole units/modules across programs — distinct from Knowledge Check reuse specifically, which is cut (see above) | Needs decision | Open | flagged in decision-log §5 candidates list |

---

## Cross-cutting items not tied to one module

| Item | Fix Version | Status | Notes |
|---|---|---|---|
| Database final selection: Postgres (relational), with one content section as a JSON column — not a NoSQL/document DB | V1 | Decided (resolved) | Formally closed 2026-09-14 via Bichesq's architecture walkthrough; matches `docs/database-design-overview-2026-09-14.md`. No longer a blocker |
| Shared-data access pattern (Prisma direct access vs. narrow API) | V1 | Decided | 2026-08-24 |
| English-only for V1 | V1 | Decided | 2026-07-16 |
| Error monitoring: Sentry (free tier) for error tracking, tracing, and alerting | V1 | Decided | 2026-09-07 |
| Target schedule: V1 ~mid-October 2026, V2 ~end of 2026 | Proposed, not committed | Open | Kris floated these dates on 2026-08-31 partly to justify pulling course ratings into V1 for early feedback (that item has since reversed back out); presentation date to stakeholders also unconfirmed as of 2026-09-03 — treat as a planning input, not a deadline, until confirmed |

---

## Suggested next steps (per Kris's process)

1. Import `jira-import.csv` (or retype from the tables above) as Epics + Stories in Jira, `Fix Version` field pre-set from the "Fix Version" column.
2. In grooming, break each Story into Sub-tasks (UI / API / DB / testing / deployment) — not pre-done here since that's implementation-detail work, not decision-log content.
3. Add hour estimates per Story/Sub-task as a team exercise.
4. Sum V1-tagged hours, compare against available capacity before the target launch date.
5. Resolve every "Needs decision" row first — moving them to V1 or V2 without a decision means estimating (and possibly building) something the team hasn't actually agreed to build.
6. Reduce V1 scope with Kris and Harriet until total hours fit the available time.
