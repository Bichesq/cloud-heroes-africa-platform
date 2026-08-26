---
name: plan-doc-writer
description: Use this whenever entering Plan Mode, being asked to "plan" something, sketching an implementation approach, or doing any design/scoping work before writing code in this repo. This applies to backend migrations, schema changes, new modules/routes, refactors, or any multi-step build — not just when the user says the word "plan." Before any implementation begins, always write (or update) a plan document under /docs/plan so the user can review it first. Do not start editing source files, running migrations, or scaffolding until the plan doc exists and the user has said to proceed. This is a hard workflow requirement for this project, not an optional nicety.
---

# Plan Doc Writer

This project requires every planning pass to leave behind a reviewable artifact **before** any implementation happens. The user (Bichesq) drives design decisions himself and uses Claude as a guide, not a generator of finished designs — the plan doc is what makes that review possible. Claude Code should never go straight from "here's my plan" (spoken in chat) into editing files; the plan has to land on disk first.

## When this triggers

- Claude Code enters Plan Mode for any task.
- The user asks to plan, scope, design, or think through an approach for a feature, migration, refactor, or bugfix.
- Claude is about to start a non-trivial implementation (more than a couple of files, a schema change, a new module, a new API contract) and hasn't written a plan doc yet in this session.

If it's a genuinely trivial one-line fix, a plan doc isn't necessary — use judgment. When in doubt, write one; a short plan doc costs little and the user has explicitly asked for this review step.

## What to do

1. **Check for an existing plan doc first.** Look in `/docs/plan/` for a file covering the same piece of work (matching topic/slug, not necessarily the same date). If one exists and is still relevant, **update it** rather than creating a duplicate — append a "Revision" section with the date rather than rewriting history silently.
2. **Write the plan doc before writing or editing any implementation code.** Plan Mode's output goes to disk, not just to the chat window.
3. **File location and naming:**
   ```
   docs/plan/YYYY-MM-DD-short-kebab-case-topic.md
   ```
   Example: `docs/plan/2026-08-17-assessment-engine-scoring.md`
4. **Use the template below.** Keep it concrete and skimmable — this is meant to be read and approved in a couple of minutes, not a design essay.
5. **Stop after writing the doc and ask for review.** Do not proceed to implementation, do not run migrations, do not start editing source files, until the user explicitly approves ("looks good, go ahead," "proceed," etc.). Treat silence or a vague acknowledgment as *not* approval.
6. **If the user requests changes**, edit the plan doc in place (don't create a new file) and re-present it for another round of review.
7. **Once implementation starts**, don't let the plan doc go stale silently — if execution diverges from the written plan in a meaningful way, note the divergence in the plan doc's "Revision" section as it happens, not just at the end.

## Plan doc template

```markdown
# <Title of the piece of work>

**Date:** YYYY-MM-DD
**Status:** Draft — awaiting review

## Context

Why this work is happening now. Link back to relevant decisions in
decision-log.md / system-design docs if applicable. 2-4 sentences.

## Goal

What "done" looks like, in one or two sentences.

## Scope

- What's in scope for this pass.
- What's explicitly out of scope (defer to a later pass / flagged as Open).

## Approach

Step-by-step plan, in the order work will happen. Be concrete about:
- Which files/modules are touched
- Any schema or data-shape changes
- Any new dependencies

1. ...
2. ...
3. ...

## Files / modules affected

- `path/to/file` — what changes and why

## Open questions / assumptions

Anything not yet confirmed with the team, or any assumption being made
to move forward. Flag it here rather than silently deciding it.

## Risks / things that could go wrong

Short list — migration reversibility, breaking changes, anything that
needs a rollback plan.

## Out of scope (explicitly deferred)

Bullet list — keeps scope creep visible and auditable.

---

## Revision log

- YYYY-MM-DD: initial draft
- YYYY-MM-DD: <what changed and why, e.g. "removed Section level per
  hierarchy correction" or "user requested X instead of Y">
```

## Things to avoid

- Don't skip the doc because the plan "seems simple" for anything touching schema, cross-surface contracts, or more than a couple of files.
- Don't bury the plan only in the chat transcript — it must exist as a file the user can open, diff, and comment on later.
- Don't silently overwrite an existing plan doc's history — use the Revision log so past decisions (and reversals, like the Section-level hierarchy walk-back in this project) stay visible rather than disappearing.
- Don't treat "I wrote the plan doc" as the same thing as "the user approved it" — those are two separate steps.
- Don't introduce architectural choices (new frameworks, new hierarchy levels, new conventions) in the plan doc without first checking them against `decision-log.md` and the system-design docs — surface tradeoffs, don't just assert a direction.