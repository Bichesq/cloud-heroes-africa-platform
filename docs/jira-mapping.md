# Cloud Heroes Africa Jira Mapping

> Purpose: translate Cloud Heroes Africa planning documents into a Jira structure the team can execute and review.

---

## 1. Why This Document Exists

The team agreed that the next planning session should produce detailed documentation covering platform flow, page requirements, APIs, infrastructure, design system direction, and the team’s Claude workflow. That documentation is expected to become the basis for Jira epics, stories, and subtasks so work can be organized cleanly instead of staying as loose meeting notes. [page:1]

Harriet was specifically identified as the person who may help turn the documentation into Jira items, which means the repo documents need to be structured in a way that is easy to decompose into actionable tickets. [page:1]

---

## 2. Jira Hierarchy

Use the following hierarchy for this project:

- **Epic** = a major user journey, platform surface, or enabling workstream
- **Story** = a specific page, workflow, API capability, or infrastructure capability
- **Subtask** = a concrete implementation, validation, documentation, or testing task

### Rule of thumb
- If it takes multiple PRs and spans a clear user or system outcome, it is probably an Epic.
- If it can be reviewed as one meaningful slice of functionality, it is probably a Story.
- If it is a component of a Story and should not ship independently, it is probably a Subtask.

---

## 3. Jira Source Documents

The following repo files should be treated as Jira source material:

- `docs/architecture.md`
- `docs/ai-workflow.md`
- `docs/git-standards.md`
- `docs/decision-log.md`
- `prompts/claude-project-template.md`

### How they map
- `docs/architecture.md` -> main source for epics, stories, dependencies, and open questions
- `docs/ai-workflow.md` -> process stories, experiment stories, and documentation subtasks
- `docs/git-standards.md` -> dev process tasks, PR standards, and workflow subtasks
- `docs/decision-log.md` -> assumptions, blockers, pending decisions, and governance tasks
- `prompts/claude-project-template.md` -> AI-assisted implementation workflow tasks

---

## 4. Recommended Epic Structure

Based on the current meeting discussion, the first Jira board should likely begin with these epics. The exact names can be refined, but the structure should stay close to the planning flow. [page:1]

### Epic 1: Project Planning and Architecture
This covers the work needed to turn the current project concept into documented implementation-ready requirements.

#### Candidate stories
- Create and refine architecture document
- Review flow artifacts and page inventory
- Define page-by-page requirements
- Define initial API map
- Define initial data model areas
- Define infrastructure assumptions
- Define design system direction
- Resolve one-app vs multi-app decision
- Resolve one-repo vs multi-repo decision

---

### Epic 2: Repo and Collaboration Setup
This covers the central repository, standards, and workflow needed for the team to work consistently.

#### Candidate stories
- Create repo documentation skeleton
- Define Git commit standards
- Define pull request standards
- Define contribution workflow
- Define experiment branch/fork workflow
- Set up repo structure for docs, prompts, apps, and packages if needed

---

### Epic 3: Claude and AI Workflow Setup
This covers the AI-assisted development process the team wants to standardize.

#### Candidate stories
- Define Claude project workflow
- Create Claude prompt templates
- Define session start rules
- Define session stop/resume rules
- Define token/context management guidelines
- Define multi-agent experiment process
- Document how alternate approaches should be tested and reviewed

---

### Epic 4: Onboarding and Access Flow
This is the strongest candidate for the first product-facing implementation epic because the meeting explicitly called out login, registration, invite verification, and assessment as the planning focus. [page:1]

#### Candidate stories
- Login page
- Registration page
- Invite code verification page
- Invite verification API
- Invite code delivery rules
- reCAPTCHA integration decision
- Auth/session handling
- Error and edge-case handling for onboarding

---

### Epic 5: Assessment Flow
The assessment was explicitly called out as a core part of the initial planning and data discussion. [page:1]

#### Candidate stories
- Define assessment questions
- Design assessment page
- Assessment submission API
- Assessment response storage model
- Assessment result/next-step logic
- Admin visibility into assessment completion
- Error handling and resume behavior for assessment flow

---

### Epic 6: User Dashboard and Post-Onboarding Flow
Once a user completes onboarding, there needs to be a meaningful destination for the demo.

#### Candidate stories
- Define minimal dashboard requirements
- Create initial authenticated landing/dashboard page
- Show onboarding completion state
- Show next recommended actions
- Load user-specific data
- Handle incomplete onboarding states

---

### Epic 7: Infrastructure and Demo Environment
The meeting made it clear that infrastructure needs should be planned alongside the interface and API work, and that the team wants to be able to demo the app on a smaller environment even before AWS approval. [page:1]

#### Candidate stories
- Decide demo hosting approach
- Define backend hosting direction
- Define database approach
- Define object storage requirements
- Investigate email/SMS provider options
- Investigate reCAPTCHA pricing and fit
- Define monitoring/logging approach
- Define CI/CD path for early demo builds

---

### Epic 8: Stakeholder Demo and Testing Readiness
This epic captures the team’s stated intent to show progress to Yannick, Samoa, Enda, and possibly recruit outside testers. [page:1]

#### Candidate stories
- Define demo scope
- Build demo checklist
- Identify what is mocked vs real
- Prepare stakeholder walkthrough flow
- Prepare feedback capture process
- Recruit and onboard external testers
- Collect and triage feedback

---

## 5. Story Writing Rules

Each Jira story should be written so it can be implemented, reviewed, and discussed without needing the whole meeting transcript.

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
- Small enough to review
- Large enough to produce a meaningful outcome
- Clearly tied to one Epic
- Linked to a real platform requirement
- Testable or reviewable in a demo or PR

---

## 6. Subtask Categories

For most implementation stories, subtasks should be created from a repeatable pattern.

### Common subtask types
- Requirements clarification
- UI scaffold
- UI implementation
- Validation rules
- API contract definition
- Backend route or service implementation
- Database/schema changes
- Error handling
- Loading/empty/success states
- Test coverage
- Documentation update
- Demo verification
- PR review and cleanup

### Example subtask pattern for a page story
For a story like **Registration Page**, use subtasks such as:
- Confirm required fields
- Define validation rules
- Build page UI scaffold
- Implement form submission
- Connect backend route
- Add success and error states
- Add tests
- Update architecture or decision docs if assumptions changed

---

## 7. Cloud Heroes First Board Proposal

This is a recommended starting board structure based on what the team discussed.

| Epic | Initial Priority | Why |
|---|---|---|
| Project Planning and Architecture | Highest | This is the prerequisite for the rest of the work [page:1] |
| Repo and Collaboration Setup | Highest | Needed so Bichesq can lead the central repo and others can collaborate safely [page:1] |
| Claude and AI Workflow Setup | Highest | The team wants the docs to become the project context for Claude [page:1] |
| Onboarding and Access Flow | High | Registration, login, invite verification were explicitly named [page:1] |
| Assessment Flow | High | Assessment was explicitly named as a planning target [page:1] |
| User Dashboard and Post-Onboarding Flow | Medium | Needed for a convincing demo destination [page:1] |
| Infrastructure and Demo Environment | High | The app must be demoable before AWS approval [page:1] |
| Stakeholder Demo and Testing Readiness | Medium | Important once the first usable slice exists [page:1] |

---

## 8. Example Epic-to-Story Breakdown

### Epic: Onboarding and Access Flow

#### Story 1: Registration Page
**Description:** Create the first-pass registration experience for new users entering the platform.  
**Acceptance criteria:**
- Required fields are defined
- Validation rules are documented
- Success and error states are handled
- The page is linked to the planned onboarding flow

#### Story 2: Login Page
**Description:** Create the login experience for returning users.  
**Acceptance criteria:**
- Login form is implemented or scaffolded
- Error states are handled
- Session behavior is defined for the current build stage

#### Story 3: Invite Code Verification
**Description:** Create the screen and logic for verifying invite-based access.  
**Acceptance criteria:**
- Input rules are defined
- Verification response behavior is defined
- Edge cases such as invalid/expired invite are handled

#### Story 4: Invite Verification API
**Description:** Implement or mock the endpoint required to validate invite codes.  
**Acceptance criteria:**
- Request and response shape are documented
- Error responses are predictable
- Dependencies are noted

#### Story 5: reCAPTCHA Decision
**Description:** Investigate whether Google reCAPTCHA or another approach should be used in onboarding.  
**Acceptance criteria:**
- Provider options reviewed
- Cost considerations noted
- Recommendation documented in repo

---

## 9. Example Story-to-Subtask Breakdown

### Story: Assessment Flow

#### Suggested subtasks
- Define assessment purpose
- Draft question categories
- Define assessment page structure
- Define API request/response
- Define response storage approach
- Define post-assessment routing logic
- Define admin visibility requirements
- Document unresolved questions

This matters because the meeting specifically called out the need to determine what questions are asked, how responses are stored, and how the system should behave around that flow. [page:1]

---

## 10. Documentation-to-Jira Conversion Process

Use this process after each major planning update.

### Step 1
Update `docs/architecture.md` with the latest decisions.

### Step 2
Highlight:
- new pages,
- new flows,
- new APIs,
- new infrastructure needs,
- and unresolved questions.

### Step 3
Convert major areas into Epics.

### Step 4
Convert each page, API, or capability into Stories.

### Step 5
Create subtasks for:
- UI work
- backend work
- schema work
- testing
- docs
- demo readiness

### Step 6
Link every Jira item back to the relevant repo document section.

### Step 7
Mark open assumptions clearly so implementation is not blocked by hidden ambiguity.

---

## 11. Labeling Suggestions

Use labels to make the board easier to filter.

### Suggested labels
- `planning`
- `docs`
- `ai-workflow`
- `repo-setup`
- `frontend`
- `backend`
- `api`
- `infra`
- `demo`
- `testing`
- `decision-needed`
- `blocked`
- `experiment`

---

## 12. Definition of Ready

A Jira story is ready when:
- the user/system goal is clear,
- linked documentation exists,
- acceptance criteria are present,
- major dependencies are known,
- and unresolved questions are visible.

A story should **not** be marked ready if it still depends on undocumented assumptions.

---

## 13. Definition of Done

A Jira item is done when:
- the scoped work is implemented or documented,
- acceptance criteria are satisfied,
- related docs are updated,
- changes are committed through the agreed repo workflow,
- and the result is reviewable by the team.

For demo-facing items, “done” should also mean the flow is understandable during a walkthrough.

---

## 14. Open Jira Questions

These should be settled soon:
- Should the team use one board or multiple boards?
- Should infra and product work live together or separately?
- Which epic should Harriet start with first?
- Should experiment work be tracked in Jira or only in Git branches?
- How should blocked decisions be represented? [page:1]

---

## 15. Recommended Immediate Jira Actions

1. Create the first board for Cloud Heroes Africa platform planning and delivery.
2. Add the eight starter epics from this document.
3. Create initial stories under:
   - Project Planning and Architecture
   - Repo and Collaboration Setup
   - Claude and AI Workflow Setup
   - Onboarding and Access Flow
4. Link each story to the matching section in `docs/architecture.md`.

