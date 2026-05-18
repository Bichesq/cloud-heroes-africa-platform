# AI Workflow

This document defines how the team should use Claude and other AI tools while building the Cloud Heroes Africa platform.

## Principles

- AI helps accelerate delivery; it does not replace engineering review.
- Every AI-generated change must be reviewed by a human.
- Work should be broken into small, clearly scoped tasks.
- The team should avoid huge sessions with excessive context.
- Session continuity should be intentional and documented.

## Standard Workflow

1. Start from documented context.
2. Select one clear task.
3. Provide Claude only the relevant context.
4. Generate code or structure.
5. Review output.
6. Test locally.
7. Refine or correct.
8. Commit progress.
9. Log what was learned.

## Recommended Inputs to Claude

- Relevant section of `docs/architecture.md`
- Page or feature being implemented
- API contract
- Data model details
- Design system notes
- Existing code snippets
- Constraints and acceptance criteria

## Session Start Template

- Goal:
- Files in scope:
- Context provided:
- Constraints:
- Expected output:
- What not to change:

## Session Stop Rules

Stop the session when:
- the task has drifted,
- context is becoming too large,
- output quality is dropping,
- requirements have changed,
- or a natural checkpoint is reached.

## Session Resume Rules

Before resuming:
- summarize what was done,
- list unresolved issues,
- identify modified files,
- restate constraints,
- define the exact next task.

## Experimentation

Use separate branches or forks when:
- testing a different prompting approach,
- trying a different architecture direction,
- evaluating multi-agent workflows,
- or comparing implementation styles.

## Review Questions

- Is the generated code aligned with architecture?
- Is it maintainable?
- Is it secure?
- Is it testable?
- Is it simpler than the manual alternative?
- Should it be merged, revised, or rejected?

