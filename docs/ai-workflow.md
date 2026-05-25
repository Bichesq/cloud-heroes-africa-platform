# Cloud Heroes Africa AI Workflow

> Purpose: define how the Cloud Heroes Africa team should use Claude and related AI workflows to plan, scaffold, implement, review, and refine the platform.

This document is intended to make AI usage repeatable, collaborative, and safe for a real team project.

---

## 1. Why This Document Exists

The team agreed that the next working session should produce detailed planning documentation that can act as the project context for Claude. The intent is not to prompt Claude vaguely, but to feed it structured requirements about page flows, APIs, infrastructure, design system decisions, and implementation intent. [page:1]

The meeting also made it clear that the team wants to be deliberate about:
- how Claude sessions start,
- how large they should become,
- how to stop and resume work,
- how token limits affect the process,
- and how different contributors can experiment without destabilizing the main project direction. [page:1]

---

## 2. Core Principles

### 2.1 Documentation first
Claude should work from repo documentation, not from memory or loose meeting discussion alone. The team explicitly wants the planning docs to become the “project for Claude.” [page:1]

### 2.2 Bounded task execution
Claude should be used on small, reviewable slices of work rather than one giant end-to-end build session. The meeting highlighted that development will require stopping, revising, and resuming rather than expecting a full product in a single long session. [page:1]

### 2.3 Central repo leadership
Bichesq leads the main implementation path. Claude-generated work that is intended as the official direction should flow through the central repo under that lead. [page:1]

### 2.4 Experimentation is allowed
Contributors are encouraged to try alternate approaches in branches, forks, or local copies, then bring back useful findings for team review. This is part of the learning goal, not a side issue. [page:1]

### 2.5 AI accelerates engineering; it does not replace judgment
Claude can help produce code, structure, or options quickly, but all meaningful output still needs review for correctness, scope, maintainability, and alignment with the documented architecture. [page:1]

---

## 3. What Claude Should Be Used For

Claude is best used in this project for:

- turning architecture notes into implementation scaffolds,
- generating frontend page skeletons,
- generating backend route handlers and API structures,
- drafting data model proposals,
- producing validation logic,
- proposing component structures,
- refining developer documentation,
- helping compare alternate implementation approaches,
- and accelerating repetitive coding tasks once the team has made the core decisions. [page:1]

Claude should also help the team move faster while AWS approval is pending so the project continues to progress instead of waiting passively. [page:1]

---

## 4. What Claude Should Not Be Used For

Do not use Claude as a substitute for unresolved product decisions.

Examples:
- Do not let Claude silently decide whether the platform is one app or multiple apps.
- Do not let Claude invent assessment logic that the team has not agreed on.
- Do not let Claude choose invite-code rules without documentation.
- Do not let Claude lock in infrastructure assumptions that the team has not reviewed.
- Do not merge large AI-generated outputs without scoped review.

If the requirements are unclear, the right output is a clarification note, a decision candidate, or a smaller scaffold — not fake certainty. [page:1]

---

## 5. Required Inputs Before Using Claude

Before starting a meaningful Claude session, the team should provide as many of the following as possible:

- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/jira-mapping.md` when task scope has already been broken down
- `docs/git-standards.md`
- `prompts/claude-project-template.md`
- relevant page requirements
- relevant API notes
- relevant design system notes
- relevant existing code
- clear file scope
- acceptance criteria for the task

The meeting explicitly described the need to go page by page, identify what is required, identify which APIs support each page, and document all of that before feeding it to Claude. [page:1]

---

## 6. Standard Claude Session Flow

Use this as the default workflow.

### Step 1: Start from documented context
Pull the relevant planning materials from the repo.

### Step 2: Choose one bounded task
Examples:
- scaffold registration page
- draft invite verification API
- create assessment schema proposal
- add dashboard shell
- refine design system notes

### Step 3: Define scope clearly
List:
- goal
- files in scope
- files out of scope
- assumptions allowed
- acceptance criteria

### Step 4: Prompt Claude
Use the shared prompt template and provide only the context required for that slice.

### Step 5: Review the result
Check:
- architecture alignment
- code quality
- naming consistency
- overreach
- hidden assumptions
- maintainability

### Step 6: Test or inspect locally
Run the output where applicable and confirm the slice works as intended.

### Step 7: Revise if needed
Use a follow-up prompt or manual edits to tighten the result.

### Step 8: Commit the slice
Commit in the repo with clear, standardized commit wording.

### Step 9: Log outcomes
If decisions changed, update `docs/decision-log.md`.
If new tasks emerged, update planning docs or Jira mappings as needed.

---

## 7. Session Start Template

Before opening a Claude session, define the following:

- **Task name**
- **Goal**
- **Why this task matters**
- **Files Claude may read**
- **Files Claude may change**
- **Files Claude must not change**
- **Architecture sections relevant to the task**
- **Current assumptions**
- **Acceptance criteria**
- **Known open questions**

This mirrors the team’s desire to standardize the process and reduce ambiguity when different people try things in parallel. [page:1]

---

## 8. Session Stop Rules

A Claude session should be stopped when any of the following happen:

- the task scope starts drifting,
- the conversation context becomes too large,
- Claude starts repeating or losing precision,
- the output begins to touch files outside the intended slice,
- the team realizes a product decision is still unresolved,
- or the current result is good enough to review and commit.

The meeting explicitly raised the issue that real development sessions will need to stop and resume rather than continue endlessly with huge context windows. [page:1]

---

## 9. Session Resume Rules

When resuming a task, do not rely on the previous session alone.

Before restarting:
- summarize what was already done,
- identify files created or changed,
- restate the task goal,
- restate the acceptance criteria,
- note unresolved issues,
- and specify the next smallest useful step.

### Resume note template
- Previous task:
- Completed work:
- Files touched:
- Remaining issue:
- Current blocker:
- Next requested output:

This helps control token usage and prevents Claude from having to reconstruct the whole project state from scratch. [page:1]

---

## 10. Token and Context Management

The meeting explicitly noted that subscription limits and token budgets matter, so the workflow should be designed to reduce waste. [page:1]

### Best practices
- Do not paste the entire project context if only one small feature is being worked on.
- Prefer focused prompts over giant prompts.
- Reuse repo docs instead of rewriting the same context every time.
- Use summaries between sessions.
- Break large features into implementation slices.
- Prefer one coherent task per session.
- Capture useful decisions in the repo so future prompts stay smaller.

### Signs the context is too large
- Claude forgets recent constraints
- Claude starts rewriting unrelated areas
- Output quality drops
- Prompts become mostly historical recap instead of actionable input

---

## 11. Official Path vs Experiment Path

The team wants both a stable central path and room for experimentation. [page:1]

### Official path
Use this when:
- the work is intended for the main project direction,
- the task aligns with current architecture,
- Bichesq is ready to review or integrate it,
- and the result should become part of the central repo.

### Experiment path
Use this when:
- trying a different prompting strategy,
- testing a different implementation shape,
- exploring multi-agent methods,
- trying different Claude skills,
- or comparing alternate architectural ideas.

Experiment work should be labeled clearly and should not be merged into the central direction without review. [page:1]

---

## 12. Multi-Agent and Skill Experiments

The meeting mentioned possible future experiments with multi-agent workflows and different Claude skills. That should be treated as structured experimentation, not default behavior. [page:1]

### Use experiments when
- the core task is understood,
- the team wants to compare approaches,
- the risk of divergence is acceptable,
- and the experiment can be reviewed against a baseline.

### Do not use experiments when
- basic requirements are still unknown,
- the team has not agreed on the core flow,
- or the baseline implementation path is not yet stable.

---

## 13. Review Checklist for Claude Output

Before accepting AI-generated work into the main path, check:

- Does it align with `docs/architecture.md`?
- Did it stay within the requested file scope?
- Did it invent product behavior that was not agreed?
- Are names and concepts consistent?
- Is the code reasonably maintainable?
- Are success, error, loading, and validation states handled where relevant?
- Are assumptions stated clearly?
- Is the result small enough to review safely?
- Does it create follow-up tasks that should go into docs or Jira?

---

## 14. When to Use Claude for Planning vs Coding

### Use Claude for planning when
- the team needs structure,
- the flow needs decomposition,
- requirements need organizing,
- stories or subtasks need drafting,
- options need comparison,
- or unresolved decisions need to be framed cleanly.

### Use Claude for coding when
- the requirement is already documented,
- the slice is bounded,
- acceptance criteria exist,
- and the team is ready to review implementation output.

This distinction matters because the meeting’s next step is planning in detail first, then generating the skeleton with Claude. [page:1]

---

## 15. Commit and PR Expectations for AI Work

AI-assisted work should still fit the repo workflow.

### Commit expectations
- keep commits small,
- describe the actual slice implemented,
- avoid bundling unrelated AI output,
- and use the agreed commit wording pattern.

### PR expectations
PRs should note:
- whether AI was used,
- what task Claude was asked to perform,
- what was reviewed manually,
- any assumptions Claude made,
- and what reviewers should focus on.

The meeting explicitly called for standardizing commit verbiage and PR verbiage for the Cloud Heroes Africa app. [page:1]

---

## 16. Recommended First AI Tasks

Based on the meeting discussion, the first useful Claude tasks are likely:

1. Turn planning notes into a structured architecture draft
2. Refine page inventory from the current flow diagrams
3. Draft onboarding flow pages
4. Draft invite verification logic
5. Draft assessment data and screen structure
6. Propose a minimal dashboard shell
7. Suggest API contracts for the onboarding flow
8. Suggest a lightweight demo deployment shape

These are strong early tasks because they match the exact items Kris highlighted for the next session. [page:1]

---

## 17. Anti-Patterns to Avoid

Avoid these mistakes:

- asking Claude to build “the whole app” at once,
- prompting without documented requirements,
- accepting invented product rules,
- merging large unreviewed output,
- letting experiments quietly become the main path,
- continuing one bloated session for too long,
- or failing to record important decisions after AI-assisted work changes direction. [page:1]

---

## 18. Immediate Next Actions

After this file is added:
1. Use `prompts/claude-project-template.md` as the standard session starter.
2. Keep `docs/architecture.md` current before major AI implementation tasks.
3. Use `docs/decision-log.md` whenever Claude prompts expose unresolved assumptions.
4. Start with one bounded onboarding-related task.
5. Review and commit centrally through Bichesq’s repo path.
6. Let contributors use branches or forks for alternative approaches where helpful. [page:1]

EOFcat > docs/ai-workflow.md <<'EOF'
# Cloud Heroes Africa AI Workflow

> Purpose: define how the Cloud Heroes Africa team should use Claude and related AI workflows to plan, scaffold, implement, review, and refine the platform.

This document is intended to make AI usage repeatable, collaborative, and safe for a real team project.

---

## 1. Why This Document Exists

The team agreed that the next working session should produce detailed planning documentation that can act as the project context for Claude. The intent is not to prompt Claude vaguely, but to feed it structured requirements about page flows, APIs, infrastructure, design system decisions, and implementation intent. [page:1]

The meeting also made it clear that the team wants to be deliberate about:
- how Claude sessions start,
- how large they should become,
- how to stop and resume work,
- how token limits affect the process,
- and how different contributors can experiment without destabilizing the main project direction. [page:1]

---

## 2. Core Principles

### 2.1 Documentation first
Claude should work from repo documentation, not from memory or loose meeting discussion alone. The team explicitly wants the planning docs to become the “project for Claude.” [page:1]

### 2.2 Bounded task execution
Claude should be used on small, reviewable slices of work rather than one giant end-to-end build session. The meeting highlighted that development will require stopping, revising, and resuming rather than expecting a full product in a single long session. [page:1]

### 2.3 Central repo leadership
Bichesq leads the main implementation path. Claude-generated work that is intended as the official direction should flow through the central repo under that lead. [page:1]

### 2.4 Experimentation is allowed
Contributors are encouraged to try alternate approaches in branches, forks, or local copies, then bring back useful findings for team review. This is part of the learning goal, not a side issue. [page:1]

### 2.5 AI accelerates engineering; it does not replace judgment
Claude can help produce code, structure, or options quickly, but all meaningful output still needs review for correctness, scope, maintainability, and alignment with the documented architecture. [page:1]

---

## 3. What Claude Should Be Used For

Claude is best used in this project for:

- turning architecture notes into implementation scaffolds,
- generating frontend page skeletons,
- generating backend route handlers and API structures,
- drafting data model proposals,
- producing validation logic,
- proposing component structures,
- refining developer documentation,
- helping compare alternate implementation approaches,
- and accelerating repetitive coding tasks once the team has made the core decisions. [page:1]

Claude should also help the team move faster while AWS approval is pending so the project continues to progress instead of waiting passively. [page:1]

---

## 4. What Claude Should Not Be Used For

Do not use Claude as a substitute for unresolved product decisions.

Examples:
- Do not let Claude silently decide whether the platform is one app or multiple apps.
- Do not let Claude invent assessment logic that the team has not agreed on.
- Do not let Claude choose invite-code rules without documentation.
- Do not let Claude lock in infrastructure assumptions that the team has not reviewed.
- Do not merge large AI-generated outputs without scoped review.

If the requirements are unclear, the right output is a clarification note, a decision candidate, or a smaller scaffold — not fake certainty. [page:1]

---

## 5. Required Inputs Before Using Claude

Before starting a meaningful Claude session, the team should provide as many of the following as possible:

- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/jira-mapping.md` when task scope has already been broken down
- `docs/git-standards.md`
- `prompts/claude-project-template.md`
- relevant page requirements
- relevant API notes
- relevant design system notes
- relevant existing code
- clear file scope
- acceptance criteria for the task

The meeting explicitly described the need to go page by page, identify what is required, identify which APIs support each page, and document all of that before feeding it to Claude. [page:1]

---

## 6. Standard Claude Session Flow

Use this as the default workflow.

### Step 1: Start from documented context
Pull the relevant planning materials from the repo.

### Step 2: Choose one bounded task
Examples:
- scaffold registration page
- draft invite verification API
- create assessment schema proposal
- add dashboard shell
- refine design system notes

### Step 3: Define scope clearly
List:
- goal
- files in scope
- files out of scope
- assumptions allowed
- acceptance criteria

### Step 4: Prompt Claude
Use the shared prompt template and provide only the context required for that slice.

### Step 5: Review the result
Check:
- architecture alignment
- code quality
- naming consistency
- overreach
- hidden assumptions
- maintainability

### Step 6: Test or inspect locally
Run the output where applicable and confirm the slice works as intended.

### Step 7: Revise if needed
Use a follow-up prompt or manual edits to tighten the result.

### Step 8: Commit the slice
Commit in the repo with clear, standardized commit wording.

### Step 9: Log outcomes
If decisions changed, update `docs/decision-log.md`.
If new tasks emerged, update planning docs or Jira mappings as needed.

---

## 7. Session Start Template

Before opening a Claude session, define the following:

- **Task name**
- **Goal**
- **Why this task matters**
- **Files Claude may read**
- **Files Claude may change**
- **Files Claude must not change**
- **Architecture sections relevant to the task**
- **Current assumptions**
- **Acceptance criteria**
- **Known open questions**

This mirrors the team’s desire to standardize the process and reduce ambiguity when different people try things in parallel. [page:1]

---

## 8. Session Stop Rules

A Claude session should be stopped when any of the following happen:

- the task scope starts drifting,
- the conversation context becomes too large,
- Claude starts repeating or losing precision,
- the output begins to touch files outside the intended slice,
- the team realizes a product decision is still unresolved,
- or the current result is good enough to review and commit.

The meeting explicitly raised the issue that real development sessions will need to stop and resume rather than continue endlessly with huge context windows. [page:1]

---

## 9. Session Resume Rules

When resuming a task, do not rely on the previous session alone.

Before restarting:
- summarize what was already done,
- identify files created or changed,
- restate the task goal,
- restate the acceptance criteria,
- note unresolved issues,
- and specify the next smallest useful step.

### Resume note template
- Previous task:
- Completed work:
- Files touched:
- Remaining issue:
- Current blocker:
- Next requested output:

This helps control token usage and prevents Claude from having to reconstruct the whole project state from scratch. [page:1]

---

## 10. Token and Context Management

The meeting explicitly noted that subscription limits and token budgets matter, so the workflow should be designed to reduce waste. [page:1]

### Best practices
- Do not paste the entire project context if only one small feature is being worked on.
- Prefer focused prompts over giant prompts.
- Reuse repo docs instead of rewriting the same context every time.
- Use summaries between sessions.
- Break large features into implementation slices.
- Prefer one coherent task per session.
- Capture useful decisions in the repo so future prompts stay smaller.

### Signs the context is too large
- Claude forgets recent constraints
- Claude starts rewriting unrelated areas
- Output quality drops
- Prompts become mostly historical recap instead of actionable input

---

## 11. Official Path vs Experiment Path

The team wants both a stable central path and room for experimentation. [page:1]

### Official path
Use this when:
- the work is intended for the main project direction,
- the task aligns with current architecture,
- Bichesq is ready to review or integrate it,
- and the result should become part of the central repo.

### Experiment path
Use this when:
- trying a different prompting strategy,
- testing a different implementation shape,
- exploring multi-agent methods,
- trying different Claude skills,
- or comparing alternate architectural ideas.

Experiment work should be labeled clearly and should not be merged into the central direction without review. [page:1]

---

## 12. Multi-Agent and Skill Experiments

The meeting mentioned possible future experiments with multi-agent workflows and different Claude skills. That should be treated as structured experimentation, not default behavior. [page:1]

### Use experiments when
- the core task is understood,
- the team wants to compare approaches,
- the risk of divergence is acceptable,
- and the experiment can be reviewed against a baseline.

### Do not use experiments when
- basic requirements are still unknown,
- the team has not agreed on the core flow,
- or the baseline implementation path is not yet stable.

---

## 13. Review Checklist for Claude Output

Before accepting AI-generated work into the main path, check:

- Does it align with `docs/architecture.md`?
- Did it stay within the requested file scope?
- Did it invent product behavior that was not agreed?
- Are names and concepts consistent?
- Is the code reasonably maintainable?
- Are success, error, loading, and validation states handled where relevant?
- Are assumptions stated clearly?
- Is the result small enough to review safely?
- Does it create follow-up tasks that should go into docs or Jira?

---

## 14. When to Use Claude for Planning vs Coding

### Use Claude for planning when
- the team needs structure,
- the flow needs decomposition,
- requirements need organizing,
- stories or subtasks need drafting,
- options need comparison,
- or unresolved decisions need to be framed cleanly.

### Use Claude for coding when
- the requirement is already documented,
- the slice is bounded,
- acceptance criteria exist,
- and the team is ready to review implementation output.

This distinction matters because the meeting’s next step is planning in detail first, then generating the skeleton with Claude. [page:1]

---

## 15. Commit and PR Expectations for AI Work

AI-assisted work should still fit the repo workflow.

### Commit expectations
- keep commits small,
- describe the actual slice implemented,
- avoid bundling unrelated AI output,
- and use the agreed commit wording pattern.

### PR expectations
PRs should note:
- whether AI was used,
- what task Claude was asked to perform,
- what was reviewed manually,
- any assumptions Claude made,
- and what reviewers should focus on.

The meeting explicitly called for standardizing commit verbiage and PR verbiage for the Cloud Heroes Africa app. [page:1]

---

## 16. Recommended First AI Tasks

Based on the meeting discussion, the first useful Claude tasks are likely:

1. Turn planning notes into a structured architecture draft
2. Refine page inventory from the current flow diagrams
3. Draft onboarding flow pages
4. Draft invite verification logic
5. Draft assessment data and screen structure
6. Propose a minimal dashboard shell
7. Suggest API contracts for the onboarding flow
8. Suggest a lightweight demo deployment shape

These are strong early tasks because they match the exact items Kris highlighted for the next session. [page:1]

---

## 17. Anti-Patterns to Avoid

Avoid these mistakes:

- asking Claude to build “the whole app” at once,
- prompting without documented requirements,
- accepting invented product rules,
- merging large unreviewed output,
- letting experiments quietly become the main path,
- continuing one bloated session for too long,
- or failing to record important decisions after AI-assisted work changes direction. [page:1]

---

## 18. Immediate Next Actions

After this file is added:
1. Use `prompts/claude-project-template.md` as the standard session starter.
2. Keep `docs/architecture.md` current before major AI implementation tasks.
3. Use `docs/decision-log.md` whenever Claude prompts expose unresolved assumptions.
4. Start with one bounded onboarding-related task.
5. Review and commit centrally through Bichesq’s repo path.
6. Let contributors use branches or forks for alternative approaches where helpful. [page:1]

