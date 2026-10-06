# Reconcile Aug 27 & Sep 7 Project Sync meetings into decision-log.md and jira-v1-planning-doc.md

**Date:** 2026-09-10
**Status:** Draft — awaiting review

## Context

Two "Project Sync" meetings happened after the last entries in `decision-log.md` (2026-08-24) and are not reflected there or in `jira-v1-planning-doc.md`:

- **Aug 27, 2026** — Help Desk/Assessment UI refinements + an assessment-datastore architecture call.
- **Sep 7, 2026** — explicitly titled "Finalize V1 requirements." This one is the important one: several of its decisions **reverse or narrow items already logged as "Decided,"** not just resolve open questions. Sep 7's own action items assign Bichesq to "update V1 requirements doc to reflect all decisions" — this plan doc is that update, staged for review before it touches the two source-of-truth files.

Both meetings were read via their Fathom summaries (share links in the conversation, not re-quoted here) and cross-checked line-by-line against the current `decision-log.md` and `jira-v1-planning-doc.md`.

## Goal

`decision-log.md` and `jira-v1-planning-doc.md` accurately reflect both meetings, with every reversal of a prior "Decided" row recorded using the existing **Replaced** convention (see lines 38–44 of decision-log.md for the precedent pattern) rather than silently overwritten.

## Scope

- In scope: append new decision-log rows, mark superseded rows `Replaced`, update the corresponding Fix-Version/Status rows in jira-v1-planning-doc.md.
- Out of scope (this pass): regenerating `jira-import.csv` from the updated table (flagged for a follow-up once these edits are approved), and the still-unresolved Postgres-vs-NoSQL final pick (only the "separate datastore from the Hub" boundary is newly decided).

## Approach

### 1. decision-log.md — new "Confirmed Decisions" rows to append (§2, after line 183/line 224 area)

| Date | Area | Decision | Status | Owner | Reason / Notes |
|---|---|---|---|---|---|
| 2026-08-27 | Help Desk ticket closure UI | Replace separate Resolve/Close buttons with a single "Close Ticket" action that opens a modal to set final status (Resolved/Canceled) + resolution summary; add a new "Pending" status for tickets awaiting student verification | Decided | Team / Kris / Eddie | Refines the Aug 20 status model; removes the two-step Resolve→Close confusion raised in this meeting |
| 2026-08-27 | Help Desk escalation UI | Escalated tickets get a distinct, visibly prioritized "Escalated" status in the queue rather than blending back in silently | Decided | Team / Eddie | Clarifies (does not reverse) the Aug 20 "returns to shared queue with Escalated status" decision |
| 2026-08-27 | Help Desk ticket creation UI | Consolidate the 3-step ticket creation form into one screen; staff search for students by email (not name) to avoid selecting the wrong student; full ticket description is copied into the activity log as its first entry | Decided | Team / Eddie | UI simplification pass |
| 2026-08-27 | Help Desk feedback prompt | Post-ticket feedback modal is triggered via a Student Hub dashboard notification, not immediately on closure | Decided | Team / Eddie | Avoids forcing students back into the help desk right after closing a ticket |
| 2026-08-27 | Assessment submission UI | Add a dedicated Submit button to the question palette; on the last question, "Next Question" is replaced by a "Review" button leading to a full-screen palette for a final check before submission | Decided | Team / Eddie | Fixes the unintuitive "Next Question on the last question" flow |
| 2026-08-27 | Assessment module data architecture | The assessment module's datastore is architecturally separate from the Student Hub's, linked only by student ID; final engine choice (Postgres JSON vs. a separate NoSQL store) is still open | Decided (partial) | Team / Bichesq | Narrows the Aug 24 "Database final selection" blocker; Bichesq owns the follow-up recommendation |
| 2026-09-07 | Profile "Preferred Name" field | Field is removed from V1 entirely — no preferred name, no human/AI review step | **Replaced** | Team / Kris | **Supersedes the 2026-07-13 "Preferred name moderation" decision** (line 135). Rationale: prevents badge/name abuse and removes the review-process cost entirely rather than mitigating it |
| 2026-09-07 | Profile completion gate | Gate is soft: users may start learning immediately after Google Auth and are prompted to complete their profile; required-field list still TBD | **Replaced** | Team / Kris / Bichesq | **Supersedes the 2026-07-13 "Profile completion hard gate" decision** (line 134) — reverts to the spirit of the original 2026-05-18 soft-gate position |
| 2026-09-07 | MFA method | Per the meeting's stated key takeaway, authenticator app becomes the sole MFA method (email/SMS called out as costly/less secure) | **Needs confirmation before treating as Replaced** | Team | ⚠️ See "Open questions" — a quote captured later in the same meeting still says "phone, authenticator, passkey only," contradicting the summary's own takeaway. Do not mark 2026-07-13's MFA-method decision (line 133) Replaced until Bichesq confirms which is correct |
| 2026-09-07 | Passkey provisional delay | Provisional delay changed from 24–48 hours to 1 week | **Replaced** | Team | **Supersedes the 2026-07-16 passkey delay decision** (line 142) |
| 2026-09-07 | Student-to-student calendar invites | Dropped for all versions, not deferred to V2 | **Replaced** | Team | **Supersedes the 2026-06-29 "rejected for V1, may reconsider in V2/V3" decision** (line 117) — this is now a permanent no, not a deferral |
| 2026-09-07 | Calendar RSVP / attendance | Resolved: feature moves to V2 | Decided | Team | **Closes the open question at decision-log.md line 248** (and item 21 in the Open Questions list, line 283) |
| 2026-09-07 | Unit view notes | Manual student notes feature replaced by auto-generated content summaries | Decided | Team | Changes the "Notes" tab described in the July 9 unit-view decision from a student-authored feature to a system-generated one |
| 2026-09-07 | Assessment retake cooldown | Cooldown changed from the Aug 6 progressive 1h/3h/24h schedule to a stricter schedule starting at 1 hour and escalating up to 1 week | **Replaced** | Team | **Supersedes the 2026-08-06 progressive retake cooldown decision** |
| 2026-09-07 | Confidence-level / readiness widget | Removed — not part of V1 | Decided | Team | **Closes the 2026-08-20 Working Assumption** on confidence-level capture (line 222) as decided-against |
| 2026-09-07 | Help Desk "Reopen Ticket" | Feature removed entirely; students open a new ticket for unresolved issues, staff get a new search-by-name/ticket-number function to find and link prior tickets for context | **Replaced** | Team | **Supersedes both 2026-08-20 reopen-model decisions** (lines 171–172) |
| 2026-09-07 | Help Desk external email intake | Moved to V2 | Decided | Team | New scope call, not previously logged |
| 2026-09-07 | Help Desk SLA reporting | Moved to V2 | Decided | Team | Resolves part of the open "ticketing tool selection + SLA timeframes" question (line 128-area) |
| 2026-09-07 | Instructor Portal / Learning Management scope | V1 scope decided: minimal, internal-only UI for content creation (programs/modules/units; fields limited to name, description, authors, order); built by Eddie; Microsoft SSO auth | Decided | Team / Eddie | Resolves most of the epic's "Needs decision (scope vs. capacity)" rows — see jira-v1-planning-doc.md changes below |
| 2026-09-07 | Error monitoring | Sentry integrated into V1 for error logs, to debug issues reported by non-technical users | Decided | Team / Bichesq | New cross-cutting V1 item, not previously logged |

### 2. jira-v1-planning-doc.md — row-level updates

**Epic: Student Hub**
- Line 32 (`Profile: preferred-name change requires human/AI review`) → remove the row entirely (feature no longer exists in V1); note the removal came from the Sep 7 meeting.
- Line 28 (`Profile: hard completion gate before platform access`) → change to `Profile: soft completion gate, prompt-only after Google Auth (required fields TBD)`, Status stays "Decided" but Notes updated to `2026-09-07 (reverses 2026-07-13 hard-gate call)`.
- Line 33 (MFA row) → **hold pending confirmation** (see Open Questions) rather than edit now.
- Line 36 (Passkey provisional delay) → `24–48hr` → `1 week`, Notes append `2026-09-07`.
- Line 43 (Student-to-student calendar invites) → Fix Version changes from `V2/Backlog` to `Out of scope (dropped)`, Status `Decided (rejected, all versions)`, Notes append `2026-09-07`.
- Line 45 (Calendar RSVP/attendance) → Fix Version `Needs decision` → `V2/Backlog`, Status `Open` → `Decided (deferred)`, Notes `2026-09-07`.
- Line 46 (Pre-login recruitment/info page) → flagged, not auto-resolved (see Open Questions below) — a meeting quote leans toward "goes on the public website, not in Student Hub," consistent with the existing 2026-06-08 "website is the public welcome layer" decision, but this wasn't a clean restated decision in the Sep 7 summary.

**Epic: Learning Platform — Content & Progress**
- Line 58 (`Unit view: main content + secondary tabs (Notes/Assignments)`) → change "Notes" to "auto-generated content summaries" in the description; Notes append `2026-09-07 (Notes tab replaced with system-generated summaries, not manual student notes)`.

**Epic: Learning Platform — Assessment Engine**
- Line 87 (progressive retake cooldowns 1h/3h/24h) → update to `1h initial, escalating up to 1 week`; Notes append `2026-09-07 (supersedes 2026-08-06 schedule)`.
- Line 104 (Confidence-level / readiness self-rating capture) → Fix Version `Needs decision` → `Dropped`, Status `Working Assumption` → `Decided (rejected)`, Notes `2026-09-07`.
- Add new row: `"Report Question" post-submit comment flow` already exists at line 99 as V2/Backlog — no change, Aug 27 meeting reconfirmed this, just add `2026-08-27` to its Notes as a second confirming source.
- Add new row under the epic's intro note: `Assessment submission UI: dedicated Submit button + full-screen Review palette on last question | V1 (proposed) | Decided | 2026-08-27`.
- Add new row: `Assessment module datastore separate from Student Hub, linked by student ID | V1 | Decided (partial — engine choice still open) | 2026-08-27`.

**Epic: Help Desk**
- All rows currently marked `Needs decision (scope vs. capacity)` from the 2026-08-20 batch should be re-evaluated given the Sep 7/Aug 27 meetings clearly treat Help Desk as **actively being built for V1** (Figma work assigned to Eddie, workflow finalized) — recommend changing these to `V1` / `Decided`, but flagging this as an inferred scope call for Bichesq/Kris/Harriet to confirm explicitly rather than silently reclassifying a "Needs decision (scope vs. capacity)" row.
- Line 114–115 (ticket intake/self-assign) → no content change, just Fix Version per above if confirmed.
- Line 116 (ticket statuses) → update wording to include the new `Pending` status and the Close-Ticket-replaces-Resolve/Close model; Notes append `2026-08-27, 2026-09-07`.
- Line 121–122 (Reopen model, Reopen Ticket label) → **remove both rows** (feature no longer exists) and add a new row: `Students open a new ticket for unresolved issues; staff get a search-by-name/ticket-number function to link prior tickets | V1 | Decided | 2026-09-07 (supersedes reopen model)`.
- Add new row: `External email ticket intake | V2/Backlog | Decided (deferred) | 2026-09-07`.
- Add new row: `SLA reporting | V2/Backlog | Decided (deferred) | 2026-09-07`.

**Epic: Instructor Portal / Learning Management**
- Lines 139, 143, 144 (program/module/unit authoring, Microsoft SSO, owner-based permissions) → Fix Version `Needs decision (scope vs. capacity)` → `V1`, Status → `Decided`, Notes append `2026-09-07 (minimal internal-only UI, basic fields only: name/description/authors/order; built by Eddie)`.
- Lines 140–141 (assessment/KC authoring, materials metadata admin) → **not** mentioned in Sep 7 meeting; leave as `Needs decision` — do not assume these are in the "minimal UI" scope.

**Cross-cutting items**
- Add new row: `Sentry error monitoring | V1 | Decided | 2026-09-07`.

### 3. Not touched in this pass
- `jira-import.csv` — will go stale relative to the table edits above; regenerate as a fast follow once these edits are approved.
- Final Postgres-vs-NoSQL pick for the assessment engine — still open; Bichesq's action item from Aug 27.

## Files / modules affected

- `docs/decision-log.md` — ~19 new rows in §2 (Confirmed Decisions), several existing rows' Status changed to `Replaced`.
- `docs/jira-v1-planning-doc.md` — row edits/additions across Student Hub, Learning Platform (Content & Assessment), Help Desk, Instructor Portal, and Cross-cutting sections, as itemized above.

## Open questions / assumptions

1. **MFA method contradiction** — the Sep 7 summary's key takeaway says authenticator-app-only, but a mid-meeting quote says "phone, authenticator, passkey only" (matching the existing 2026-07-13 decision). These can't both be right. Recommend Bichesq check the Fathom transcript directly before this row is touched at all — no edit is proposed for it above pending that check.
2. **Help Desk V1 scope status** — treating the currently `Needs decision (scope vs. capacity)` Help Desk rows as effectively decided is an inference from "Eddie is building the Figma mockups now," not an explicit team vote recorded in either meeting. Flagging for an explicit yes/no rather than assuming it.
3. **Pre-login recruitment page** — a Sep 7 quote ("we'll put it right up on the website") is suggestive but not a clean restated decision; treating decision-log.md's row 46 as still `Open` rather than silently closing it.

## Risks / things that could go wrong

- Several of these are reversals of previously "Decided" rows that may already have hour estimates or Jira tickets built against the old behavior (e.g., reopen-ticket logic, hard profile gate). Anyone who already scoped those needs to be told before the doc changes land.
- `jira-import.csv` drifting from the table if the CSV regeneration follow-up is forgotten.

## Out of scope (explicitly deferred)

- Regenerating `jira-import.csv`.
- Resolving the Postgres-vs-NoSQL assessment-engine choice.
- Editing the MFA row until the transcript contradiction is checked.
- Reclassifying Help Desk rows from "Needs decision (scope vs. capacity)" to V1 without explicit confirmation.

---

## Revision log

- 2026-09-10: initial draft, covering the Aug 27 and Sep 7, 2026 Project Sync meetings.
