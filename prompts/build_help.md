You are working inside the Cloud Heroes Africa repository.

Your task is to build the Student Hub Help / Support page, including both the frontend UI and the supporting functionality.

The implementation must use the repository documentation and design references already present in the repo, and it must reflect the distinction between Help Desk and Service Desk that has already been decided in the project documentation.

## Primary goal

Build a production-oriented Help / Support experience for Student Hub that helps students:
- understand what kind of help they need
- try self-service first
- escalate clearly when needed
- distinguish between learning/content help and account/technical support
- track support already in progress

This is not a static mockup task.
You must build both the UI and the supporting interaction/state structure.

## Files to use

Use these repo files as your inputs:

1. `docs/help2.md`
   - This is the improved version of the older `help.md`.
   - Treat this as the primary requirements source.

2. `docs/help.md`
   - This is the earlier version.
   - Use it for comparison, fallback clarification, and understanding what changed.

3. `docs/decision-log.md`
   - Use this to validate product behavior and settled decisions.
   - Consult it especially for Help Desk vs Service Desk boundaries, search-first support flow, escalation, intake rules, ticket lifecycle, context capture, and knowledge-base behavior.

4. Design references in `docs/student-hub/`
   - `Help View (Active State).*`
   - `Help View (Passive State).*`

If filenames differ slightly because of extension, spacing, or punctuation, locate the matching files in `docs/student-hub`.

## Requirement precedence

Follow this strict order:

1. `help2.md`
2. `help.md`
3. `decision-log.md`
4. existing Student Hub code patterns

Important:
- `help2.md` improves on `help.md`.
- You must compare `help2.md` against `help.md`.
- You must note the meaningful differences between them.
- If `help2.md` adds, refines, clarifies, restructures, or overrides anything in `help.md`, follow `help2.md`.
- Only use `help.md` when `help2.md` is silent or when the older file adds useful context that does not conflict with the improved version.
- Do not flatten both files into one vague blend.
- Do not ignore the differences.

## Product understanding

The implementation must preserve the distinction between:

- **Help Desk**
  - learning/content/community/course-related help
  - content understanding
  - lessons/programs/modules/units
  - learning support and community-style help

- **Service Desk / Support Tickets**
  - account/access/login/MFA issues
  - platform/technical problems
  - operational support
  - system/service issues

The student-facing experience should guide users to the right path without requiring them to understand internal operational structures first.

## Product decisions to respect

Your implementation must be compatible with the documented direction that:
- Help Desk and Service Desk are distinct modules with separate workflows.
- Help should be asynchronous first.
- Search/self-service should be surfaced before new request creation where appropriate.
- Help interactions should support escalation when self-service is insufficient.
- Help Desk intake should support at least a short description and a detailed description.
- Ticket/request tracking matters.
- Context may need to be derived automatically rather than forcing the student to classify everything manually.

If the docs mark something as unresolved, do not pretend it is finalized.
Instead, implement it in a flexible and extensible way, and clearly note the assumption in your summary.

## Design intent

Use the two Student Hub Help View images as the visual base:

- **Passive State** = default, neutral landing state
- **Active State** = selected category / engaged state

Match the mockups closely in:
- layout structure
- visual hierarchy
- category card layout
- banner/search composition
- common questions panel
- CTA placement
- passive/active styling behavior

But do not treat the mockups as functionally complete.
They are the design shell, not the complete product behavior.

## Gap-closure requirements from design review

The existing Help View mockups are a strong starting point, but they do not fully satisfy the documented requirements by themselves.

While implementing the page, explicitly close the following known gaps:

### 1. Add a visible search-results-first experience
- Searching should not only display an input field.
- The page must support showing matching help content, FAQs, articles, or existing threads/results before pushing the student into creating a new request.

### 2. Add a visible existing-requests / my-requests area
- Students should be able to see help already in progress.
- Include realistic UI for open requests, recent requests, current status, and latest update.

### 3. Add ticket/request lifecycle scaffolding
- The Support Tickets / Service Desk side must support status-oriented UI.
- Include realistic support for:
  - status
  - last updated
  - assigned owner/handler if applicable
  - timestamps or status history if appropriate
  - resolution state or summary area if required by the docs

### 4. Make category cards functionally meaningful
- Category selection must do more than change color.
- Selecting a category should filter or influence displayed help content, search suggestions, or request context.

### 5. Strengthen Help Desk vs Service Desk separation
- Do not only show two tabs with similar content.
- Help Desk should feel oriented around learning/content/community help.
- Service Desk / Support Tickets should feel oriented around account, login, access, and platform/technical issues.

### 6. Preserve visible escalation paths
- Self-service should be encouraged, but escalation must remain easy to find.
- The user should be able to move from search/browsing to opening a request without confusion.

### 7. Support no-results and already-open-request states
- If search returns nothing, provide useful next actions.
- If the student already has an open request, surface it clearly and reduce unnecessary duplicate submissions.

### 8. Make the active-state payoff real
- In the active-state mockup, a selected card is visually highlighted.
- In the implementation, that selection must also change content or next-step options meaningfully.

### 9. Add context-aware support behavior
- If the requirements imply category-aware or context-aware request creation, structure the code so selected category or page context can prefill or guide the request flow.

### 10. Preserve the mockup while improving functional completeness
- Keep the visual style close to the designs.
- Use the docs as the behavioral source of truth.
- Do not ship a static reproduction of the images.

## What to build

Implement the Help / Support experience with the following parts.

### 1. Route and page integration
- Add or complete the Student Hub Help route/page.
- Integrate it into the existing Student Hub layout and navigation.
- Reuse existing Student Hub page shell, sidebar, header, tab, card, and form patterns where sensible.

### 2. Top-level page structure
The page should clearly support:
- Helpdesk
- Support Tickets or Service Desk

This should be more than cosmetic.
Each side should have meaningfully different content emphasis and interaction patterns.

### 3. Helpdesk landing experience
Build the main Helpdesk page using the mockups as reference, including:
- hero/help banner
- prominent search field
- category cards
- common questions / troubleshooting
- “Need More Help?” CTA
- passive and active category states

### 4. Search-first self-service flow
Implement or scaffold a search flow where:
- the search bar is the primary entry point
- typed queries can show suggested help content
- existing FAQs/articles/results are surfaced first
- the student can still escalate if no answer solves the problem

If backend search is not available, use mock data or placeholder adapters, but structure the code cleanly for later API integration.

### 5. Category interaction behavior
Category cards must be interactive.
When selected, they should do one or more of the following:
- filter FAQs
- change suggested help content
- influence support request type/context
- prefill request metadata
- route the student more clearly toward the correct support path

### 6. Support request initiation
Implement the request/ticket initiation flow so that it supports at least:
- short description
- detailed description

Also support any additional fields or hidden context implied by `help2.md` or validated by `decision-log.md`.

If student taxonomy/classification should be minimized, do not force excessive manual categorization.

### 7. Existing request / ticket tracking
Include a student-visible area for support already in progress.

Support realistic UI structure for:
- open issues
- recent requests
- current status
- latest update
- support type/path
- timestamps/history where appropriate

### 8. Support Tickets / Service Desk view
Build the Support Tickets / Service Desk side so that it clearly supports:
- login/access/account issues
- MFA or identity-related support
- technical/platform problems
- operational support requests

This side should not feel like a copy of Help Desk with different labels.

### 9. Required states
Implement or scaffold support for:
- passive/default state
- active category state
- search state
- loading state
- no-results state
- empty state where relevant
- error state
- already-open/escalated request state

### 10. UX and accessibility
Ensure:
- keyboard-accessible category cards and buttons
- visible label/accessible name for search
- status does not rely on color alone
- student-friendly language
- low-friction navigation
- reassuring but concise copy
- maintainable component structure

## Functional interpretation rules

Use these rules while building:

- If `help2.md` is explicit, implement it.
- If `help2.md` differs from `help.md`, prefer `help2.md`.
- You must note those differences in your final summary.
- If `help2.md` is silent and `help.md` provides useful context without conflict, you may use it.
- If both are ambiguous, use `docs/decision-log.md` to validate direction.
- If something remains unresolved after reading all sources, implement it in a flexible way and clearly note it as an assumption.

## Implementation expectations

- Inspect the existing Student Hub codebase before building.
- Follow the project’s actual stack, conventions, patterns, and component architecture.
- Reuse existing components where sensible.
- Keep code modular, typed, and production-oriented.
- Avoid hardcoding logic that blocks future API/backend integration.
- Build realistic state models for categories, FAQs, search results, requests, and ticket statuses.

## Suggested architecture

Use the repo’s conventions, but the solution will likely need separation for:
- help categories config
- FAQ/common questions data
- search state and result rendering
- selected category state
- Help Desk vs Support Tickets tab/view switching
- support request form state
- ticket/request list state
- types/interfaces for support data

## Deliverables

You must produce all of the following:

1. Implemented Help / Support page frontend
2. Interactive behavior for passive and active states
3. Search-first self-service experience
4. Support request initiation flow/state
5. Existing request/ticket tracking UI
6. Integration into Student Hub route/navigation
7. Any supporting types, hooks, mock data, helpers, and components needed

## Final summary requirements

At the end, provide a concise implementation summary that includes:
- what you built
- which files you created or modified
- how `help2.md` differed from `help.md` in ways that affected implementation
- which image-review gaps you explicitly closed in the implementation
- any assumptions you made because parts of the docs were unresolved
- what backend/API integrations are still pending

## Non-goals

Do not:
- redesign unrelated Student Hub pages
- collapse Help Desk and Service Desk into one indistinct flow
- ignore the design mockups
- ignore the differences between `help2.md` and `help.md`
- create only a static mockup without meaningful state behavior
- invent product behavior where the docs already give direction

## Required working sequence

Follow this order:

1. Read `docs/help2.md`
2. Read `docs/help.md`
3. Compare them and identify meaningful implementation differences
4. Read `docs/decision-log.md` for validation and clarification
5. Inspect the two Help View image references in `docs/student-hub`
6. Inspect the existing Student Hub routes, layout, and components
7. Build the page and supporting functionality
8. Summarize the implementation, the doc differences, the gaps closed, and any remaining assumptions

## Important final check before coding

Before implementation, write a short internal implementation note that:
- lists the meaningful differences between `help2.md` and `help.md`
- lists the gaps in the Help View mockups that must be closed
- confirms that `help2.md` is the implementation source of truth

Start now.