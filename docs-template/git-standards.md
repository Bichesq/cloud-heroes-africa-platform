# Git Standards

This document defines branch, commit, and PR conventions for the Cloud Heroes Africa platform.

## Branch Naming

Use lowercase kebab-case.

### Types
- `docs/...`
- `feature/...`
- `fix/...`
- `experiment/...`
- `chore/...`

### Examples
- `docs/architecture-skeleton`
- `feature/user-registration`
- `fix/invite-code-validation`
- `experiment/claude-multi-agent-flow`
- `chore/repo-cleanup`

## Commit Messages

Use semantic commit prefixes.

### Format
`type: short description`

### Types
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `chore:` maintenance
- `refactor:` code restructuring without behavior change
- `test:` tests
- `ci:` CI/CD changes

### Examples
- `docs: add initial architecture skeleton`
- `feat: scaffold registration flow`
- `fix: validate invite code expiration`
- `chore: add repo contribution standards`

## Pull Requests

Every PR should answer:
- What was changed?
- Why was it changed?
- Was AI used?
- What prompt strategy was used?
- How was it tested?
- What should reviewers focus on?

## Main Branch Rule

`main` should stay stable enough to demo or hand off safely.

