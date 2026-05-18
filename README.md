# Cloud Heroes Africa Platform

Central planning and AI-assisted development workspace for the Cloud Heroes Africa platform.

## Purpose

This repository is the central source of truth for planning, architecture, AI prompting, implementation workflow, and team experimentation for the Cloud Heroes Africa platform. It exists to help the team move from learning into building, produce a working demo before AWS approval, and create documentation detailed enough to drive Claude-assisted implementation.

## Current Goal

Prepare a complete working project skeleton that the team can use to:

- review the platform flow page by page,
- identify page requirements,
- define APIs and infrastructure needs,
- document decisions clearly,
- feed Claude structured implementation context,
- and later translate the plan into Jira epics, stories, and subtasks.

## Working Principles

- Bichesq is the lead developer and maintains the central implementation direction.
- Planning documentation comes before large-scale code generation.
- AI is used as a development accelerator, not as a substitute for review and technical judgment.
- Team members may fork or branch to test alternate approaches.
- Good ideas from experiments can be reviewed and merged back into the main direction.

## Initial Repository Structure

- `docs/architecture.md` — main planning and architecture working document
- `docs/ai-workflow.md` — how the team uses Claude during implementation
- `docs/git-standards.md` — branch, commit, and PR conventions
- `docs/decision-log.md` — important decisions and unresolved questions
- `docs/jira-mapping.md` — how documentation maps into Jira work items
- `prompts/claude-project-template.md` — structured Claude prompt template
- `.github/PULL_REQUEST_TEMPLATE.md` — standard PR format
- `CONTRIBUTING.md` — contribution and experiment rules

## Expected Outcomes

By using this repository well, the team should be able to:

- create a detailed implementation plan,
- scaffold the platform with Claude,
- keep changes organized and reviewable,
- compare alternate AI-assisted development approaches,
- and present a working demo to the board and early testers.

