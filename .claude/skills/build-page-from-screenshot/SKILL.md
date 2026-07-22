---
name: build-page-from-screenshot
description: MANDATORY for any page/screen/UI build or reproduction work in this repo (student-hub, learning-platform, or any future app) — not just when a screenshot is attached. Turns a screenshot, mockup, Figma export, or plain-text UI request into production code using HeroUI v3 and the Cloud Heroes Africa design system. Triggers on "build this page", "create a page/screen/component", "implement this UI", "reproduce this design/mockup/screenshot", or any request to add/change UI inside student-hub or learning-platform.
---

## Build Page From Screenshot

Reproduce a screenshot/image faithfully as working code, staying inside HeroUI v3
and the CHA design system rather than inventing arbitrary styles.

**Design system first, HeroUI v3 primitives second, MCP docs always, custom
composition last.**

### Step 0 — Establish targets

- Figure out which app this page belongs to: `student-hub/` (Next.js App
  Router, `@heroui/react` v3, next-auth) or `learning-platform/`. Confirm with
  the user if it's ambiguous.
- Confirm the CHA design system source: `docs/Cloud Heroes Africa Design
  System/` — NOT `docs/design-system/*.md` referenced in some stale CLAUDE.md
  files, which doesn't exist. Treat the real folder as authoritative:
  - `readme.md` — brand voice, color/type/shape rules, full component index.
  - `styles.css` + `tokens/*.css` — CSS variables (colors, typography,
    spacing, radii, shadows) to use instead of hardcoded values.
  - `components/` — reference JSX + `.d.ts` for the design system's own
    primitives (useful for seeing exact tokens/props a screen uses, even
    when the real implementation goes through HeroUI).
  - `ui_kits/platform/` — interactive recreation of real product screens
    (Dashboard, Profile, Calendar, Login) — open for visual ground truth.

### Step 1 — Read the image

- Use Read on the screenshot file (multimodal) before anything else.
- Decompose it into regions: shell (topbar/sidebar), page header, primary
  content grid, cards, forms, tables, modals, empty/loading states.
- Note per-region: copy/text (title case vs sentence case per CHA voice),
  colors (map by eye to orange/ocean/electric-blue/eclipse/zinc, not raw
  hex), rounding (cards 20–24px, pills for buttons/chips/tabs), spacing
  rhythm, icons (CHA's ~38-glyph set vs generic).
- If multiple images show light/dark or responsive states, note the deltas
  instead of treating them as unrelated screens.

### Step 2 — Ground the visual read in tokens

- Cross-check colors/type/shape guesses against `readme.md`'s VISUAL
  FOUNDATIONS section and `tokens/colors.css` / `tokens/typography.css` /
  `tokens/spacing.css`. Prefer semantic token names over one-off values.

### Step 3 — Query HeroUI v3 (non-negotiable, do this before writing code)

Use the `heroui-react` MCP tools for every component you plan to use:
1. `list_components` — confirm the v3 component exists and its exact name.
2. `get_component_docs` — API, compound-component structure, examples.
3. `get_theme_variables` — for theme/token alignment.
4. `get_component_source_code` / `get_component_source_styles` — only when
   you need to customize beyond documented props.

HeroUI v3 rules:
- v3 only — ignore any v2/provider-based knowledge.
- No `HeroUIProvider`, no framer-motion for core components.
- Use compound components (`Card.Header`, `Card.Content`, …), not flat props.
- Use `onPress`, not `onClick`, on interactive HeroUI elements.
- Tailwind CSS v4 import order: Tailwind before `@heroui/styles`.

### Step 4 — Map regions to components

Build a quick mapping table (region → HeroUI v3 component(s) → CHA tokens
applied) before writing JSX. Call out anything HeroUI doesn't cover directly
so it's built as clearly-labeled custom composition, not silently improvised.

### Step 5 — Implement

- Match the target app's existing file/component conventions (check sibling
  files under `app/(student)/...` in student-hub for patterns already in use
  — layout shells, data-fetching, naming).
- Use CHA tokens (via Tailwind theme vars / CSS variables) instead of
  arbitrary hex/px values.
- Preserve semantic HTML and accessibility (labels, roles, focus states —
  CHA's focus ring is a 4px blue ring at 15% alpha).

### Step 6 — Verify against the source image

- Run the dev server and compare the rendered page to the screenshot side by
  side (layout, spacing, color, type, states).
- Check responsive behavior and any hover/active/disabled/selected states
  called out in the design system (pill fills, 1px lift, disabled zinc-100
  @ ~55% opacity).

### Definition of done

- Visually aligned to the CHA system (color, type, spacing, radii, shape).
- HeroUI v3 used correctly — no v2 patterns, compound components, `onPress`.
- MCP-backed HeroUI docs were actually consulted, not recalled from memory.
- All styling uses CHA tokens, not arbitrary values.
- Rendered output verified against the original screenshot/image.
