# CLAUDE.md

This file defines how Claude Code should work in this repository.

## Security (non-negotiable)

Before writing or editing any code here, read `SECURITY.md` at the repo root
(`../SECURITY.md`) and apply every rule in it, regardless of whether this
task is explicitly about security.

## Goal

Implement CHA platform pages in this **Next.js App Router** codebase: HeroUI v3
(`@heroui/react`, `@heroui/styles`, Tailwind CSS v4), `next-auth`, and the CHA
design system.

## Building or reproducing any page/screen/UI

**Use the `build-page-from-screenshot` skill** for every page/screen/component
build or reproduction task — it's mandated repo-wide by the root `CLAUDE.md`
(`../CLAUDE.md`) and its full definition lives at
`../.claude/skills/build-page-from-screenshot/SKILL.md`. That skill defines:

- The authoritative design-system source: `docs/Cloud Heroes Africa Design
  System/` at the repo root (`readme.md`, `styles.css`, `tokens/*.css`,
  `components/`, `ui_kits/platform/`). **Not** `docs/design-system/*.md` or
  `src/styles/tokens.css` — those paths don't exist in this repo. (This file
  used to point at that non-existent structure; don't reintroduce it — keep
  the design-system workflow defined once, in the skill, not duplicated here.)
- The HeroUI v3 rules (v3-only, compound components, `onPress`, no
  `HeroUIProvider`) and the required `heroui-react` MCP query steps.
- The read → ground-in-tokens → query-MCP → map → implement → verify workflow.

When implementing, also match this app's existing conventions: check sibling
files under `app/(student)/...` for the layout shells, data-fetching
patterns, and naming already in use before adding new ones.