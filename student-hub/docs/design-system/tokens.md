# CHA Design Tokens

This document is the **technical catalog** of tokens. It is meant for reference in code, not for narrative explanations. Values are derived from the CHA Platform UI Kit HTML.[file:4]

## Fonts

Font family tokens:

- `--font-display`: Host Grotesk, Inter, system-ui, sans-serif.[file:4]
- `--font-body`: Inter, system-ui, -apple-system, sans-serif.[file:4]
- `--font-ui`: DM Sans, Inter, system-ui, sans-serif.[file:4]

These are implemented in `src/styles/tokens.css`.[file:4]

## Typography scale

Primary font-size tokens:[file:4]

| Token            | Size | Typical role                |
|------------------|------|-----------------------------|
| `--fs-display-xl`| 50px | Very large hero numerals    |
| `--fs-display-lg`| 46px | Major page titles           |
| `--fs-display-md`| 38px | Large section headings      |
| `--fs-h1`        | 32px | Primary page heading        |
| `--fs-h2`        | 28px | Section heading             |
| `--fs-h3`        | 23px | Card / module title         |
| `--fs-h4`        | 20px | Sub-heading                 |
| `--fs-lg`        | 18px | Large body / supporting text|
| `--fs-base`      | 16px | Default body text           |
| `--fs-sm`        | 14px | Controls / labels           |
| `--fs-xs`        | 12px | Captions                    |

Semantic text roles (examples): `--type-page-title`, `--type-section-title`, `--type-card-title`, `--type-body`, `--type-label`, `--type-caption`.[file:4]

## Core palette

Raw color tokens for the main palette:[file:4]

| Token             | Value            | Notes                    |
|-------------------|------------------|--------------------------|
| `--cha-orange-600`| rgb(232,84,26)   | Primary brand            |
| `--cha-orange-500`| rgb(236,90,28)   | Primary hover/active     |
| `--cha-orange-400`| rgb(255,141,40)  | Accent & warm highlights |
| `--cha-ocean-600` | rgb(41,151,193)  | Secondary brand          |
| `--cha-ocean-500` | rgb(50,167,212)  | Accent & module accents  |
| `--cha-ocean-400` | rgb(74,177,217)  | Lighter accent           |
| `--cha-blue-500`  | rgb(4,133,247)   | Links, active states     |
| `--cha-blue-400`  | rgb(53,146,249)  | Link hover               |
| `--cha-eclipse`   | rgb(24,24,27)    | Dark base surface        |
| `--cha-ink`       | rgb(31,31,33)    | Primary text             |
| `--cha-zinc-500`  | rgb(113,113,122) | Muted/secondary text     |
| `--cha-zinc-200`  | rgb(222,222,224) | Light borders            |
| `--cha-zinc-150`  | rgb(231,231,231) | Subtle borders/fills     |
| `--cha-canvas`    | rgb(242,244,251) | Page background          |
| `--cha-white`     | rgb(255,255,255) | Cards & raised surfaces  |

These are also mirrored in `tokens.css`.[file:4]

## Semantic color aliases

Semantic tokens (preferred in code):[file:4]

- Brand & accent:
  - `--color-primary`, `--color-primary-hover`, `--color-primary-fg`.
  - `--color-secondary`.
  - `--color-accent`, `--color-accent-hover`.

- Text:
  - `--text-primary`, `--text-secondary`, `--text-tertiary`.
  - `--text-muted`, `--text-inverted`.
  - `--text-link`, `--text-accent`.

- Surfaces:
  - `--surface-page`, `--surface-card`, `--surface-raised`.
  - `--surface-sunken`, `--surface-dark`, `--surface-fill`.

- Structure:
  - `--border-subtle`, `--border-default`, `--border-strong`.
  - `--separator`, `--focus-ring`.

Use these semantic tokens in HeroUI component wrappers instead of referencing raw RGB values directly.

## Status tokens

Status-related tokens (examples from the kit):[file:4]

- Success: `--status-success`, `--status-success-soft-bg`, `--status-success-fg`.
- Warning: `--status-warning`, `--status-warning-soft-bg`, `--status-warning-fg`.
- Danger: `--status-danger`, `--status-danger-soft-bg`, `--status-danger-fg`.
- Info: `--status-info`, `--status-info-soft-bg`, `--status-info-fg`.

Use these for badges, alerts, and inline status labels.

## Spacing scale

Spacing tokens from the HTML kit:[file:4]

Common values:

- Micro: `--space-1` (4px), `--space-2` (8px), `--space-3` (12px).
- Component: `--space-4` (16px), `--space-5` (20px), `--space-6` (24px).
- Layout: `--space-8` (32px), `--space-10` (40px), `--space-12` (48px), `--space-16` (64px), `--space-20` (80px), `--space-24` (96px).

Half-step tokens (e.g. `--space-1-5`) exist in the HTML kit and can be added as needed.[file:4]

## Radii

Rounding tokens:[file:4]

- `--radius-sm`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px
- `--radius-xl`: 12px
- `--radius-2xl`: 16px
- `--radius-2-5xl`: 20px
- `--radius-3xl`: 24px
- `--radius-4xl`: 32px
- `--radius-pill`: 999px

Use larger radii for major cards and hero surfaces.

## Shadows

Shadow tokens (values taken from the kit and normalized):[file:4]

- `--shadow-xs`: 0 1px 2px rgba(0, 0, 0, 0.04)
- `--shadow-sm`: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)
- `--shadow-md`: 0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)
- `--shadow-lg`: 0 8px 28px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)
- `--shadow-card`: 0 2px 10px rgba(0, 0, 0, 0.05)

## Theming tokens and dark mode

The HTML kit includes light and dark variants for surfaces, text, borders, and separators; dark mode overrides are reflected in `tokens.css` under `[data-theme="dark"], .dark`.[file:4][page:2]

All theming decisions should use these tokens; do not create per-component ad hoc color values.