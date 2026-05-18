# Cloud Heroes Africa Git Standards

> Purpose: define how the Cloud Heroes Africa team should use Git branches, commits, and pull requests while building the platform collaboratively.

This file exists because the team explicitly agreed to standardize Git commit wording, pull request wording, and the repo collaboration process for the Cloud Heroes Africa application effort. [page:1]

---

## 1. Working Model

The Git workflow for this project follows a **central lead + collaborative experimentation** model.

### What that means
- Bichesq leads the central implementation direction. [page:1]
- The main repository is the canonical source of truth. [page:1]
- Contributors may branch or fork to explore alternate approaches. [page:1]
- Useful findings from experiments can be reviewed and merged back into the main path. [page:1]
- Git history should help the team understand what changed, why it changed, and whether AI was involved.

This workflow supports both delivery and learning, which were both clear priorities in the meeting. [page:1]

---

## 2. Branching Strategy

Use branches for all non-trivial work.

### Protected branch
- `main` -> stable central branch for reviewed and accepted work

### Standard branch types
- `docs/...` -> documentation work
- `feature/...` -> product feature work
- `fix/...` -> bug fixes and corrections
- `experiment/...` -> alternative approaches, AI experiments, multi-agent tests
- `chore/...` -> maintenance, cleanup, repo structure, tooling
- `infra/...` -> deployment, hosting, pipeline, environment setup
- `spike/...` -> short exploratory investigation that may not produce mergeable code

### Examples
- `docs/architecture-first-draft`
- `docs/cloud-heroes-jira-mapping`
- `feature/onboarding-registration`
- `feature/invite-verification-api`
- `fix/register-form-validation`
- `experiment/claude-multi-agent-onboarding`
- `chore/repo-bootstrap`
- `infra/demo-deploy-setup`
- `spike/recaptcha-options`

---

## 3. When to Use a Branch vs a Fork

### Use a branch when
- the work is aligned with the central direction,
- the scope is small or medium,
- the work is expected to merge back soon,
- and the task fits the current architecture.

### Use a fork when
- trying a significantly different approach,
- exploring a risky alternative implementation,
- testing a different AI workflow,
- comparing architecture ideas,
- or experimenting in a way that might create noise in the main repo.

This matches the meeting guidance that people should be free to “spin off” and try something, then bring back the result for group review. [page:1]

---

## 4. Commit Message Standard

The team wanted to standardize “commit verbiage,” so every commit should follow a consistent semantic format. [page:1]

### Format
```text
type: short description
```

### Allowed types
- `feat:` -> new feature
- `fix:` -> bug fix
- `docs:` -> documentation change
- `refactor:` -> internal restructuring without changing intended behavior
- `test:` -> tests added or updated
- `chore:` -> maintenance or repo housekeeping
- `infra:` -> infrastructure, deployment, environments, CI/CD
- `perf:` -> performance-focused improvement
- `revert:` -> revert a previous change

### Good examples
- `docs: add cloud heroes architecture first draft`
- `docs: define jira mapping for onboarding and assessment`
- `feat: scaffold registration page`
- `feat: add invite verification endpoint`
- `fix: handle expired invite codes`
- `infra: add demo deployment environment variables`
- `experiment: compare alternate onboarding prompt output`

### Bad examples
- `update stuff`
- `changes`
- `working on app`
- `more fixes`
- `AI update`

### Why this matters
A clean history makes it easier for the team to understand progress, review changes, and trace what happened as the project evolves through planning and implementation. [page:1]

---

## 5. Commit Scope Rules

Each commit should represent one coherent unit of change.

### Good commit behavior
- One docs topic per docs commit
- One feature slice per feature commit
- One fix per fix commit
- Small enough to review safely
- Large enough to be meaningful

### Avoid
- mixing docs, infra, and UI work in one commit unless they are inseparable,
- bundling unrelated AI-generated files together,
- committing exploratory output to `main` without review,
- or using vague “checkpoint” commits in shared history.

Because Claude-assisted work can generate lots of output quickly, commit discipline matters even more than usual. [page:1]

---

## 6. Pull Request Standard

The team also explicitly wanted standard PR wording. PRs should be written so that another team member can understand the purpose and risk of the change without reading the full diff first. [page:1]

### PR title format
Use a clean descriptive title, such as:
- `Docs: add Cloud Heroes architecture draft`
- `Feature: scaffold onboarding registration flow`
- `Fix: handle invalid invite verification states`
- `Infra: add demo environment configuration`

### PR body should include

#### 1. Summary
What changed?

#### 2. Why
Why is this change needed?

#### 3. Scope
Which files or areas were intentionally changed?

#### 4. AI usage
Was AI used? If yes:
- which tool,
- what task it was asked to perform,
- what was reviewed manually,
- and what assumptions were left in place.

#### 5. Testing / validation
How was the output checked?

#### 6. Reviewer focus
What should reviewers pay special attention to?

#### 7. Known gaps
What is still incomplete, mocked, or deferred?

This matches the team’s plan to use Claude heavily while still keeping the process explicit and reviewable. [page:1]

---

## 7. Suggested PR Template Language

Use PR descriptions in this structure:

```text
## Summary
Briefly describe the change.

## Why
Explain why the change was needed.

## Scope
List the key files or areas touched.

## AI Usage
- AI used: Yes / No
- Tool:
- Prompt/task:
- Manual review performed:
- Assumptions left in place:

## Validation
Describe how this was checked.

## Reviewer Focus
List the highest-risk or most important review areas.

## Known Gaps
List anything intentionally incomplete.
```

---

## 8. Main Branch Rules

`main` should remain stable enough for the team to:
- review current direction,
- continue implementation,
- use it as the central reference path,
- and prepare demo-ready progress when needed. [page:1]

### Do not push directly to `main` when
- the change is large,
- the change is experimental,
- the change introduces new architectural assumptions,
- or the output has not been reviewed.

### Direct pushes may be acceptable when
- it is a small docs-only correction,
- it is early bootstrap work under lead control,
- or the change is low-risk and clearly understood.

Since Bichesq is leading the central implementation path, this project can be pragmatic, but the repo should still avoid avoidable chaos. [page:1]

---

## 9. Docs-First Git Rule

For this project, important product changes should usually begin with documentation updates when the requirement or approach is still evolving.

### Update docs first when
- a product rule changes,
- a flow is being defined,
- a new major page is introduced,
- an API contract is being clarified,
- infrastructure direction changes,
- or a major AI workflow pattern changes.

This aligns with the meeting’s repeated emphasis on getting the details “down on paper” before using Claude to generate major implementation output. [page:1]

---

## 10. Experiment Branch Rules

Experiment branches are encouraged, but they must be obvious and traceable.

### Requirements for experiment branches
- prefix with `experiment/` or `spike/`
- describe the alternative approach clearly
- document what question the experiment is answering
- summarize findings before asking to merge anything
- do not treat experiment output as official by default

### Example experiment questions
- Does a multi-agent Claude workflow produce better onboarding scaffolds?
- Is one repo or multi-app structure easier to generate against?
- Does one prompt style produce cleaner API outputs?
- Should invite verification be mocked first or built end-to-end?

This directly reflects the meeting’s interest in trying alternate approaches and evaluating them as a group. [page:1]

---

## 11. Review Standards

Before merging work into the central direction, reviewers should ask:

- Does this align with `docs/architecture.md`?
- Does it stay within the intended task scope?
- Does it introduce undocumented assumptions?
- Is the naming consistent?
- Is the code or doc quality acceptable?
- Is the Git history understandable?
- If AI was used, is the result still trustworthy after review?

---

## 12. Merge Guidelines

A PR is ready to merge when:
- the scope is clear,
- the change supports the current central direction,
- docs are updated if needed,
- AI-generated parts were reviewed,
- and there is no unresolved blocker that makes the merge misleading.

A PR should **not** be merged if:
- it silently changes product direction,
- it depends on unresolved assumptions,
- it is still mostly experimental,
- or the reviewer cannot tell what the change is meant to accomplish.

---

## 13. Recommended First Branches

Based on the current project phase, these are strong early branches to create:

- `docs/architecture-first-draft`
- `docs/claude-workflow`
- `docs/jira-mapping`
- `docs/git-standards`
- `docs/decision-log`
- `feature/onboarding-skeleton`
- `feature/invite-verification-flow`
- `spike/recaptcha-options`
- `experiment/claude-session-patterns`

These align with the next-session planning goals discussed in the meeting. [page:1]

---

## 14. Git Anti-Patterns to Avoid

Avoid these:
- vague commit messages,
- giant mixed-purpose commits,
- long-lived hidden local work with no branch,
- direct commits to `main` for risky work,
- merging experiment output without explanation,
- using AI to generate large code drops with no review,
- and failing to update docs when the implementation path changes. [page:1]

---

## 15. Immediate Next Actions

1. Add this file to the repo.
2. Use standardized semantic commit messages from now on.
3. Use branch prefixes consistently.
4. Use PR descriptions that explicitly note AI usage.
5. Keep `main` as the stable central path under Bichesq’s lead.
6. Use `experiment/` and `spike/` branches for alternate approaches the team wants to compare. [page:1]

