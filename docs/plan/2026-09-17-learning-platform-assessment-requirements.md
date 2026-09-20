# Learning Platform & Assessment Module — Requirements from Figma (`CHA Platform_4.fig`)

**Source:** `docs/CHA Platform_4.fig` (Figma file "CHA Platform", exported 2026-09-16). The file has no
Figma API access available, so it was decoded locally from the binary `canvas.fig` (Kiwi format) to
extract the real page/frame tree and on-canvas copy — not just the thumbnail. 11 pages, ~6,000 frames.
This doc covers every page except "Internal Only Canvas" (component library / working scratch page).

This is a requirements extraction, not an implementation plan — no code has been written. Use this to
scope tickets and reconcile against `docs/backend-status-2026-09-14.md` and
`docs/database-design-overview-2026-09-14.md` before building.

---

## 1. Learning Platform — Program Catalogue

Page: *Learning Platform (Program Catalogue View)*

- Browse all programs in a filterable/searchable grid (`Search...`, `FILTERS`, category tabs).
- Each program card shows: title, short description, language tag (`EN`), pacing (`Self-Paced Learning`),
  and one of four enrollment states, each with a different CTA:
  - **Not enrolled** → `Enroll Now`
  - **Enrolled, not started / in progress** → `Enrolled` badge, `Resume Program` / `Start Program`
  - **Completed** → `Completed 100%` badge, `Resume Program`
  - **Locked** (prerequisite not met) → `Locked` badge, no CTA
- Global nav present on every learner screen: `My Dashboard`, `Catalogue`, `My Program`, `My Profile`,
  plus command-palette search (`Ctrl K`).

**Requirements:** enrollment state machine (locked → available → enrolled → completed) with
prerequisite gating; program metadata (title, description, language, pacing, thumbnail); search/filter;
per-user enrollment records.

---

## 2. Learning Platform — Program / Module (Course) View

Page: *Learning Platform (Program+Module View)* — states: **Active** (mid-progress) and **Rest** (fresh).

- Module accordion: each module lists its units with type icon, one-line description, and per-unit state
  (`Completed`, current/in-progress with `Start`, or `Locked`).
  - Module list itself also gates: `Locked` modules show aggregate unit count (`0/8 Completed`) but can't
    be entered.
- Instructor card (name + "Course Instructor" role) shown at module level.
- Breadcrumb: `Program: <name>`.

**Requirements:** hierarchy is **Program → Module → Unit**; unit-level completion tracking; module
unlocks only once its prerequisite module (or its assessment — see §4) is passed; instructor assignment
per module.

---

## 3. Learning Platform — Module Content View

Page: *Learning Platform (Module Content View)*

- Module overview: completion %, `Your Course Status`, `Quiz Taken` count, `Completion Rate`,
  `Self-Paced Course`, total duration (`4h 15mins`), enrollment count, review count.
- Sections list (`Expand all sections`), each section shows unit count and duration, and each unit row
  shows its content type + duration (video mins / reading mins) inline.
- Explicit counters: `10 Knowledge Checks` (per-unit quizzes) and `1 Module Assessment` (the module-level
  exam — distinct object, see §5) surfaced at module level.

**Requirements:** module → section → unit content hierarchy (one level deeper than §2 implies); rollup
stats (completion rate, quiz count, enrollments, reviews) computed per module; explicit distinction
between **Knowledge Checks** (lightweight, per-unit) and **Module Assessment** (summative, per-module).

---

## 4. Learning Platform — Unit View (content delivery)

Page: *Learning Platform (Unit View)* — 9 frame variants covering every content type and side-panel state.

- **Video units:** player, playback speed control, language/narrator selector (e.g. "Microsoft David -
  English (United States)"), `Transcript` tab (timestamped, click-to-seek implied) and `Notes` tab
  (`Save Note`, `View all Notes`, "highlight lines in the transcript and save them as notes"). Sidebar can
  minimize to a compact rail.
- **Reading units:** paginated long-form content (`Next` / `Previous`), reading progress % , also support
  narrated/audio playback (same speed/voice controls as video — implies readings can have an audio
  track).
- **Knowledge Check (inline, per-unit quiz):** single multiple-choice question shown in the unit flow;
  immediate feedback state (`Result: Correct! Explanation ...`); a "done" state blocks forward
  navigation until acknowledged (`Please click on the next button ... to proceed`); `Skip` option also
  present.
- Persistent left rail across all unit types: section/unit tree with per-item type + duration, current
  unit highlighted, breadcrumb (`Back to Programs / Module: X / Unit Y`), top-of-unit progress bar and
  section counter (`4 Sections · 1/4 Done`).
- `Go to Next Item` primary action drives linear progression through the unit tree.

**Requirements:** content-type-polymorphic unit renderer (video / reading / knowledge-check, at minimum);
notes CRUD scoped to (user, unit, timestamp/selection); playback-speed and narration-language
preferences; per-unit knowledge-check with immediate scoring + explanation and a completion gate;
linear "next item" progression that respects the section/unit order.

---

## 5. Assessment Module (module-level, summative)

Page: *Learning Platform (Assessment View)* — 12 frames covering the full attempt lifecycle. This is the
core "assessment module" the platform needs.

### 5.1 Pre-assessment (start screen)
- Shows assessment title, description, and **rules**: question count, allowed attempts
  (`3 every 24 Hours`), lifetime attempt count/limit (`10`), and history of the **last attempt**
  (pass/fail, grade %, date/time).
- `Start Assessment` CTA and a `Report an Issue` escape hatch.
- Note: the mock data is internally inconsistent between frames (start screen says "Number of Questions:
  10" while the in-progress frames all say "Question N of **24**") — flag with design/product before
  building; don't hard-code either number.

### 5.2 In-progress (question flow)
- One question per screen, single-select multiple choice (A–D) in the mocks, but the admin question bank
  (§6.3) also defines `MC`, `Multi` (multi-select), and `Code` question types — the runtime UI needs to
  support at least those three.
- Per-question actions: `Previous` / `Next Question`, `Flag for Review` (toggles to `Flagged for Review`),
  `Report Question` (issue reporting on a specific question, independent of flagging).
- **Question palette**: numbered grid (1..N) for jump-to-question navigation, plus a live status summary
  (`Answered (n)`, `Flagged (n)`, `Remaining (n)`) and an overall progress %.
- `Exit` affordance mid-assessment (needs a save/resume-or-discard decision — not specified in the mock).

### 5.3 Submission / review-before-submit
- A confirmation screen recaps Answered / Flagged / Unanswered counts and explicitly warns
  "Once submitted, you cannot change your answers."
- Lets the user jump back to flagged/unanswered questions (`Review Flagged Questions`) or `Cancel` back
  into the assessment, before finally hitting `Submit Assessment`.

### 5.4 Results
- Pass/fail banner with numeric score %, `Total Questions`, `Correct`, `Incorrect`, `Time Taken`.
- **Performance-by-topic** breakdown (e.g. "Cloud Computing Basics — 90% (9/10 Correct)") — implies
  questions carry a topic/tag used purely for reporting, separate from the module-area tag used in
  authoring (§6.3).
- `View Detailed Feedback` → per-question review list, filterable by `All` / `Incorrect Only (n)` /
  `Flagged (n)`, paginated; each item shows the question, the learner's answer, the correct answer (if
  wrong), and an explanation.
- `Retake Assessment` (subject to the attempt limits from §5.1) and `Return to Course`.

### 5.5 Question-issue reporting
- Separate end-of-flow screen aggregates every question the learner flagged with `Report Question` during
  the attempt, walks through them one at a time (`Question 1 of 3 reported`), collects free-text issue
  detail per question, and supports `Skip feedback submission` or `Submit All Reports`. This is distinct
  from and in addition to the inline per-question `Report Question` action.

**Requirements:** attempt entity (learner, assessment, started/submitted timestamps, time taken, score,
pass/fail, answers[], flags[]); attempt-limiting rules (rolling window + lifetime cap) enforced
server-side; per-question metadata for scoring, topic tagging, and explanations; a distinct
"reported question" feedback queue routed to admins/support (ties into the Helpdesk flows in §8).

---

## 6. Assessment / Course Authoring (Admin)

Page: *Create Course View (For Admins)* — this is where everything in §1–5 gets built, and it's scoped as
its own IA with a left nav: `Programs`, `Program Setup`, `Course Structure`, `Unit Editor`, `Knowledge
Check`, `Settings & Access`.

### 6.1 Programs list & Program Setup
- Programs table: name, creator, status (`Published` / `Draft`), module count, last updated, `Edit`/`View`
  actions; `Create Program`.
- Program Setup form: description, **Creator** (single owner, "owns and maintains this program's
  content"), thumbnail upload (PNG/JPG, 16:9), **Program Instructors** (multi-add/remove list, distinct
  from Creator — "Instructors can change without changing the creator").

### 6.2 Course Structure builder
- Tree editor: `+ Add Module` → `+ Add Unit` under a module; units are reorderable (`↑`/`↓`); each unit
  shows its content type (`Reading`, `Hands-on lab`, etc.).

### 6.3 Knowledge Check editor (per-unit quiz)
- Draft/version label (e.g. `v1.4 - Draft`).
- Fields: name, **Associated Unit** (one knowledge check binds to exactly one unit).
- Per question: point weight, question text, 4 answer options with a correct-answer indicator, and an
  explanation/diagnostic-feedback field shown to the learner on incorrect answers.
- `+ Add Question Card`; actions `Save as Draft` / `Save & Publish` (lightweight, single-step publish —
  no review gate, unlike §6.4).

### 6.4 Module Assessment configuration (the summative exam from §5)
- **General metadata:** scope (`Select Scope Module`), assessment name, description.
- **Execution parameters:** passing threshold (%), attempts allowed (count), time limit (toggle + minutes)
  — these back the rules shown to learners in §5.1.
- **Question matrix:** a table of questions with ID, type (`MC` / `Multi` / `Code`), scenario+answer
  structure, a module-area tag, and a per-question weight (points) — supports `+ Import from Bank`,
  i.e. a reusable, shared question bank across assessments.
- Actions: `Save Draft` / `Submit for Review` — this one *does* have an approval workflow (see §6.5
  Reviewer role), unlike the Knowledge Check editor.

### 6.5 Settings & Access (roles)
- Three content roles, explicitly scoped:
  - **Editor** — create/edit/structure modules, update quizzes, publish courses *under review*.
  - **Reviewer** — inspect pathways, preview drafts, suggest edits, **approve program progression**
    (this is what "Submit for Review" in §6.4 routes to).
  - **Viewer** — read-only: drafts, content metrics, historical grades.
- Separate **Program Director** and **Program Owner** fields (distinct from the per-program "Creator" in
  §6.1 and from the Editor/Reviewer/Viewer roles).
- Contributors table (name, email, role, date added, remove) with per-program membership, independent of
  a user's global platform role.

**Requirements:** authoring is program-scoped with its own RBAC (Editor/Reviewer/Viewer/Director/Owner/
Creator/Instructor are six distinct concepts, not one role field); a shared/importable question bank;
two publish paths (direct publish for Knowledge Checks, review-gated for Module Assessments); draft
versioning.

---

## 7. Cross-cutting learner features (context for the above)

Not the primary ask, but they read/write the same data and are worth scoping alongside it:

- **Dashboard** (*Student Hub View*, 4 states incl. a first-time-user empty/onboarding state with a
  "Getting Started Checklist"): resume-current-unit card, program/module progress %, goals & milestones
  (create/track personal + system-suggested goals like "Pass Module 1 Assessment"), weekly study-streak /
  activity heatmap, calendar of scheduled classes & events, quick links.
- **Notifications** (*Notification Section View*): categorized feed (`All` / `Program Updates` /
  `Achievements` / `Community`), `Mark all as read`. Notably includes **Assessment Results** notifications
  ("You scored 93% on your Module 1 assessment. Expected pass grade: 75%.") — the assessment module must
  emit an event/notification on attempt completion.
- **Profile**: personal info edit, MFA (email-OTP toggle + authenticator app, a methods table with
  identifier/transport/last-used, per-method disable), public-visibility toggles for photo/country.

---

## 8. Helpdesk / Support (signal for assessment reliability requirements)

Page: *Helpdesk View (For Support Staff)*, 14 frames — student- and staff/admin-facing ticketing.

Several of the mocked support tickets are specifically about assessment/progress bugs, e.g.:
- *"'Cloud Fundamentals' final quiz won't submit / loading error"*
- *"I finished the final assessment of Module 1 and passed, but the system still lists Module 2 as
  locked... the score was recorded successfully, but the automatic progress trigger hasn't fired"*,
  resolved via *"Manual progress synchronization triggered across database"*.

**Requirement this implies for the assessment module specifically:** passing a Module Assessment must
reliably and atomically unlock the next module (§2), the pass/fail record must be independently visible
to support staff, and there must be an admin-safe manual override/resync action for when the automatic
unlock trigger fails — this is a real scenario the design already anticipates, not an edge case to skip.

Ticket workflow itself (Open → In Progress → Pending → Resolved/Closed, assignment, internal-only notes,
attachments, `Escalate`, closure survey, reopen protection) is a full feature in its own right if you're
scoping it — flagging it here since it's in the same Figma file, but it's not part of "learning platform
+ assessment module" unless you want it bundled.

---

## 9. Open questions to resolve before building

1. Question-count inconsistency in the Assessment start screen vs. in-flow screens (10 vs. 24) — **still
   open**, not addressed in the 2026-08-31/09-03/09-07 planning sessions.
2. Exit-mid-assessment behavior isn't specified: does it save partial answers, or discard the attempt? —
   **still open**.
3. Whether "Knowledge Check" (§6.3, per-unit) and "Module Assessment" (§6.4, per-module) share a question
   bank/schema — **partially resolved 2026-09-07**: the team explicitly extended the randomized-question-
   bank principle down to per-unit Knowledge Checks (author more questions than shown per attempt, e.g.
   10–15 for a 5-question check, so retakes can randomize). That's a strong signal they're meant to work
   the same way, but whether they're literally the same underlying table/schema as Module Assessment
   questions is still not stated outright — confirm with Bichesq before modeling.
4. Reconcile the Program → Module → Unit → Section nesting — **resolved**: every planning-meeting
   discussion of the hierarchy (including 2026-09-07, walking this exact question) describes it as
   Program → Module → Unit, with no Section entity, consistent with the 2026-08-11 "final, no Section"
   decision in `decision-log.md`. Treat any "Section" grouping in the Module Content View mockup (§3) as
   a display-only grouping within a module's unit list, not a persisted schema object.

---

## 10. Amendments from the 2026-08-31 / 2026-09-03 / 2026-09-07 planning meetings

These decisions (full detail in `decision-log.md` and `jira-v1-planning-doc.md`) change or contradict what
the raw Figma extraction above shows. Treat this section as authoritative over §1–8 wherever they conflict
— the sections above describe what's *drawn*, this section describes what the team has since *decided*.

### 10.1 Video is out of V1 — most of §4's Unit View doesn't apply yet
The Figma Unit View frames (§4) are built around a video-first experience: a player, playback-speed
control, and a narrator/language selector. The team decided V1 is **data-light: static visuals + local
TTS, no video or audio files** (video/audio explicitly deferred to V2, reconfirmed 2026-09-07). Build the
**reading/written unit type first**; treat the video-specific frames as a V2 reference, not a V1 target.

### 10.2 Notes tab: no home in V1
The Figma `Notes` tab (§4) was designed for the video unit type ("student takes notes while watching").
Since video is deferred (10.1), Notes has nothing to attach to in V1 and is **descoped** for the reading
unit type that's actually shipping. An author-provided content **Summary** and/or a lighter **Bookmarks**
feature were floated as replacements but are not committed — don't build Notes as drawn.

### 10.3 Knowledge Check: retake randomization
Add to §6.3: Knowledge Check question banks should be authored **larger than what's shown per attempt**
(e.g. 10–15 questions for a 5-question check) so a retake — which reuses the existing per-unit Knowledge
Check as a pre-assessment "refresher," per the 2026-09-07 decision — can serve a randomized subset instead
of the exact same questions every time. No separate "practice test" feature is needed.

### 10.4 Program-level bypass — new flow not yet designed
A V1 requirement with **no corresponding Figma screens**: a privileged admin (e.g. a board member) can
manually grant a student a bypass of a program's full curriculum, sending them straight to that program's
own Module/Program-level assessment (reusing §5's assessment engine, not a separate placement test). If
they fail, they must complete the full program. Needs: an admin "grant bypass" action/screen (not present
in the `Create Course View (For Admins)` pages extracted for §6), and a way to surface "bypass-eligible"
state to the learner.

### 10.5 Badges: scope confirmed simpler than what's drawn, timing pushed out
§7's dashboard/notification frames show granular, real-time achievement badges (e.g. "New Badge Earned:
Quick Learner... completed 3 modules in one week" — a streak/weekly-activity badge). The actual V1 decision
is much narrower: **one generic, program-level completion badge**, shareable on social media, and it isn't
even a real-time feature — it's issued via a **retroactive batch process** run after the fact, once the
display-name mechanism is finalized (10.6). Don't build the streak/weekly badge system shown in the
notifications mock for V1.

### 10.6 Preferred name — removed, not just a policy question
§6 and the earlier Profile-page extraction (from student-hub) show an editable "preferred name" field.
This is now **removed entirely for V1** (not deferred) — students display whatever name Google's OAuth
returns, at most choosing between their first name or full name. Do not build a free-text preferred-name
input; the abuse/moderation risk (an offensive name shown on a shareable badge, see 10.5) was the reason.

### 10.7 MFA: narrower than the Profile page shows
The Profile page (student-hub, extracted separately) shows "Email OTP Protection," an Authenticator app,
and a general "Multi-Factor" method in its MFA methods table. The actual V1 decision is **Authenticator
app only** — Email OTP and SMS OTP are both dropped (cost and low marginal value for a non-financial
platform). Whether the existing, more detailed Passkey story (provisional delay, dual-email notice, revoke)
still ships alongside Authenticator was not explicitly revisited and is flagged as open in the decision
log. A new, previously undefined requirement: session/"stay signed in" duration of roughly **one week**
between required re-authentications.

### 10.8 Profile completion: soft gate, not a hard block
§7 doesn't show this explicitly, but it's a real reversal worth flagging: profile completion is a **soft
gate** (persistent reminder), not a hard block on platform access. The exact required-field list (birthday?
country? photo?) is still undecided.

### 10.9 Help Desk: several §8 flows are now wrong as drawn
The Helpdesk pages extracted for §8 need real changes before they match V1 decisions:
- **"Reopen Ticket" must be removed.** The `student-ticket-detail-activity-log` and
  `support-chat-resolved-no-reopen` frames show a reopen action / "do not allow reopen" checkbox. V1
  removes reopen entirely: a student with a lingering issue opens a **new** ticket referencing the old
  ticket number, and staff use a **new ticket-search feature** (by student or ticket number — not present
  in the extracted frames) to pull up history.
- **The post-closure satisfaction survey must be removed for V1.** The
  `notifications-screen-after-support-ticket-closed` frame shows "How was your support experience? ...
  Submit Feedback" — this exact feature is cut from V1 (2026-09-07).
- **"Download Logs" / PDF export is cut from V1** — deprioritize this control if it's still in the build
  target for the initial release.
- **Pending status is confirmed correct as drawn** (`admin-ticket-detail-pending-state` already exists in
  the file) — just note it's broader than "awaiting fix confirmation": Pending covers any case where staff
  are waiting on the requester for anything, including more information.
- **No Service Desk system in V1.** A locked-out student (can't reach the in-app ticket form) instead
  emails a Help Desk address (e.g. `helpdesk@cloudheroesafrica.com`), which lands in the same shared queue.
  A distinct Service Desk experience is V2.
- **Community/Stack-Overflow-style board is walked back for V1** — none of the extracted Help Desk frames
  showed a public community board, so there's no existing design to undo here; just don't build one for V1.
  A different, undecided idea ("community hours" — students contributing peer support or content-creation
  time to progress past Intermediate) may replace it in spirit later.

### 10.10 Course ratings/reviews: back out of V1
§1's "Reviews" counter language and any star-rating UI are **not V1** — this moved into V1 scope on
2026-08-31 and was reversed back out on 2026-09-07. No design work needed for V1 launch.
