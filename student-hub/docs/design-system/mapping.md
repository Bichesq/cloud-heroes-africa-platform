# CHA Pattern Mapping (HeroUI v3)

This document is a **compact lookup table** and **checklist** used when Claude or a dev reproduces a design using HeroUI v3.

It does not restate the entire design system; it points to the right HeroUI primitives for common patterns and defines the reproduction workflow.[page:2][file:4]

## Quick mapping table

| CHA pattern (visual)          | HeroUI v3 primitive / pattern                             |
|------------------------------|-----------------------------------------------------------|
| Primary CTA button           | `Button` with `primary` variant                          |
| Secondary CTA button         | `Button` with `secondary` or `outline`/`ghost` variant   |
| Destructive button           | `Button` with `danger` variant                           |
| Large card / panel           | `Card` + `Card.Header` + `Card.Body`                     |
| KPI / metric tile            | `Card` with title, value, helper text                    |
| Profile section              | `Card` + form controls                                   |
| Filter/search bar            | `Form` primitives: `Input`, `Select`, `Button`, optional `Tabs` |
| Modal dialog                 | `Modal` (standard overlay)                               |
| Tabbed content section       | `Tabs`                                                   |
| Data table                   | `Table`                                                  |
| Status badge / pill          | HeroUI badge/chip (or composed from text + surface)      |

For each pattern, HeroUI usage must follow v3 rules (compound components, semantic variants, Tailwind v4, `onPress` where applicable).[page:2]

## Reproduction workflow for Claude

When Claude is asked to recreate a page:

1. **Read design system docs:**
   - `docs/design-system/overview.md`
   - `docs/design-system/tokens.md`
   - `docs/design-system/components.md`
   - `docs/design-system/page-recipes.md`

2. **Break the reference into sections:**
   - Identify header, main content areas, cards, tables, forms, etc.

3. **Map each section to HeroUI primitives:**
   - Use the table above and `components.md` for detailed rules.[page:2][file:4]

4. **Fetch HeroUI docs via MCP:**
   - For each required component, query the HeroUI MCP server for current docs, examples, and source before writing code.[page:2]

5. **Implement with CHA tokens:**
   - Use CHA semantic tokens from `tokens.md` and `tokens.css` for color, typography, spacing, and radii.[file:4]

6. **Report custom composition:**
   - If HeroUI does not cover a pattern directly, note where custom composition was needed and which tokens were used.

## Do-not rules

When mapping patterns:

- Do **not** build everything from raw `div`s if HeroUI has a matching component.[page:2]
- Do **not** use HeroUI v2 provider patterns or framer-motion-based setups.[page:2]
- Do **not** hardcode raw palette values when semantic tokens exist.[file:4]
- Do **not** ignore the design system’s spacing and typography scale.

This mapping file is intentionally concise; it is meant to be referenced alongside the other design-system docs and the HeroUI v3 SKILL file.[page:2]