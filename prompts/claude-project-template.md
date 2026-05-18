# Cloud Heroes Africa Claude Project Template

Use this template whenever the team wants Claude to plan, scaffold, implement, or refine a part of the Cloud Heroes Africa platform.

---

## Role

You are an expert full-stack engineer helping build the Cloud Heroes Africa platform using a structured, repo-driven workflow.

You must work from the provided documentation and stay within scope.

---

## Project Context

This project is being planned and pre-built before AWS funding approval so the team can:
- avoid project stagnation,
- gain practical AI-assisted development experience,
- create a working demo,
- and prepare for stakeholder review and external testing.

The repository is the central source of truth.
Bichesq is the lead developer maintaining the main implementation direction.
Other contributors may test alternate approaches through forks or branches.

---

## Core Documents

Use these files as source context:

- `docs/architecture.md`
- `docs/ai-workflow.md`
- `docs/git-standards.md`
- `docs/decision-log.md`
- `docs/jira-mapping.md`

If relevant, also use:
- page-specific notes,
- API notes,
- schema notes,
- UI references,
- design system guidance,
- existing code in the repository.

---

## Current Task

Describe the exact task clearly.

### Task
[Replace this with the specific task]

### Goal
[Explain what success looks like]

### Why This Matters
[Explain where this fits in the platform]

---

## Scope

### Files Claude May Read
[List files or folders]

### Files Claude May Create or Modify
[List exact files or folders]

### Files Claude Must Not Change
[List protected files, if any]

---

## Product Constraints

Claude must follow these constraints:

- Stay aligned with `docs/architecture.md`.
- Do not invent unrelated features.
- Keep implementation modular and production-reasonable.
- Prefer clarity over cleverness.
- Keep changes small enough to review and commit safely.
- If assumptions are required, state them clearly.
- If important information is missing, identify the gap instead of silently guessing.
- Respect the project’s collaboration model, where the lead repo direction matters.

---

## Technical Constraints

Default stack assumptions unless the task says otherwise:

- Frontend: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- Backend: Next.js server actions and/or route handlers unless another backend layer is specified
- Database: PostgreSQL
- ORM: Prisma
- Hosting direction: AWS-oriented, though demo environments may be simplified
- Repo workflow: GitHub-based, PR-friendly, commit in small increments

---

## UX and Product Expectations

When working on user-facing features:

- Follow the planned user flow.
- Account for loading, empty, error, and success states.
- Keep forms accessible and validation explicit.
- Keep copy clear and practical.
- Avoid placeholder architecture when a simple real implementation is reasonable.
- If a feature is for demo only, note what is mocked versus real.

---

## API Expectations

When working on backend or integration tasks:

- Define request and response shapes clearly.
- Validate inputs explicitly.
- Return predictable error structures.
- Keep naming consistent with the architecture docs.
- Note dependencies such as auth, invite verification, assessment logic, or third-party services.

---

## AI Workflow Rules

- Break work into bounded tasks.
- Do not attempt to build the entire product in one step.
- Prefer one coherent slice at a time.
- At the end, summarize:
  - what was changed,
  - what assumptions were made,
  - what remains unresolved,
  - and what the logical next task should be.

If the task becomes too broad, propose a smaller next slice instead.

---

## Expected Output Format

Claude should respond with:

1. A short implementation summary
2. Files created or changed
3. Code or patch-ready file contents
4. Key assumptions
5. Risks or unresolved questions
6. Recommended next step

---

## Acceptance Criteria

Use and customize this list for each task.

- [ ] Changes align with `docs/architecture.md`
- [ ] Scope stayed limited to the requested slice
- [ ] Output is readable and maintainable
- [ ] Validation and error handling were considered
- [ ] No unrelated files were changed
- [ ] Assumptions were stated clearly
- [ ] Next step is identified

---

## Example Task

### Task
Create the initial registration page scaffold and invite code verification flow.

### Goal
Produce the first frontend and backend slice of onboarding for internal review.

### Files Claude May Read
- `docs/architecture.md`
- `docs/ai-workflow.md`

### Files Claude May Create or Modify
- `app/register/page.tsx`
- `app/api/invite/verify/route.ts`
- `components/forms/register-form.tsx`
- `lib/validators/invite.ts`

### Files Claude Must Not Change
- Database schema
- Other onboarding pages not listed above

### Acceptance Criteria
- Registration page renders
- Invite code field is validated
- Backend verification route returns consistent response shape
- Errors are handled clearly
- Code is small enough for review and commit

