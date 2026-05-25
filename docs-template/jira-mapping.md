# Jira Mapping

This document explains how planning documents should map into Jira work items.

## Approach

- Major user journeys become **Epics**
- Pages, APIs, or major features become **Stories**
- Implementation details become **Subtasks**

## Example Mapping

### Epic
User Onboarding

### Stories
- Registration page
- Login page
- Invite code verification
- Assessment flow

### Subtasks
- Create page UI
- Add form validation
- Define API contract
- Implement backend endpoint
- Add database schema
- Add tests
- Add error handling

## Conversion Rules

When converting docs to Jira:
- Use architecture sections as source material
- Keep story scope small and testable
- Separate UI, API, and infrastructure tasks where useful
- Link every story back to a documented requirement
- Record unknowns before assigning implementation

