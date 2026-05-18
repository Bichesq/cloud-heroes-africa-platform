# Cloud Heroes Africa Platform Architecture

> Working planning document for the next team session.  
> This document is intended to be completed live, then refined into the source context for Claude-assisted implementation.

---

## 1. Platform Overview

### Objective
Define what the Cloud Heroes Africa platform is, who it serves, and what outcome the first working demo must prove.

### Fill In
- Platform purpose:
- Primary users:
- Core problem being solved:
- Why this matters before AWS approval:
- What the demo must prove to Yannick, Samoa, and Enda:

### Notes
This platform is being planned and pre-built before AWS approval so the team can gain practical implementation experience, avoid project stagnation, and show a working concept instead of only a proposal.

---

## 2. Product Scope

### Questions
- Is this one application or multiple applications?
- If multiple, what are they?
- What belongs in v1?
- What is explicitly out of scope for the first demo?

### Fill In

#### Proposed platform surfaces
- Application 1:
- Application 2:
- Application 3:

#### In scope for v1
- 
- 
- 

#### Out of scope for v1
- 
- 
- 

---

## 3. User Roles

List each role and what success looks like for them.

| Role | Description | Primary Goals | Key Pages/Features |
|---|---|---|---|
| Visitor |  |  |  |
| Learner/Student |  |  |  |
| Admin |  |  |  |
| Volunteer/Mentor |  |  |  |
| Other |  |  |  |

---

## 4. Demo Goal

### Goal
Describe the exact working demo the team wants to present.

### Fill In
- Demo audience:
- Demo scenario:
- Core user flow to demonstrate:
- What must work live:
- What can be mocked or simplified:
- Success criteria for the demo:

---

## 5. User Flows

Document the end-to-end journeys that matter most.

### Priority Flows
1. Registration and onboarding
2. Invite code verification
3. Assessment flow
4. Main platform access after onboarding
5. Admin/management flow

### Flow Template

#### Flow Name:
- Trigger:
- User type:
- Steps:
  1.
  2.
  3.
- Success state:
- Failure states:
- Open questions:

---

## 6. Page Inventory

Go page by page and define what each page needs.

| Page | Purpose | Inputs | Outputs | API Needs | Notes |
|---|---|---|---|---|---|
| Login |  |  |  |  |  |
| Registration |  |  |  |  |  |
| Invite Code Verification |  |  |  |  |  |
| Assessment |  |  |  |  |  |
| Dashboard |  |  |  |  |  |

### Add more pages
- 
- 
- 

---

## 7. Page Requirements Breakdown

Use this for each important page.

### Page Name:
- Goal:
- User role(s):
- Required UI elements:
- Required validation:
- Required states:
  - Loading
  - Empty
  - Success
  - Error
- Data needed on load:
- Actions user can take:
- APIs needed:
- Dependencies:
- Open questions:

---

## 8. API Map

Define the backend surface area required to support the platform.

| Method | Endpoint | Purpose | Request | Response | Auth | Notes |
|---|---|---|---|---|---|---|
| POST | /api/auth/register |  |  |  |  |  |
| POST | /api/auth/login |  |  |  |  |  |
| POST | /api/invite/verify |  |  |  |  |  |
| POST | /api/assessment/submit |  |  |  |  |  |

### API Design Questions
- Will the platform use REST only?
- What authentication method will be used?
- How should validation be handled?
- What error response format should be standardized?
- Which endpoints can be mocked first?

---

## 9. Data Model

Describe the key entities and how they relate.

### Core Entities
- User
- InviteCode
- Assessment
- AssessmentResponse
- Role
- Session
- Notification
- Other:

### Entity Template

#### Entity Name:
- Purpose:
- Core fields:
- Relationships:
- Validation rules:
- Sensitive data considerations:

---

## 10. Infrastructure

Define what is required for the platform to run.

| Concern | Decision | Options | Notes |
|---|---|---|---|
| Hosting |  | AWS / Vercel / Hybrid |  |
| Frontend deployment |  |  |  |
| Backend deployment |  |  |  |
| Database |  | PostgreSQL / other |  |
| File storage |  | S3 / other |  |
| Auth |  |  |  |
| Email/SMS |  |  |  |
| Monitoring |  |  |  |
| CI/CD |  | GitHub Actions / other |  |

### Third-Party Services to Investigate
- Google reCAPTCHA
- Email service for invite codes
- SMS provider if invite code uses text message
- Analytics/monitoring tools
- Any required AI-related services

---

## 11. Design System

### Goal
Document the design system or UI standards Claude should follow.

### Fill In
- Design system name:
- Style direction:
- UI references:
- Color approach:
- Typography:
- Component expectations:
- Accessibility expectations:
- Responsive behavior:

---

## 12. AI-Assisted Development Workflow

This platform is intended to be built with Claude as part of the workflow.

### Questions
- What inputs will Claude receive?
- How do we decide when to stop a session?
- How do we resume work without overwhelming context?
- How do we manage token and subscription limits?
- When should the team test alternate prompting or agent strategies?

### Required Inputs for Claude
- Architecture doc
- Page inventory
- API map
- Data model
- Design system notes
- Current code context
- Explicit task scope

---

## 13. Repository Strategy

### Questions
- One repo or multiple repos?
- Monorepo or separate apps?
- Where should docs live?
- Where should prompts live?
- Where should generated app code live?

### Proposed Structure
- `docs/`
- `prompts/`
- `apps/`
- `packages/` (optional)
- `.github/`

---

## 14. Branching and Experimentation

The team may fork or branch to try alternate approaches.

### Rules to Confirm
- What stays on `main`?
- What gets developed on feature branches?
- When should someone fork instead of branch?
- How are experiments reviewed?
- How do successful ideas get merged back?

### Proposed Branch Types
- `docs/...`
- `feature/...`
- `fix/...`
- `experiment/...`
- `chore/...`

---

## 15. Decision Log

Record decisions as they are made.

| Date | Decision | Reason | Owner | Status |
|---|---|---|---|---|
| 2026-05-18 | Repository renamed to cloud-heroes-africa-platform | Platform is broader than a single app | Bichesq | Done |

---

## 16. Jira Mapping

This section helps Harriet convert planning into Jira structure.

### Suggested Jira Hierarchy
- Epic
- Story
- Subtask

### Mapping Approach
- Each major user flow becomes an Epic.
- Each page or API capability becomes a Story.
- Each implementation detail becomes one or more Subtasks.

### Example
- Epic: User Onboarding
- Story: Registration Page
- Story: Invite Code Verification API
- Story: Assessment Submission Flow
- Subtasks: UI form, validation, endpoint, DB schema, test coverage

---

## 17. Open Questions

- Is the platform one app or multiple apps?
- What is the first demo flow?
- What role model do we need for v1?
- Will invite codes use email, SMS, or both?
- What assessment questions will be asked?
- How will assessment data be stored and reviewed?
- Which stack decisions are already fixed?
- What should be mocked for the first demo?

---

## 18. Immediate Next Steps

- Review existing Excalidraw/user flow artifacts.
- Complete page inventory.
- Complete API map.
- Complete infrastructure decisions.
- Finalize Claude project input structure.
- Break completed planning into Jira items.
- Start scaffold generation in the repo.

