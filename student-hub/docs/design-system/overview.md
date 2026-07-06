# CHA Design System – Overview

This document explains **what** the CHA design system is and **how it should be used** in the product, at a high level. It is the human-readable narrative layer; technical details live in other files.

## Purpose

The CHA platform is an educational product. The design language should feel:

- Friendly and approachable, not harsh or overly “enterprise”.
- Clean and modern, with clear hierarchy and generous spacing.
- Warm and optimistic, suitable for kids, parents, educators, and African digital transformation.

All implementation work (Claude, human devs, HeroUI v3) should preserve this character.

## Visual character

Key traits of the CHA visual style (based on the HTML UI kit):

- Warm orange primary actions, ocean blue secondary accents, and an electric blue interaction/link color.[file:4]
- Soft rounded cards and panels, not sharp rectangles.[file:4]
- Neutral canvas backgrounds with white/near-white raised surfaces.[file:4]
- Low-contrast, soft shadows for elevation.[file:4]
- A card-heavy layout style for dashboards, profiles, calendars, and login flows.[file:4]

## Typographic character

The system uses three main font roles:[file:4]

- Display: Host Grotesk – for big page titles and hero moments.
- UI / body: Inter – for most text in the interface.
- Supporting / numeric: DM Sans – for selected UI labels and metrics.

Principle: display font for titles, Inter for most text, DM Sans sparingly where it helps legibility or character.

## Theming & modes

The HTML kit defines both light and dark token sets.[file:4] The product should:

- Support both modes.
- Keep all colors referenced through semantic tokens (e.g. `--color-primary`, `--surface-card`, `--text-primary`), not hard-coded RGB values.[file:4]
- Allow theme switching via standard mechanisms (e.g. HTML `class="dark"` or `data-theme="dark"`).[file:4][page:2]

## Implementation stack

This design system is implemented with:

- Next.js App Router.
- Tailwind CSS v4.
- HeroUI v3 (`@heroui/react`, `@heroui/styles`) with compound components and semantic variants.[page:2]
- CSS custom properties (`tokens.css`) mapped from the HTML kit.[file:4]

All React UI must use **HeroUI v3** patterns (no v2 providers, no framer-motion in core HeroUI usage) and **Tailwind v4**.[page:2]

## Where to find details

Use these files together:

- `overview.md` – vision and principles (this file).
- `tokens.md` – design tokens (fonts, colors, spacing, radii, shadows, theming).[file:4]
- `components.md` – how to use HeroUI components to express CHA patterns.[page:2][file:4]
- `page-recipes.md` – common page shapes and section ordering.[file:4]
- `mapping.md` – quick lookup table and reproduction checklist for Claude.[page:2][file:4]
- `src/styles/tokens.css` – actual CSS variables used by the app.[file:4]

Claude and human devs should read **overview.md first** to understand the intent, then use the other files for implementation.