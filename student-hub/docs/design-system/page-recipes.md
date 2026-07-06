# CHA Page Recipes

This document describes **common page-level layouts** in the CHA platform. It helps Claude and devs compose sections consistently across different screens, using tokens and components defined elsewhere.

It is informed by the CHA Platform UI Kit screens for dashboard, profile, calendar, and login.[file:4]

## Dashboard

**Intent:** Give users a high-level view of activity, progress, and next actions.

Layout recipe:

1. App shell / main navigation.
2. Page title and optional date / context controls.
3. Summary metrics row (KPI cards).
4. Main modules (cards with lists, charts, or content).
5. Secondary panels (e.g. upcoming events, notifications, side info).

Implementation:

- Use `AppCard`/HeroUI `Card` for modules.
- Use `AppButton`/HeroUI `Button` for primary actions.
- Use Tokens for spacing (component vs layout) to keep breathing room.

## Profile

**Intent:** Show and edit user information, preferences, and roles.

Layout recipe:

1. Profile hero card (avatar, name, role, key stats).
2. Editable sections (account info, contact, preferences).
3. Secondary panels (activity history, connected accounts).

Implementation:

- Use cards for each editable section.
- Group related fields clearly with headings and descriptions.
- Emphasize primary actions (save/update) according to CHA button rules.

## Calendar / Schedule

**Intent:** View and manage time-based events and learning activities.

Layout recipe:

1. Title and period controls (month, week, date pickers).
2. View selector (tabs or segmented control).
3. Main calendar grid or list.
4. Side panel for event details or upcoming items (optional).

Implementation:

- Use Tabs for mode switching (e.g. month vs week).
- Use cards and lists for event summaries.
- Use CHA status tokens for event types/priorities when necessary.

## Login / Auth

**Intent:** Provide a clean, welcoming entry point to the platform.

Layout recipe:

1. Brand/title block (logo, product name, tagline).
2. Auth card (form fields and primary CTA).
3. Secondary text (help, terms, alternative actions).

Implementation:

- Use a single primary CTA (e.g. “Sign in”).
- Use CHA input and button tokens for fields and actions.
- Keep layout simple and centered, with enough space around the card.

## Learning Module / Lesson

**Intent:** Deliver learning content and guide users through progression.

Layout recipe:

1. Module header (title, level, progress).
2. Primary content area (lesson content, tasks).
3. Progress/actions strip (next/previous, mark complete).
4. Related resources / side notes (optional).

Implementation:

- Use cards and clear typographic hierarchy for content.
- Use status tokens and chips for progress states.
- Use a clear primary action for the next step in learning.

## General layout rules

Across all pages:

- Use spacing tokens to differentiate micro vs macro spacing.[file:4]
- Keep one clear primary action per major section.
- Use cards as the main layout building block for modules.
- Maintain consistent typography roles (page title vs section vs card title).