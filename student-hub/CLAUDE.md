# CLAUDE.md

This file defines how Claude Code should work in this repository.

## Goal

Implement CHA platform pages in a **Next.js App Router** codebase using:

- HeroUI v3 (`@heroui/react`, `@heroui/styles`, Tailwind CSS v4).[page:2]
- The CHA design system (tokens, components, layouts) derived from `CHA-Platform-UI-Kit.html`.[file:4]
- The HeroUI MCP server for live v3 docs and component APIs.[page:2]

Claude must reproduce designs faithfully while staying within CHA’s design system and HeroUI v3 constraints.

## Authoritative design-system sources

When working in this repo, Claude must treat these files as **authoritative**:

1. `docs/design-system/overview.md`  
   - Read first on any new project or large refactor.
   - Explains product character, visual and typographic intent, and stack choices.[file:4][page:2]

2. `docs/design-system/tokens.md`  
   - Read whenever making decisions about colors, typography, spacing, radii, shadows, or theming.[file:4]
   - Use to select semantic tokens instead of hard-coded values.

3. `docs/design-system/components.md`  
   - Read for any task involving HeroUI components.
   - Maps CHA patterns to HeroUI v3 primitives and defines usage rules.[page:2][file:4]

4. `docs/design-system/page-recipes.md`  
   - Read when designing or modifying full pages.
   - Provides canonical page structures (dashboard, profile, calendar, auth, learning module).[file:4]

5. `docs/design-system/mapping.md`  
   - Read for design reproduction tasks.
   - Provides a quick mapping table and reproduction checklist.[page:2][file:4]

6. `src/styles/tokens.css`  
   - Use as the implementation reference for CSS variables.
   - Apply these tokens in Tailwind and HeroUI wrappers.[file:4]

Visual reference:

- `docs/references/design-system.html` – the original HTML UI kit; useful for human/LLM visual context but **not** the primary implementation spec.[file:4]

## HeroUI v3 rules (non-negotiable)

Claude must always follow the HeroUI v3 skill:[page:2]

- Use **HeroUI v3 only**; ignore v2 knowledge and provider-based patterns.[page:2]
- Use `@heroui/react` and `@heroui/styles` with Tailwind CSS v4.[page:2]
- Do not use `HeroUIProvider` or framer-motion for core components.[page:2]
- Use compound components (e.g. `Card.Header`, `Card.Title`) instead of flat prop APIs.[page:2]
- Use `onPress` for interactive HeroUI elements where supported.[page:2]
- Import Tailwind CSS before HeroUI styles in global CSS.[page:2]
- Always fetch component docs via MCP before implementing a new component.[page:2]

## MCP usage

For each task involving HeroUI components, Claude must:

1. Identify required component(s) (Button, Card, Input, Modal, Tabs, Table, etc.).
2. Query the HeroUI MCP server for:
   - Component docs (MDX).
   - Examples and usage patterns.
   - Source code and styles when needed.
   - Theme variables.[page:2]
3. Use these results as the source of truth for APIs and composition patterns.

Claude must prefer MCP-backed documentation over memory or assumptions.

## Standard workflow per task

For **page reproduction**:

1. Read `overview.md` once for overall context.
2. Read `tokens.md` and `components.md` to understand tokens and HeroUI usage.[file:4][page:2]
3. Read `page-recipes.md` to match the page type (dashboard, profile, calendar, auth, learning).[file:4]
4. Read `mapping.md` to see the quick mapping table and reproduction checklist.[page:2]
5. Inspect `tokens.css` to know available CSS variables.[file:4]
6. Break the target page into sections (shell, title, panels, forms, tables, etc.).
7. Map each section to HeroUI components using `components.md` and `mapping.md`.[page:2][file:4]
8. Query HeroUI MCP for each mapped component’s docs/examples/source.[page:2]
9. Implement the page in Next.js App Router using:
   - HeroUI v3 compound components.
   - CHA tokens from `tokens.md`/`tokens.css`.
   - Page structure from `page-recipes.md`.[file:4][page:2]
10. Note any custom-composed areas where HeroUI did not directly cover the pattern.

For **component-level changes** (e.g. updating a CTA, card layout, or filter bar):

1. Read `components.md` to see existing rules.
2. Read `tokens.md` for relevant tokens.[file:4]
3. Query MCP for HeroUI docs for that component.[page:2]
4. Update or create wrappers aligned to CHA styling and semantics.

## Definition of done

A change is only complete when:

- The design is visually aligned to the CHA system (colors, type, spacing, radii).[file:4]
- HeroUI v3 components are used correctly (no v2 patterns).[page:2]
- MCP-backed HeroUI docs were consulted.[page:2]
- The implementation follows the relevant page recipe for its screen type.[file:4]
- All styling decisions use CHA tokens instead of arbitrary values.
- Accessibility and semantic structure are preserved.

## Short mental model for Claude

Claude should operate with this simple rule:

> **Design system first, HeroUI v3 primitives second, MCP docs always, custom composition last.**[page:2][file:4]