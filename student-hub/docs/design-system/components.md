# CHA Component Rules (HeroUI v3)

This file describes **how CHA patterns should be implemented using HeroUI v3 components**. It is the bridge between your design tokens and HeroUI’s v3 APIs.[page:2][file:4]

All rules here assume:

- Next.js App Router.
- Tailwind CSS v4.
- HeroUI v3 (`@heroui/react`, `@heroui/styles`).
- No v2/provider usage, no framer-motion tied to core HeroUI behavior.[page:2]

## General rules

- Prefer HeroUI components first, then wrap or compose if a pattern repeats.
- Use **semantic variants** (`primary`, `secondary`, `ghost`, `danger`, `outline`) to express meaning.[page:2]
- Use HeroUI’s **compound components** (e.g. `Card.Header`, `Card.Title`, etc.) instead of flattening into prop bags.[page:2]
- Use `onPress` for interactive HeroUI elements where supported.[page:2]
- Always fetch HeroUI v3 docs via MCP before using a new component.[page:2]

## Buttons

**Purpose:** CTAs, side actions, and utilities throughout dashboards, auth, modules, and settings.

HeroUI primitive: `Button`.[page:2]

Mapping:

- Primary CTA: HeroUI `Button` with CHA `--color-primary` and variant `primary`.
- Secondary CTA: HeroUI `Button` with CHA `--color-secondary`, `outline` or `secondary`.
- Destructive: HeroUI `Button` with CHA danger tokens, variant `danger`.
- Low emphasis actions: `ghost` or `tertiary`.

Rules:

- One primary button per local context.
- Use CHA radii and spacing tokens for padding and rounding.
- Do not hardcode colors; use CHA semantic tokens and wrappers.

## Cards

**Purpose:** Core UI building block for dashboard modules, summaries, profile sections, and learning content.

HeroUI primitive: `Card`.[page:2]

Usage:

- Use `Card.Header` for titles, optional actions.
- Use `Card.Body` (or equivalent) for content.
- Use CHA card-related tokens for surface (`--surface-card`), shadow (`--shadow-card`), and border (semantic tokens).

Rules:

- Major cards should feel distinctly rounded (e.g. `--radius-2xl`+).
- Card titles should map to `--fs-h3` or the card title role from `tokens.md`.
- Use semantic text tokens for headings and body text.

## Inputs and form fields

**Purpose:** Login, profile, filters, settings, onboarding, and child/teacher workflows.

HeroUI primitives: `Form`, `Input`, `TextField`, `Textarea`, `Select`, switches, and related controls.[page:2]

Rules:

- Use HeroUI form primitives; fetch docs via MCP for exact anatomy and props.[page:2]
- Use CHA field tokens for background, border, focus ring, and text.
- Labels should use label typography tokens and remain visible.
- Focus states should use `--focus-ring` and not be removed.

## Navigation: tabs and section switching

**Purpose:** Switching between dashboard subviews, calendar modes, module segments, etc.

HeroUI primitive: `Tabs` (and related patterns).[page:2]

Rules:

- Use Tabs for clearly distinct content modes, not for micro-toggle interactions.
- Active tab states should use CHA accent tokens, not arbitrary colors.
- Ensure tab text is readable in both light and dark modes.

## Tables and structured lists

**Purpose:** Attendance, scores, schedules, admin data.

HeroUI primitive: `Table`.[page:2]

Rules:

- Use Table for tabular data instead of custom div grids.
- Use CHA neutral surfaces, separators, and status tokens for rows and badges.
- Maintain readable spacing and avoid overly dense rows.

## Badges, chips, and status pills

**Purpose:** Status indicators, tags, progress labels.

HeroUI primitive: Use HeroUI’s chip/badge component (from docs) or compose with text and surface tokens.[page:2]

Rules:

- Use CHA status tokens (`success`, `warning`, `danger`, `info`) for color.[file:4]
- Use pill radii (`--radius-pill`) for rounded chips where appropriate.
- Keep text legible and sized according to label/caption tokens.

## Modals and overlays

**Purpose:** Confirmations, focused tasks, contextual actions.

HeroUI primitive: `Modal`.[page:2]

Rules:

- Use Modal for true overlay tasks; avoid building custom overlays from scratch.
- Use CHA card surface and shadow tokens for modal containers.
- Place primary CTA on the right side of the footer (or your chosen consistent rule).
- Preserve keyboard accessibility and focus trapping as per HeroUI docs.

## Internal CHA wrappers

As the project matures, introduce thin wrappers around HeroUI to encode CHA defaults:

- `AppButton` – wraps HeroUI `Button` with CHA colors, radii, spacing.
  **Implemented at `components/ui/AppButton.tsx`.** Variants: `primary`
  (orange CTA), `secondary` (ocean), `accent` (utility blue, e.g.
  calendar "Create Event"), `dark` (eclipse chip), `outline`, `ghost`,
  `soft` (orange tint), `danger`. Radius: `pill` (default), `2xl`, `xl`.
  All colors come from the tokens in `app/globals.css`.
- `AppCard` – wraps HeroUI `Card` with CHA surface, shadow, and radius defaults.
  **Implemented at `components/ui/AppCard.tsx`.** Variants: `raised`
  (default, `.cha-card`), `outline`, `sunken`, `brand` (orange feature),
  `ocean` (ocean feature). Padding: `md` (default), `lg`, `none`. Compound
  parts re-exported: `AppCard.Header/Title/Description/Content/Footer`
  (`Title` applies the display font + card-title size).
- `SectionHeader` – standard layout for titles and meta/controls.
- `FilterBar` – standard composition of inputs, selects, and buttons.
- `MetricCard` – specialized card for KPIs and progress values.

These wrappers should **own CHA-specific styling and semantics**, not reimplement HeroUI functionality.