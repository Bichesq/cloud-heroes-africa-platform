# Cloud Heroes Africa Jira Mapping

> Purpose: translate Cloud Heroes Africa planning documents into a Jira structure the team can execute and review.  
> Last updated: 2026-08-12 to reflect the Learning Platform build phase, five-app architecture, Payload CMS removal, and decisions logged through 2026-08-06.

---

## 1. Why This Document Exists

The team agreed that planning documents should become the canonical source for Jira epics, stories, and subtasks so work stays organized instead of remaining scattered across meeting notes.[cite:2][cite:7]

This file translates the repo’s current documentation into an actionable Jira structure across the platform’s active and planned application surfaces.[cite:3][cite:5][cite:7]

It should be updated whenever a major planning decision, scope shift, or architecture change affects how work should be decomposed into Jira items.[cite:7]

---

## 2. Platform Architecture Summary

The platform is now structured into five separate application surfaces: Student Hub, Learning Platform, Learning Management, Administration, and Donor Hub.[cite:7]

The monorepo approach is confirmed, with a shared data store and shared authentication across the separate application surfaces.[cite:7]

Payload CMS has been explicitly abandoned for Student Hub and Learning Platform in favour of a custom backend using Postgres-oriented relational structures and shared APIs.[cite:5][cite:7]

| App Surface | Current Status | Primary Users |
|---|---|---|
| **Student Hub** | Active implementation track; V1 scope fixed around login, profile, dashboard, and calendar-related visibility decisions.[cite:7] | Students |
| **Learning Platform** | Now entering active build phase with dedicated requirements, schema, design evaluation, and open-decision artifacts in `docs/learning-platform/`.[page:1][cite:3][cite:5][cite:6] | Students |
| **Learning Management** | Defined as the content-authoring and program-management surface; not yet the primary active build stream.[cite:5][cite:7] | Volunteer instructors, content creators, staff |
| **Administration** | Confirmed module for student management, approved-email access control, Help Desk, Service Desk, and knowledge-base administration; may follow the core POC surfaces.[cite:7] | Admins |
| **Donor Hub** | Confirmed as a separate app surface but not part of the immediate POC core.[cite:7] | Donors |

### Cross-cutting architecture decisions

- **Monorepo** is confirmed for all platform surfaces.[cite:7]
- **Shared authentication** is confirmed across modules, with Google OAuth for student-facing entry and Microsoft SSO for Learning Management users.[cite:5][cite:7]
- **Student access control** uses an admin-managed approved-email list rather than invite codes or reCAPTCHA.[cite:7]
- **Hero UI** is the selected component library for the POC.[cite:7]
- **Design-before-build** and screen-by-screen requirements are part of the agreed workflow.[cite:7]

---

## 3. Jira Hierarchy

Use the following hierarchy for this project:

- **Epic** = a major user journey, platform surface, or enabling workstream
- **Story** = a specific page, workflow, API capability, backend capability, or infrastructure capability
- **Subtask** = a concrete implementation, validation, documentation, or testing task

### Rule of thumb

- If it spans multiple PRs and delivers a clear product or system outcome, it is probably an **Epic**.
- If it can be reviewed as one meaningful slice of functionality, it is probably a **Story**.
- If it contributes to a Story and should not ship independently, it is probably a **Subtask**.

---

## 4. Jira Source Documents

The following repo files should be treated as the authoritative source material for Jira creation.[page:1][cite:3][cite:5][cite:7]

| File | Primary Jira Use |
|---|---|
| `docs/decision-log.md` | Main source for confirmed decisions, working assumptions, blockers, and open questions |
| `docs/architecture.md` | High-level platform structure and early planning context |
| `docs/ai-workflow.md` | AI-assisted development process stories and workflow tasks |
| `docs/git-standards.md` | Collaboration, PR, and repository workflow tasks |
| `docs/student-hub/` | Student Hub requirements and screen-level breakdown |
| `docs/learning-platform/requirements/learning-platform-requirements.md` | Main Learning Platform functional requirements |
| `docs/learning-platform/requirements/system design.md` | Learning Platform system-design and backend-oriented breakdown |
| `docs/learning-platform/learning-platform-design-evaluation.md` | UI evaluation, state clarity, and design implementation guidance |
| `docs/learning-platform/open-decisions-for-team.md` | Decision checklist for unresolved or recently resolved Learning Platform issues |
| `docs/learning-platform/schema.sql` | Initial schema source for backend and API ticketing |
| `docs/repo-audit-2026-08-11.md` | Repo health and structural follow-up tasks where relevant |

### Archived or superseded sources

The following docs remain historically useful but should **not** drive new implementation stories directly without checking the decision log first:

- `docs/payload.md`
- `docs/payload-alignment-analysis.md`

Payload has been abandoned for Student Hub and Learning Platform, so any Jira items based on Payload assumptions should be treated as outdated unless explicitly repurposed.[cite:5][cite:7]

---

## 5. Current Planning Reality

The old Jira mapping reflected an earlier project phase centered on onboarding, invite verification, and broad planning setup.[cite:2]

That is no longer enough. The repo now contains dedicated Learning Platform requirements, schema work, design evaluation material, and a much more mature decision log covering content hierarchy, points gating, Knowledge Checks, assessments, data-light delivery, and integration boundaries.[page:1][cite:3][cite:5][cite:6][cite:7]

The Jira structure therefore needs to shift from “planning the platform” toward “building the active POC surfaces,” especially **Student Hub**, **Shared Auth**, **Learning Platform**, and the **shared backend/data model**.[cite:5][cite:7]

---

## 6. Recommended Epic Structure

### Epic 1: Repo, Standards, and AI Workflow

This epic covers the repo-level and workflow-level work that enables consistent execution across the team.[cite:7]

#### Candidate stories
- Formalize AI session handoff / resume workflow
- Document `handoff.md` or equivalent context-continuity pattern
- Formalize Claude prompt / design-engine documentation
- Keep Git commit and PR standards current
- Keep repo structure and documentation conventions current
- Maintain Obsidian / second-brain workflow integration

---

### Epic 2: Shared Authentication and Access Control

This epic covers the shared auth layer that all application surfaces depend on.[cite:5][cite:7]

#### Candidate stories
- Implement shared Google OAuth flow for students
- Implement approved-email list access check
- Define access-denied and registration redirect behavior
- Implement shared session/token handling across Student Hub and Learning Platform
- Implement Microsoft SSO path for Learning Management users
- Define auth middleware reusable across surfaces
- Define auth-related error handling and fallback states

---

### Epic 3: Student Hub V1

Student Hub remains the first core implementation slice and the main student-facing gateway into the wider platform.[cite:7]

#### Candidate stories
- Login page
- Profile page
- Dashboard page
- Calendar widget / dashboard event visibility
- Zero-state dashboard for unenrolled users
- Profile completion hard gate
- MFA management section
- Progress preview widget integrations
- Help Desk / Service Desk surface entry points
- Alerts and updates panel

### Notes for this epic
- Student access is gated by approved-email list, not invite codes.[cite:7]
- Profile completion is now a hard gate before full platform access.[cite:7]
- Calendar as a standalone V1 page is no longer the strongest priority; dashboard-level visibility matters more for the current scope.[cite:7]

---

### Epic 4: Learning Platform — Navigation and Core Content Delivery

This is now one of the most important active product-facing epics because the Learning Platform has dedicated requirements and is entering the build phase.[cite:3][cite:5]

#### Candidate stories
- Learning Platform top navigation
- Handshake transition from Student Hub into Learning Platform
- Program list view for enrolled learners
- Module view with progress summaries
- Unit list view with locked/unlocked state
- Unit content page scaffold
- Unit content renderer for text, code snippets, and static visuals
- Multiple-creator attribution model
- Notes tab
- Assignments tab
- Sidebar behavior and minimized state
- “Go to next item” flow
- Embedded Help button with contextual tagging

### Notes for this epic
- The Learning Platform is a **separate app** from Student Hub and Learning Management, with its own layout and navigation.[cite:5][cite:7]
- The canonical content hierarchy is **Program → Module → Unit**.[cite:5][cite:7]
- The unit experience follows a minimal-distraction design principle, with non-essential content moved into secondary tabs.[cite:5][cite:7]

---

### Epic 5: Learning Platform — Progress, Points, and Unlock Logic

This epic captures the platform-specific progression rules that now underpin the learning experience.[cite:5][cite:7]

#### Candidate stories
- Student-unit status model (`Completed`, `Competent / Verified`)
- Timestamp capture for unit completion
- Timestamp capture for competence / verification
- Points ledger design and implementation
- Unit unlock threshold logic
- Locked-unit messaging
- Progress summaries at program and module level
- Current-points and required-points display
- Goal-setting for unit completion deadlines
- Goals Meeting Streak calculation and storage
- Student Hub data exposure for streak widgets

### Notes for this epic
- The platform uses a **points-based access system** for unlocking new units.[cite:5][cite:7]
- Goals Meeting Streak is based on **consecutive deadlines met**, not logins.[cite:5][cite:7]

---

### Epic 6: Learning Platform — Knowledge Checks

Knowledge Checks are now clearly defined as distinct in-unit evaluation steps, separate from both unit content and standalone assessments.[cite:5][cite:7]

#### Candidate stories
- Knowledge Check data model
- Knowledge Check renderer
- MCQ / short-quiz V1 implementation
- Explanation display after submission
- Unlock-after-unit-completion logic
- Failure / retake flow
- Second-failure escalation workflow
- Unit retake status handling
- Instructor / team notification on repeated failure

### Notes for this epic
- Knowledge Checks are formative and can show correctness and explanation feedback.[cite:5][cite:7]
- The current working rule is first failure → retake, second failure → team follow-up.[cite:5][cite:7]

---

### Epic 7: Learning Platform — Standalone Assessments

This epic covers standalone assessments outside unit content, including module-end or program-level evaluation flows.[cite:5][cite:7]

#### Candidate stories
- Standalone assessment model
- Assessment attempt page
- Single-choice question support
- Multi-select question support
- Partial-credit scoring for multi-select questions
- Numbered question navigation grid
- Variable question-count support
- Weak-area feedback summary
- Retake cooldown logic
- Repeated-failure escalation
- Assessment randomization from question banks
- Difficulty-balance rules in assessment generation
- Practical submission placeholder architecture for post-V1
- Assessment result storage and reporting

### Notes for this epic
- August 6 decisions clarified that the assessment currently under discussion is a **module-end assessment**, not a unit-level Knowledge Check.[cite:7]
- During an assessment attempt, the UI must **not** show correct/incorrect answer feedback.[cite:7]
- V1 assessment question types are limited to **single-choice** and **multi-select**.[cite:7]
- Retake cooldowns are progressive: 1 hour, then 3 hours, then 24 hours.[cite:7]

---

### Epic 8: Learning Platform — Data-Light Delivery and Accessibility

This epic groups the technical and UX work tied to the platform’s low-bandwidth-first strategy.[cite:5][cite:7]

#### Candidate stories
- Local TTS trigger integration
- Browser-native TTS fallback strategy
- Static visuals / diagrams rendering pipeline
- Unit page accessibility pass
- Keyboard navigation support
- Alt-text support for instructional visuals
- Contrast and readability checks
- English-only V1 language assumptions
- Video-content extension path for post-V1

### Notes for this epic
- The platform’s main delivery strategy is **static visuals + local TTS**, with no streaming video and no stored audio files in the core model.[cite:5]
- Video was later accepted as a secondary delivery option beyond the written-content-first V1 path.[cite:7]

---

### Epic 9: Learning Management — Authoring and Publishing

Learning Management is the authoring surface that produces the structures consumed by the Learning Platform.[cite:5][cite:7]

#### Candidate stories
- Program authoring workflow
- Module authoring workflow
- Unit authoring workflow
- Learning material metadata management
- Knowledge Check authoring
- Standalone assessment authoring
- Exam Readiness assessment authoring
- Publishing workflow for programs/modules/units
- Permission model for creators / collaborators / read-only roles
- Program ownership and admin override rules

### Notes for this epic
- Learning Management owns the design and management of programs, modules, units, assessments, and learning materials.[cite:5][cite:7]
- Learning Platform consumes published outputs from Learning Management and writes back learner progress and status data.[cite:5]

---

### Epic 10: Shared Backend, Data Model, and APIs

This epic captures the backend work needed to support multiple front-ends on a shared data model.[cite:5][cite:7]

#### Candidate stories
- Core relational model for programs, modules, and units
- Knowledge Check schema
- Standalone assessment schema
- Student progress and competence tables
- Points ledger schema
- Goal deadline and streak schema
- Exam Readiness schema
- Help-context snapshot schema
- JSON/JSONB structures for flexible question definitions and rubrics
- Shared API conventions across surfaces
- Student Hub read APIs for progress, streak, and readiness
- Learning Platform write APIs for completion, competence, and points
- Learning Management publish and retrieval APIs

### Notes for this epic
- The Learning Platform requirements assume a **custom backend using Postgres** and flexible JSON/JSONB fields where appropriate.[cite:5]
- The decision log still keeps **Postgres vs NoSQL** as an open architecture decision needing final resolution before the data model is fully locked.[cite:7]

---

### Epic 11: Infrastructure and Demo Environment

This epic captures the infrastructure required to make the POC real, demoable, and maintainable.[cite:7]

#### Candidate stories
- Define minimal infrastructure for live demo
- Define deployment path for monorepo surfaces
- Shared environment variable strategy
- CI/CD path for POC builds
- Logging and monitoring baseline
- Notification provider choices
- Demo hosting fallback before full production infra
- Demo data seeding strategy

---

### Epic 12: Stakeholder Demo and Testing Readiness

The team explicitly wants a reviewable, demoable product slice for stakeholder walkthroughs and feedback.[cite:7]

#### Candidate stories
- Define first live demo scope
- Define what is mocked vs real
- Demo walkthrough script
- Internal QA checklist
- External tester onboarding
- Feedback capture and triage process
- Board/stakeholder presentation checklist

---

## 7. Story Writing Rules

Each Jira story should be understandable without requiring the full meeting history.[cite:2][cite:7]

### Every story should include
- Title
- Description
- Why it matters
- Acceptance criteria
- Dependencies
- Open questions
- Linked documentation
- Owner, if known

### Good story qualities
- Small enough to review clearly
- Large enough to produce a meaningful outcome
- Tied to one Epic
- Tied to a current requirement or decision
- Testable in a PR review, QA pass, or walkthrough

---

## 8. Subtask Categories

For most implementation stories, use a repeatable subtask structure.

### Common subtask types
- Requirements clarification
- UI scaffold
- UI implementation
- State implementation (`not started`, `in progress`, `completed`, etc.)
- Validation rules
- API contract definition
- Backend route or service implementation
- Database/schema changes
- Error handling
- Loading / empty / success states
- Accessibility pass
- Test coverage
- Documentation update
- Demo verification
- PR review and cleanup

### Example subtask pattern for a Learning Platform page story

For a story like **Unit Content Page**, use subtasks such as:

- Confirm required content fields
- Confirm state variants and access rules
- Build page UI scaffold
- Implement content rendering
- Implement tabs and secondary content panels
- Connect backend data
- Add points/lock-state handling
- Add Help button contextual metadata
- Add loading / error / empty states
- Add tests
- Update docs if assumptions change

---

## 9. Current Board Priority

The board should now reflect the current build reality rather than the original planning-only phase.[cite:3][cite:5][cite:7]

| Epic | Priority | Why |
|---|---|---|
| Shared Authentication and Access Control | **Critical** | Shared auth is foundational for Student Hub and Learning Platform.[cite:5][cite:7] |
| Student Hub V1 | **Highest** | Still part of the core POC and gateway into the wider platform.[cite:7] |
| Learning Platform — Navigation and Core Content Delivery | **Highest** | This is the current active build phase with dedicated documentation now in the repo.[page:1][cite:3][cite:5] |
| Learning Platform — Progress, Points, and Unlock Logic | **High** | Core to learner flow and gating behavior.[cite:5][cite:7] |
| Learning Platform — Knowledge Checks | **High** | Clearly defined and tied directly to unit progression.[cite:5][cite:7] |
| Learning Platform — Standalone Assessments | **High** | Many rules are now decided, but schema and authoring details still need careful Jira breakdown.[cite:6][cite:7] |
| Shared Backend, Data Model, and APIs | **High** | Blocks multiple front-end stories and integration work.[cite:5][cite:7] |
| Infrastructure and Demo Environment | **High** | Needed to demonstrate progress credibly.[cite:7] |
| Learning Management — Authoring and Publishing | **Medium** | Important, but not the immediate student-facing build focus.[cite:5][cite:7] |
| Stakeholder Demo and Testing Readiness | **Medium** | Becomes critical as soon as the first integrated slice exists.[cite:7] |
| Repo, Standards, and AI Workflow | **Medium** | Mostly established, but still needs maintenance and formalization gaps filled.[cite:7] |

---

## 10. Open Decisions That Directly Affect Jira Readiness

Some important areas are still open in the decision log and should be represented explicitly in Jira using labels like `decision-needed` or `blocked`.[cite:6][cite:7]

| Open Decision | Affected Epic(s) | Why It Matters |
|---|---|---|
| Postgres vs NoSQL final selection | Epic 10, plus backend-dependent LP stories | Final schema strategy should not drift while implementation begins.[cite:7] |
| Assessment content schema and answer-storage model | Epic 7, Epic 10 | August 6 clarified behavior, but the authoring/data model is still open.[cite:7] |
| Difficulty-mix rules for randomized assessments | Epic 7 | Needed for fair assessment generation.[cite:7] |
| Advanced student bypass mechanism | Epic 5, Epic 7 | Affects unlock logic and progression rules.[cite:5][cite:7] |
| Placement assessment location | Epic 2, Epic 4, Epic 7 | Affects the boundary between onboarding and learning flow.[cite:5][cite:7] |
| Badges and gamification scope | Epic 3, Epic 5 | Affects Student Hub previews and LP progression display.[cite:5][cite:7] |
| Help Desk submission UX / branching logic | Epic 4, Epic 10 | Affects how embedded help in LP routes requests.[cite:5][cite:7] |
| Student vetting process feeding approved-email list | Epic 2, Administration-related stories | Affects operational access-control workflow.[cite:7] |
| Pre-login page necessity / login-path consolidation | Epic 3 | Affects Student Hub entry design.[cite:7] |

---

## 11. Recommended Labels

Use labels to make the board easier to filter.

### Suggested labels
- `planning`
- `docs`
- `frontend`
- `backend`
- `api`
- `schema`
- `auth`
- `student-hub`
- `learning-platform`
- `learning-management`
- `administration`
- `donor-hub`
- `ai-workflow`
- `infra`
- `demo`
- `testing`
- `decision-needed`
- `blocked`
- `v1`
- `post-v1`
- `accessibility`
- `low-bandwidth`
- `assessment`
- `knowledge-check`

---

## 12. Definition of Ready

A Jira story is ready when:

- the user or system goal is clear,
- linked repo documentation exists,
- acceptance criteria are present,
- dependencies are known,
- relevant open decisions are visible,
- and the ticket does not depend on hidden assumptions.[cite:2][cite:7]

A story should **not** be marked ready if it depends on a decision still listed as Open in the decision log and that decision materially affects implementation.[cite:7]

---

## 13. Definition of Done

A Jira item is done when:

- the scoped work is implemented or documented,
- acceptance criteria are satisfied,
- related docs are updated,
- the result is reviewable by the team,
- and the work fits the agreed repo workflow and standards.[cite:2][cite:7]

For demo-facing stories, “done” should also mean the flow is understandable and stable enough to survive a walkthrough without explanation-heavy rescue from the presenter.[cite:7]

---

## 14. Documentation-to-Jira Conversion Process

Use this process after each major planning update.

### Step 1
Update `docs/decision-log.md` with the latest decisions.[cite:7]

### Step 2
Update the surface-specific requirements file, such as:
- `docs/student-hub/...`
- `docs/learning-platform/requirements/...`[page:1][cite:3][cite:5]

### Step 3
Highlight:
- new pages,
- new flows,
- new APIs,
- new schema changes,
- new infrastructure needs,
- and unresolved questions.[cite:5][cite:7]

### Step 4
Convert major workstreams into Epics.[cite:2][cite:7]

### Step 5
Convert each page, workflow, API, backend capability, or integration boundary into Stories.[cite:5][cite:7]

### Step 6
Create implementation subtasks using the repeatable pattern in Section 8.

### Step 7
Link each Jira item back to the exact repo document section that justified it.[cite:2][cite:5][cite:7]

### Step 8
Mark open assumptions and blockers clearly using labels such as `decision-needed` or `blocked`.[cite:7]

---

## 15. Recommended Immediate Jira Actions

1. Replace the old Jira board structure that is still centered on early onboarding-era planning assumptions.[cite:2]
2. Create or refresh epics for:
   - Shared Authentication and Access Control
   - Student Hub V1
   - Learning Platform — Navigation and Core Content Delivery
   - Learning Platform — Progress, Points, and Unlock Logic
   - Learning Platform — Knowledge Checks
   - Learning Platform — Standalone Assessments
   - Shared Backend, Data Model, and APIs[page:1][cite:3][cite:5][cite:7]
3. Ticket the Learning Platform first around the **Program → Module → Unit** flow, unit content view, points gating, and help integration, because those are now clearly documented.[cite:5]
4. Create blocked assessment stories now, but mark them with `decision-needed` where the data model or authoring structure is still unresolved.[cite:6][cite:7]
5. Review all older tickets that still mention invite codes, reCAPTCHA, or Payload CMS assumptions, and either rewrite or close them as outdated.[cite:7]