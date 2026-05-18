# Contributing to Cloud Heroes Africa Platform

Welcome to the Cloud Heroes Africa platform repository.

This project is being developed as a collaborative, AI-assisted build effort where the team is moving from learning into real implementation. The repository is the central place for planning, experimentation, and delivery, and contributors are expected to work in a way that supports both progress and shared learning. [page:1]

---

## 1. Project Contribution Model

This repository follows a **lead-driven, collaborative experimentation** model.

### What that means
- Bichesq leads the central implementation direction. [page:1]
- The main repository is the canonical source of truth. [page:1]
- Planning documentation is part of the actual work, not a side activity. [page:1]
- Contributors may branch or fork to try alternate approaches. [page:1]
- Useful ideas from experiments can be reviewed and merged back into the main direction. [page:1]
- AI is encouraged, but it must be used in a structured and reviewable way. [page:1]

This approach reflects the team’s decision to start building before AWS approval is finalized so the project keeps moving and the team gains practical implementation experience. [page:1]

---

## 2. Before You Contribute

Please read these files first:

- `README.md`
- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/jira-mapping.md`
- `docs/ai-workflow.md`
- `docs/git-standards.md`
- `prompts/claude-project-template.md`

These documents define:
- what the platform is trying to become,
- what is already decided,
- what is still unresolved,
- how tasks map into work items,
- how AI should be used,
- and how changes should be committed and reviewed. [page:1]

Do not start major implementation work from guesswork when the repo documentation already provides the intended direction. [page:1]

---

## 3. Types of Contributions Welcome

Contributions can include:

- planning and architecture improvements,
- page and flow decomposition,
- API design proposals,
- frontend scaffolds,
- backend/API scaffolds,
- data model proposals,
- infrastructure planning notes,
- design system proposals,
- documentation improvements,
- test improvements,
- and clearly labeled experiments.

This project is still in a planning-to-scaffold phase, so documentation and structure work are as valuable as code right now. The meeting explicitly emphasized documenting flows, APIs, infrastructure, and process before large-scale generation with Claude. [page:1]

---

## 4. How to Contribute

### Standard path
1. Read the current docs.
2. Pick a clearly scoped task.
3. Create a branch.
4. Make focused changes.
5. Update docs if your work changes assumptions or decisions.
6. Open a pull request using the project PR template.
7. Be explicit about AI usage if AI was involved.

### Experiment path
If you want to try a significantly different approach:
1. Create an `experiment/...` branch or use a fork.
2. State what question your experiment is trying to answer.
3. Document what was learned.
4. Do not assume the experiment becomes the official path automatically.
5. Bring the result back for review.

This matches the process discussed in the meeting, where contributors can try alternate approaches but should route useful findings back through the main repo direction. [page:1]

---

## 5. Branching Rules

Use the naming patterns from `docs/git-standards.md`.

### Common branch types
- `docs/...`
- `feature/...`
- `fix/...`
- `experiment/...`
- `chore/...`
- `infra/...`
- `spike/...`

Examples:
- `docs/architecture-updates`
- `feature/registration-page`
- `feature/invite-code-api`
- `experiment/multi-agent-onboarding`
- `spike/recaptcha-research`

Keep branch names short, descriptive, and lowercase with hyphens.

---

## 6. Commit Rules

Use semantic commit messages.

### Format
```text
type: short description
```

### Examples
- `docs: refine cloud heroes architecture draft`
- `feat: scaffold invite verification route`
- `fix: handle invalid onboarding state`
- `infra: document demo hosting assumptions`

Avoid vague commit messages like:
- `update`
- `changes`
- `work in progress`
- `more fixes`

The team explicitly wanted standardized commit verbiage for this project. [page:1]

---

## 7. Pull Request Rules

Every PR should:
- explain what changed,
- explain why it changed,
- state whether AI was used,
- describe what was manually reviewed,
- identify reviewer focus areas,
- and note any known gaps or assumptions.

Use the repo’s `.github/PULL_REQUEST_TEMPLATE.md`.

This matters because the project is expected to include AI-assisted work, parallel experimentation, and evolving requirements, so PR clarity is essential. [page:1]

---

## 8. AI Usage Rules

AI is welcome in this project, but it must be used responsibly.

### Allowed and encouraged
- using Claude to scaffold bounded tasks,
- turning architecture notes into implementation slices,
- generating draft routes, components, validators, and docs,
- and comparing alternate approaches through experiments.

### Required when AI is used
- disclose AI usage in the PR,
- review the output manually,
- check for invented assumptions,
- confirm alignment with repo docs,
- and keep the scope small enough to inspect safely.

### Do not
- prompt AI to build the whole product in one step,
- accept undocumented behavior just because AI suggested it,
- merge large AI-generated output blindly,
- or let experiments quietly redefine the product direction.

These rules come directly from the team’s discussion about wanting a structured Claude workflow, bounded sessions, and a consistent repo process. [page:1]

---

## 9. Documentation Rules

Documentation is part of the source of truth for this project.

Update docs when your work changes:
- platform assumptions,
- user flow understanding,
- page requirements,
- API expectations,
- infrastructure direction,
- design system direction,
- or AI workflow process.

At minimum, consider whether your work should update:
- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/jira-mapping.md`
- `docs/ai-workflow.md`

The team’s plan is to use the documentation as the input to Claude and later as the basis for Jira stories and subtasks, so stale docs create real delivery risk. [page:1]

---

## 10. What Needs Review Before Merge

Before asking for a merge, check:

- Does the work align with `docs/architecture.md`?
- Did it stay within the intended scope?
- Did it introduce any new assumptions?
- Were those assumptions documented?
- Is the naming consistent with the rest of the repo?
- If AI was used, was the output reviewed carefully?
- Is the change small enough to review safely?

If the answer to any of these is “no,” fix that before requesting merge.

---

## 11. Good First Contributions

Strong early contributions for this repo include:

- refining page inventory from flow artifacts,
- clarifying onboarding and invite flows,
- drafting API contracts,
- tightening architecture sections,
- improving Jira mapping,
- documenting reCAPTCHA options,
- documenting invite delivery options,
- defining assessment structure,
- and improving Claude task prompts.

These are especially useful because the meeting emphasized that the next session should focus on full planning detail before using Claude to build the initial skeleton. [page:1]

---

## 12. Anti-Patterns to Avoid

Please avoid:
- large mixed-purpose PRs,
- undocumented architectural changes,
- vague branch names,
- vague commit messages,
- pushing risky experimental output as if it were official,
- using AI without disclosure,
- and coding ahead of unresolved product decisions.

This project is moving fast, so clarity is more important than speed alone.

---

## 13. Questions and Alignment

If you are unsure:
- whether your approach fits the current architecture,
- whether something should be a branch or a fork,
- whether a decision is already made,
- or whether an experiment is worth pursuing,

check the repo docs first and raise the question before pushing the project in a conflicting direction.

Because Bichesq is leading the central implementation path, alignment matters more than individual momentum. [page:1]

---

## 14. Immediate Contributor Goal

The immediate team goal is to:
- prepare detailed project documentation,
- turn that into Claude-ready implementation context,
- scaffold the initial product structure,
- and move toward a working demo that can be shown to stakeholders and outside testers before AWS approval is finalized. [page:1]

If your contribution helps that happen more clearly, more safely, or more quickly, it is probably a good contribution.

