# Cloud Heroes Africa Platform Architecture

> Cloud Heroes Africa platform planning document  
> Version: Initial working draft  
> Owner: Bichesq Bijengsi  
> Status: Pre-planning draft for team working session

---

## 1. Context

Cloud Heroes Africa is moving from a learning-first phase into a build-first phase so the team can gain practical AI-assisted software development experience, avoid losing momentum while AWS approval is still pending, and prepare a working demo that can be shown to the board and early testers. The team agreed that the next session should focus on creating a detailed project plan, identifying flow requirements page by page, defining APIs, clarifying infrastructure needs, and using that documentation as the structured project context for Claude. [page:1]

This is a special project context because the team itself is effectively part of the user base, which means the platform can be pre-built and tested internally before formal funding is approved. The intent is to arrive at a proposal or board meeting with something demonstrable rather than only a concept document. [page:1]

---

## 2. Current Working Goals

### Primary goals
- Create a full planning skeleton for the Cloud Heroes Africa platform.
- Break down the application flow page by page.
- Identify required frontend behavior, backend APIs, and infrastructure for each part of the system.
- Standardize how the team will use Claude to build and refine the platform.
- Keep all central progress in a shared repository led by Bichesq.
- Make it possible for contributors to fork or branch and test alternate AI-assisted approaches.
- Prepare a working demo to show Yannick, Samoa, Enda, and other stakeholders.
- Recruit some external testers for early feedback after an initial build exists.

### Immediate success criteria
- The team can walk into the next planning session with a repo and documentation skeleton already created.
- The documentation is detailed enough to guide Claude in generating an initial scaffold.
- The docs can later be turned into Jira epics, stories, and subtasks.
- The repo structure supports both central implementation and parallel experimentation. [page:1]

---

## 3. Product Intent

### Working product definition
Cloud Heroes Africa Platform is a community-centered digital platform intended to support the Cloud Heroes Africa ecosystem. At this stage, the exact final shape may still become one application or multiple applications, but the current assumption is that the system may include multiple surfaces and should be planned in a way that allows reassessment before implementation goes too far. [page:1]

### What this first planning effort is trying to prove
- The platform concept can be translated into a coherent technical plan.
- The team can use AI-assisted workflows in a structured and collaborative way.
- The repo can act as the central source of truth for development direction.
- A usable demo can be produced before formal infrastructure funding is approved. [page:1]

---

## 4. Working Scope Assumptions

These are planning assumptions, not final locked decisions.

### Assumptions currently in play
- The platform may involve more than one application surface.
- The team currently suspects there may be roughly three application areas, but this must be reassessed in planning.
- The first build should prioritize the flows already identified in existing diagrams and team discussions.
- The first output does not need to be the full final system; it needs to be a meaningful working demo.
- Some services may be mocked or simplified in the initial build to accelerate progress.
- The design system, invite code flow, reCAPTCHA choice, assessment flow, and infrastructure details still need explicit definition. [page:1]

### Out-of-scope for now
- Full production hardening before the core flow is proven.
- Final board-driven feature expansion before an internal baseline exists.
- Over-engineering around infrastructure before the main demo path is defined. [page:1]

---

## 5. Key Stakeholders

| Stakeholder | Role in Project | Current Relevance |
|---|---|---|
| Bichesq Bijengsi | Lead developer, central repo owner, implementation lead | Drives repo updates and technical direction [page:1] |
| Kris Fernando | Facilitator of process and planning direction | Proposed the build-first planning approach and repo-centered workflow [page:1] |
| Harriet | Jira breakdown support | Expected to convert planning docs into stories and subtasks [page:1] |
| Team members | Collaborators and experimenters | Can observe, fork, branch, test alternate approaches, and share findings [page:1] |
| Yannick, Samoa, Enda | Board/stakeholder audience | Expected audience for the working demo/proposal review [page:1] |
| External testers | Fresh evaluators outside the immediate team | Can provide early feedback on usefulness and usability [page:1] |

---

## 6. Core Delivery Strategy

### Agreed working model
- The team will first document the product in detail.
- That documentation will become the structured prompt context for Claude.
- Bichesq will lead development in the central repository.
- Contributors may test alternate ideas in forks or branches.
- Findings from experiments can be reviewed and merged into the central direction if useful.
- Work should continue even while AWS approval is pending so time is not lost. [page:1]

### Why this strategy makes sense
The meeting made it clear that waiting for AWS approval before building would stall momentum and waste valuable learning time. Pre-building gives the team practical experience, accelerates decision-making, and creates a stronger position for stakeholder review. [page:1]

---

## 7. Proposed System Surfaces

This section is intentionally framed as a planning hypothesis because the number of applications is still under discussion.

### Working hypothesis
The platform may include the following major surfaces:

1. Public/entry surface  
   - Landing or welcome experience  
   - Login and registration  
   - Invite code verification  
   - General introduction to the platform

2. User onboarding and assessment surface  
   - Registration completion  
   - Invite workflow  
   - Assessment screens  
   - Initial qualification or routing logic

3. Main application/dashboard surface  
   - Authenticated platform experience  
   - User dashboard  
   - Role-specific features  
   - Administrative or community actions

### Open question
Should these live inside one application, one monorepo with multiple apps, or separate repositories? This is still unresolved and should be decided during planning. [page:1]

---

## 8. Priority Demo Path

The team should optimize around a clear demo path rather than trying to make every future feature production-complete.

### Recommended first demo flow
1. User reaches the platform.
2. User registers or begins onboarding.
3. User verifies an invite code.
4. User completes an assessment or qualification step.
5. User reaches an authenticated dashboard or next-step screen.
6. Team can demonstrate how admin logic, workflow routing, or supporting APIs connect behind the scenes.

### Why this path
The meeting repeatedly referenced login, registration, invite code verification, assessment, design system decisions, API design, and infrastructure planning as the concrete pieces to work through next. That makes onboarding plus assessment the strongest initial planning and demo slice. [page:1]

---

## 9. User Roles

These should be refined in the next team session.

| Role | Working Description | Key Needs | Notes |
|---|---|---|---|
| Visitor | Person arriving at the platform without an account | Understand purpose, register, sign in | Public-facing entry point |
| Invited user | Person entering through an invite-driven onboarding flow | Verify invite, continue registration | Invite code rules still undefined [page:1] |
| Learner/member | Primary user moving through onboarding and platform usage | Assessment, dashboard, next actions | Exact terminology should be standardized |
| Admin | Internal operator managing users, flows, and possibly content | Oversight, status tracking, intervention tools | Admin scope still needs detailing |
| Reviewer/board stakeholder | Person viewing progress or demo outcomes | Demo clarity, confidence in direction | Not necessarily a day-to-day platform user |
| External tester | Fresh evaluator brought in for usability feedback | Guided test path, feedback collection | Mentioned as a near-term validation path [page:1] |

---

## 10. Page Inventory

This list is based on explicit discussion in the meeting and should be expanded from the Excalidraw or other flow artifacts in the next session. [page:1]

| Page / Screen | Purpose | Current Notes |
|---|---|---|
| Landing / Intro | Introduce platform and route user into auth flow | Optional in demo depending on time |
| Login | Existing or returning user access | Explicitly mentioned in planning discussion [page:1] |
| Registration | New user onboarding entry | Explicitly mentioned in planning discussion [page:1] |
| Invite Code Verification | Validate access path | Email vs SMS flow still undecided [page:1] |
| Assessment | Collect responses and determine next routing | Questions and storage model still undefined [page:1] |
| Post-assessment transition | Direct user to next experience | Could be confirmation, dashboard, or queue state |
| User dashboard | Main authenticated experience | Needed for demo completeness |
| Admin/review surface | Internal visibility or management | Optional for demo if backend view is enough |

### Add from source flow artifacts
- Review Excalidraw and existing team diagrams.
- Add every page already represented there.
- Mark each page as required for v1 demo, later demo, or future phase. [page:1]

---

## 11. Page-Level Planning Template

Use this for each page during the planning session.

### Example fields
- Page name
- User type
- Primary goal
- Required UI components
- Required validations
- Inputs collected
- API calls required
- Success state
- Error state
- Loading state
- Empty state
- Security concerns
- Analytics or event tracking needs
- Dependencies
- Open questions

This structure supports both implementation planning and later Jira decomposition. Harriet is expected to translate the resulting detail into stories and subtasks. [page:1]

---

## 12. API Planning Areas

The meeting explicitly called for identifying the APIs needed to support the planned pages, so API design should be one of the first major planning outputs. [page:1]

### Initial API areas
- Authentication
  - Register user
  - Log in user
  - Log out user
  - Session validation

- Invite management
  - Verify invite code
  - Check invite expiration
  - Bind invite to email, phone, or account
  - Reissue or resend invite if needed

- Assessment
  - Fetch assessment definition
  - Submit assessment responses
  - Validate response completeness
  - Store and retrieve outcomes

- User profile and progression
  - Fetch user profile
  - Fetch onboarding status
  - Update onboarding progress
  - Determine next route after assessment

- Admin or internal support
  - View invite status
  - View assessment completion state
  - View user onboarding state

### API questions to answer
- Should the first version be REST-based?
- What auth pattern should be used?
- What validation library or contract pattern should be standardized?
- What shape should error responses follow?
- Which endpoints can be mocked in the first demo? [page:1]

---

## 13. Data Model Areas

These are preliminary entity candidates based on the discussed flows.

### Likely entities
- User
- UserProfile
- InviteCode
- InviteDelivery
- Assessment
- AssessmentQuestion
- AssessmentResponse
- AssessmentResult
- Session
- Role
- AuditEvent

### Example design questions
- Is an invite tied to a person, an email, a phone number, or a reusable code?
- Does assessment data need scoring, categorization, or manual review?
- How should onboarding state be stored?
- Which fields are required for a minimal demo?
- What data should be considered sensitive from day one? [page:1]

---

## 14. Infrastructure Areas

The team wants to discuss infrastructure at the same time as interface and API design, because infrastructure decisions affect what Claude should generate and how realistic the demo can be. [page:1]

### Areas to define
- Frontend hosting
- Backend hosting
- Database
- Object/file storage
- Email service
- SMS provider if needed
- reCAPTCHA provider
- Monitoring/logging
- CI/CD
- Secrets management
- Demo hosting approach on a smaller server or simplified environment

### Explicit investigation items from the meeting
- Google reCAPTCHA options and cost
- Invite delivery method: email, text message, or both
- What infrastructure is required for each API to function
- What minimum stack is enough for a live demo before AWS approval [page:1]

---

## 15. Design System Direction

The meeting stated that the team wants to define the design system explicitly and include it in the planning materials before asking Claude to generate major parts of the application. [page:1]

### Design system questions
- What design system or UI style should the platform use?
- Are there existing reference apps or component libraries to align to?
- What does accessibility mean for this platform at MVP stage?
- Which UI components are required for the onboarding flow?
- What should Claude be told about layout, forms, validation, states, and responsiveness?

### Deliverable for planning
A documented design direction that can be included directly in Claude prompts.

---

## 16. AI-Assisted Development Workflow

The platform is intended to be built using Claude as part of the core workflow, but the team also wants to be intentional about session length, prompt structure, token usage, and how work resumes across sessions. [page:1]

### Agreed workflow principles
- Start from clear documentation, not vague prompts.
- Build in bounded tasks rather than giant all-in-one sessions.
- Commit progress continuously to the repo.
- Treat the central repo as the canonical implementation path.
- Allow side experiments through forks or branches.
- Share findings and merge useful improvements back into the main direction.

### Questions the team wants to solve
- How should Claude sessions be structured?
- When should a coding session be stopped and resumed later?
- How can context be preserved without growing too large?
- When should multi-agent or different skill-based approaches be tried?
- How should subscription and token limitations shape workflow design? [page:1]

---

## 17. Git and Collaboration Standards

The meeting explicitly called for standardizing Git commit wording, PR wording, and the general collaboration process around the Cloud Heroes Africa app. [page:1]

### Working standards
- Bichesq leads the main branch direction.
- Major work should be committed to the central repo.
- Alternate approaches should happen in controlled forks or branches.
- Commit messages should use a consistent pattern.
- PRs should explain intent, AI usage, and review focus.
- Contributors should be able to learn by trying alternate approaches without destabilizing the central implementation.

### Why this matters
The project is both a product build and a team learning exercise, so consistent process is part of the deliverable, not just a nice-to-have. [page:1]

---

## 18. Jira Conversion Strategy

The team expects the planning documentation to become the raw material for Jira items, especially once the next working session fills in more detail. Harriet was specifically identified as someone who may turn the resulting documentation into stories and subtasks. [page:1]

### Suggested mapping
- Major user journeys -> Epics
- Pages or API capabilities -> Stories
- UI tasks, endpoint tasks, schema tasks, and testing tasks -> Subtasks

### Examples
- Epic: User Onboarding
- Story: Registration page
- Story: Invite code verification flow
- Story: Assessment definition and submission
- Story: Authenticated dashboard entry
- Subtasks: UI, validation, backend endpoint, schema, test coverage, error states

---

## 19. Risks and Constraints

### Current risks
- AWS approval is still pending.
- Product scope may expand too early if not controlled.
- The number of applications or repos is still unclear.
- Some required business rules are not yet documented.
- AI-generated code quality may vary if prompts are too broad.
- Team experimentation could create divergence unless the repo process is disciplined. [page:1]

### Current opportunities
- The team already has subscriptions and can begin now.
- The team can gain real implementation practice instead of waiting.
- A working demo can improve stakeholder confidence.
- Internal and external testers can provide fast feedback.
- The process itself can teach the team better AI-assisted engineering habits. [page:1]

---

## 20. Open Questions

These should be answered in the next planning session.

1. Is the platform one application, three applications, or something in between?
2. Should this be one repo, a monorepo, or multiple repos?
3. What exact flow from the existing diagrams will be used as the first demo path?
4. How should invite codes work: email, SMS, or both?
5. Will reCAPTCHA be used, and if so which provider and pricing tier?
6. What exact questions belong in the assessment?
7. How should assessment answers be stored and used?
8. What is the minimum viable dashboard after onboarding?
9. What should be mocked for the first demo?
10. What should be shown to the board before broad user testing begins? [page:1]

---

## 21. Immediate Next Actions

- Review and import the current Excalidraw or other flow diagrams into planning discussion.
- Expand the page inventory based on actual flow artifacts.
- Decide whether the platform structure is one app or multiple apps.
- Fill out page-level requirements for the onboarding and assessment flow first.
- Define the first-pass API list.
- Decide invite code delivery rules.
- Investigate reCAPTCHA options and costs.
- Define a first-pass design system direction.
- Convert completed planning outputs into Claude-ready prompts.
- Break documented requirements into Jira epics, stories, and subtasks.
- Start initial scaffold generation in the repo under Bichesq's lead. [page:1]

---

## 22. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-18 | Created Cloud Heroes-specific architecture first draft from project sync discussion | Bichesq / AI-assisted draft |

EOFcat > docs/architecture.md <<'EOF'
# Cloud Heroes Africa Platform Architecture

> Cloud Heroes Africa platform planning document  
> Version: Initial working draft  
> Owner: Bichesq Bijengsi  
> Status: Pre-planning draft for team working session

---

## 1. Context

Cloud Heroes Africa is moving from a learning-first phase into a build-first phase so the team can gain practical AI-assisted software development experience, avoid losing momentum while AWS approval is still pending, and prepare a working demo that can be shown to the board and early testers. The team agreed that the next session should focus on creating a detailed project plan, identifying flow requirements page by page, defining APIs, clarifying infrastructure needs, and using that documentation as the structured project context for Claude. [page:1]

This is a special project context because the team itself is effectively part of the user base, which means the platform can be pre-built and tested internally before formal funding is approved. The intent is to arrive at a proposal or board meeting with something demonstrable rather than only a concept document. [page:1]

---

## 2. Current Working Goals

### Primary goals
- Create a full planning skeleton for the Cloud Heroes Africa platform.
- Break down the application flow page by page.
- Identify required frontend behavior, backend APIs, and infrastructure for each part of the system.
- Standardize how the team will use Claude to build and refine the platform.
- Keep all central progress in a shared repository led by Bichesq.
- Make it possible for contributors to fork or branch and test alternate AI-assisted approaches.
- Prepare a working demo to show Yannick, Samoa, Enda, and other stakeholders.
- Recruit some external testers for early feedback after an initial build exists.

### Immediate success criteria
- The team can walk into the next planning session with a repo and documentation skeleton already created.
- The documentation is detailed enough to guide Claude in generating an initial scaffold.
- The docs can later be turned into Jira epics, stories, and subtasks.
- The repo structure supports both central implementation and parallel experimentation. [page:1]

---

## 3. Product Intent

### Working product definition
Cloud Heroes Africa Platform is a community-centered digital platform intended to support the Cloud Heroes Africa ecosystem. At this stage, the exact final shape may still become one application or multiple applications, but the current assumption is that the system may include multiple surfaces and should be planned in a way that allows reassessment before implementation goes too far. [page:1]

### What this first planning effort is trying to prove
- The platform concept can be translated into a coherent technical plan.
- The team can use AI-assisted workflows in a structured and collaborative way.
- The repo can act as the central source of truth for development direction.
- A usable demo can be produced before formal infrastructure funding is approved. [page:1]

---

## 4. Working Scope Assumptions

These are planning assumptions, not final locked decisions.

### Assumptions currently in play
- The platform may involve more than one application surface.
- The team currently suspects there may be roughly three application areas, but this must be reassessed in planning.
- The first build should prioritize the flows already identified in existing diagrams and team discussions.
- The first output does not need to be the full final system; it needs to be a meaningful working demo.
- Some services may be mocked or simplified in the initial build to accelerate progress.
- The design system, invite code flow, reCAPTCHA choice, assessment flow, and infrastructure details still need explicit definition. [page:1]

### Out-of-scope for now
- Full production hardening before the core flow is proven.
- Final board-driven feature expansion before an internal baseline exists.
- Over-engineering around infrastructure before the main demo path is defined. [page:1]

---

## 5. Key Stakeholders

| Stakeholder | Role in Project | Current Relevance |
|---|---|---|
| Bichesq Bijengsi | Lead developer, central repo owner, implementation lead | Drives repo updates and technical direction [page:1] |
| Kris Fernando | Facilitator of process and planning direction | Proposed the build-first planning approach and repo-centered workflow [page:1] |
| Harriet | Jira breakdown support | Expected to convert planning docs into stories and subtasks [page:1] |
| Team members | Collaborators and experimenters | Can observe, fork, branch, test alternate approaches, and share findings [page:1] |
| Yannick, Samoa, Enda | Board/stakeholder audience | Expected audience for the working demo/proposal review [page:1] |
| External testers | Fresh evaluators outside the immediate team | Can provide early feedback on usefulness and usability [page:1] |

---

## 6. Core Delivery Strategy

### Agreed working model
- The team will first document the product in detail.
- That documentation will become the structured prompt context for Claude.
- Bichesq will lead development in the central repository.
- Contributors may test alternate ideas in forks or branches.
- Findings from experiments can be reviewed and merged into the central direction if useful.
- Work should continue even while AWS approval is pending so time is not lost. [page:1]

### Why this strategy makes sense
The meeting made it clear that waiting for AWS approval before building would stall momentum and waste valuable learning time. Pre-building gives the team practical experience, accelerates decision-making, and creates a stronger position for stakeholder review. [page:1]

---

## 7. Proposed System Surfaces

This section is intentionally framed as a planning hypothesis because the number of applications is still under discussion.

### Working hypothesis
The platform may include the following major surfaces:

1. Public/entry surface  
   - Landing or welcome experience  
   - Login and registration  
   - Invite code verification  
   - General introduction to the platform

2. User onboarding and assessment surface  
   - Registration completion  
   - Invite workflow  
   - Assessment screens  
   - Initial qualification or routing logic

3. Main application/dashboard surface  
   - Authenticated platform experience  
   - User dashboard  
   - Role-specific features  
   - Administrative or community actions

### Open question
Should these live inside one application, one monorepo with multiple apps, or separate repositories? This is still unresolved and should be decided during planning. [page:1]

---

## 8. Priority Demo Path

The team should optimize around a clear demo path rather than trying to make every future feature production-complete.

### Recommended first demo flow
1. User reaches the platform.
2. User registers or begins onboarding.
3. User verifies an invite code.
4. User completes an assessment or qualification step.
5. User reaches an authenticated dashboard or next-step screen.
6. Team can demonstrate how admin logic, workflow routing, or supporting APIs connect behind the scenes.

### Why this path
The meeting repeatedly referenced login, registration, invite code verification, assessment, design system decisions, API design, and infrastructure planning as the concrete pieces to work through next. That makes onboarding plus assessment the strongest initial planning and demo slice. [page:1]

---

## 9. User Roles

These should be refined in the next team session.

| Role | Working Description | Key Needs | Notes |
|---|---|---|---|
| Visitor | Person arriving at the platform without an account | Understand purpose, register, sign in | Public-facing entry point |
| Invited user | Person entering through an invite-driven onboarding flow | Verify invite, continue registration | Invite code rules still undefined [page:1] |
| Learner/member | Primary user moving through onboarding and platform usage | Assessment, dashboard, next actions | Exact terminology should be standardized |
| Admin | Internal operator managing users, flows, and possibly content | Oversight, status tracking, intervention tools | Admin scope still needs detailing |
| Reviewer/board stakeholder | Person viewing progress or demo outcomes | Demo clarity, confidence in direction | Not necessarily a day-to-day platform user |
| External tester | Fresh evaluator brought in for usability feedback | Guided test path, feedback collection | Mentioned as a near-term validation path [page:1] |

---

## 10. Page Inventory

This list is based on explicit discussion in the meeting and should be expanded from the Excalidraw or other flow artifacts in the next session. [page:1]

| Page / Screen | Purpose | Current Notes |
|---|---|---|
| Landing / Intro | Introduce platform and route user into auth flow | Optional in demo depending on time |
| Login | Existing or returning user access | Explicitly mentioned in planning discussion [page:1] |
| Registration | New user onboarding entry | Explicitly mentioned in planning discussion [page:1] |
| Invite Code Verification | Validate access path | Email vs SMS flow still undecided [page:1] |
| Assessment | Collect responses and determine next routing | Questions and storage model still undefined [page:1] |
| Post-assessment transition | Direct user to next experience | Could be confirmation, dashboard, or queue state |
| User dashboard | Main authenticated experience | Needed for demo completeness |
| Admin/review surface | Internal visibility or management | Optional for demo if backend view is enough |

### Add from source flow artifacts
- Review Excalidraw and existing team diagrams.
- Add every page already represented there.
- Mark each page as required for v1 demo, later demo, or future phase. [page:1]

---

## 11. Page-Level Planning Template

Use this for each page during the planning session.

### Example fields
- Page name
- User type
- Primary goal
- Required UI components
- Required validations
- Inputs collected
- API calls required
- Success state
- Error state
- Loading state
- Empty state
- Security concerns
- Analytics or event tracking needs
- Dependencies
- Open questions

This structure supports both implementation planning and later Jira decomposition. Harriet is expected to translate the resulting detail into stories and subtasks. [page:1]

---

## 12. API Planning Areas

The meeting explicitly called for identifying the APIs needed to support the planned pages, so API design should be one of the first major planning outputs. [page:1]

### Initial API areas
- Authentication
  - Register user
  - Log in user
  - Log out user
  - Session validation

- Invite management
  - Verify invite code
  - Check invite expiration
  - Bind invite to email, phone, or account
  - Reissue or resend invite if needed

- Assessment
  - Fetch assessment definition
  - Submit assessment responses
  - Validate response completeness
  - Store and retrieve outcomes

- User profile and progression
  - Fetch user profile
  - Fetch onboarding status
  - Update onboarding progress
  - Determine next route after assessment

- Admin or internal support
  - View invite status
  - View assessment completion state
  - View user onboarding state

### API questions to answer
- Should the first version be REST-based?
- What auth pattern should be used?
- What validation library or contract pattern should be standardized?
- What shape should error responses follow?
- Which endpoints can be mocked in the first demo? [page:1]

---

## 13. Data Model Areas

These are preliminary entity candidates based on the discussed flows.

### Likely entities
- User
- UserProfile
- InviteCode
- InviteDelivery
- Assessment
- AssessmentQuestion
- AssessmentResponse
- AssessmentResult
- Session
- Role
- AuditEvent

### Example design questions
- Is an invite tied to a person, an email, a phone number, or a reusable code?
- Does assessment data need scoring, categorization, or manual review?
- How should onboarding state be stored?
- Which fields are required for a minimal demo?
- What data should be considered sensitive from day one? [page:1]

---

## 14. Infrastructure Areas

The team wants to discuss infrastructure at the same time as interface and API design, because infrastructure decisions affect what Claude should generate and how realistic the demo can be. [page:1]

### Areas to define
- Frontend hosting
- Backend hosting
- Database
- Object/file storage
- Email service
- SMS provider if needed
- reCAPTCHA provider
- Monitoring/logging
- CI/CD
- Secrets management
- Demo hosting approach on a smaller server or simplified environment

### Explicit investigation items from the meeting
- Google reCAPTCHA options and cost
- Invite delivery method: email, text message, or both
- What infrastructure is required for each API to function
- What minimum stack is enough for a live demo before AWS approval [page:1]

---

## 15. Design System Direction

The meeting stated that the team wants to define the design system explicitly and include it in the planning materials before asking Claude to generate major parts of the application. [page:1]

### Design system questions
- What design system or UI style should the platform use?
- Are there existing reference apps or component libraries to align to?
- What does accessibility mean for this platform at MVP stage?
- Which UI components are required for the onboarding flow?
- What should Claude be told about layout, forms, validation, states, and responsiveness?

### Deliverable for planning
A documented design direction that can be included directly in Claude prompts.

---

## 16. AI-Assisted Development Workflow

The platform is intended to be built using Claude as part of the core workflow, but the team also wants to be intentional about session length, prompt structure, token usage, and how work resumes across sessions. [page:1]

### Agreed workflow principles
- Start from clear documentation, not vague prompts.
- Build in bounded tasks rather than giant all-in-one sessions.
- Commit progress continuously to the repo.
- Treat the central repo as the canonical implementation path.
- Allow side experiments through forks or branches.
- Share findings and merge useful improvements back into the main direction.

### Questions the team wants to solve
- How should Claude sessions be structured?
- When should a coding session be stopped and resumed later?
- How can context be preserved without growing too large?
- When should multi-agent or different skill-based approaches be tried?
- How should subscription and token limitations shape workflow design? [page:1]

---

## 17. Git and Collaboration Standards

The meeting explicitly called for standardizing Git commit wording, PR wording, and the general collaboration process around the Cloud Heroes Africa app. [page:1]

### Working standards
- Bichesq leads the main branch direction.
- Major work should be committed to the central repo.
- Alternate approaches should happen in controlled forks or branches.
- Commit messages should use a consistent pattern.
- PRs should explain intent, AI usage, and review focus.
- Contributors should be able to learn by trying alternate approaches without destabilizing the central implementation.

### Why this matters
The project is both a product build and a team learning exercise, so consistent process is part of the deliverable, not just a nice-to-have. [page:1]

---

## 18. Jira Conversion Strategy

The team expects the planning documentation to become the raw material for Jira items, especially once the next working session fills in more detail. Harriet was specifically identified as someone who may turn the resulting documentation into stories and subtasks. [page:1]

### Suggested mapping
- Major user journeys -> Epics
- Pages or API capabilities -> Stories
- UI tasks, endpoint tasks, schema tasks, and testing tasks -> Subtasks

### Examples
- Epic: User Onboarding
- Story: Registration page
- Story: Invite code verification flow
- Story: Assessment definition and submission
- Story: Authenticated dashboard entry
- Subtasks: UI, validation, backend endpoint, schema, test coverage, error states

---

## 19. Risks and Constraints

### Current risks
- AWS approval is still pending.
- Product scope may expand too early if not controlled.
- The number of applications or repos is still unclear.
- Some required business rules are not yet documented.
- AI-generated code quality may vary if prompts are too broad.
- Team experimentation could create divergence unless the repo process is disciplined. [page:1]

### Current opportunities
- The team already has subscriptions and can begin now.
- The team can gain real implementation practice instead of waiting.
- A working demo can improve stakeholder confidence.
- Internal and external testers can provide fast feedback.
- The process itself can teach the team better AI-assisted engineering habits. [page:1]

---

## 20. Open Questions

These should be answered in the next planning session.

1. Is the platform one application, three applications, or something in between?
2. Should this be one repo, a monorepo, or multiple repos?
3. What exact flow from the existing diagrams will be used as the first demo path?
4. How should invite codes work: email, SMS, or both?
5. Will reCAPTCHA be used, and if so which provider and pricing tier?
6. What exact questions belong in the assessment?
7. How should assessment answers be stored and used?
8. What is the minimum viable dashboard after onboarding?
9. What should be mocked for the first demo?
10. What should be shown to the board before broad user testing begins? [page:1]

---

## 21. Immediate Next Actions

- Review and import the current Excalidraw or other flow diagrams into planning discussion.
- Expand the page inventory based on actual flow artifacts.
- Decide whether the platform structure is one app or multiple apps.
- Fill out page-level requirements for the onboarding and assessment flow first.
- Define the first-pass API list.
- Decide invite code delivery rules.
- Investigate reCAPTCHA options and costs.
- Define a first-pass design system direction.
- Convert completed planning outputs into Claude-ready prompts.
- Break documented requirements into Jira epics, stories, and subtasks.
- Start initial scaffold generation in the repo under Bichesq's lead. [page:1]

---

## 22. Change Log

| Date | Change | Author |
|---|---|---|
| 2026-05-18 | Created Cloud Heroes-specific architecture first draft from project sync discussion | Bichesq / AI-assisted draft |

