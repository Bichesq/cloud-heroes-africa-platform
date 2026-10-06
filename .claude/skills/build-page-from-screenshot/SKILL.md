---
name: build-page-from-screenshot
description: MANDATORY for any page/screen/UI build or reproduction work in this repo (student-hub, learning-platform, or any future app) — not just when a screenshot is attached. Turns a screenshot, mockup, raw .fig file, or plain-text UI request into production code using HeroUI v3 and the Cloud Heroes Africa design system. Triggers on "build this page", "create a page/screen/component", "implement this UI", "reproduce this design/mockup/screenshot/.fig file", or any request to add/change UI inside student-hub or learning-platform.
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

### Step 1 — Read the source, whether it's an image or a raw .fig file

**If given a screenshot/mockup image:**
- Use Read on the file (multimodal) before anything else.
- Decompose it into regions: shell (topbar/sidebar), page header, primary
  content grid, cards, forms, tables, modals, empty/loading states.
- Note per-region: copy/text (title case vs sentence case per CHA voice),
  colors (map by eye to orange/ocean/electric-blue/eclipse/zinc, not raw
  hex), rounding (cards 20–24px, pills for buttons/chips/tabs), spacing
  rhythm, icons (CHA's ~38-glyph set vs generic).
- If multiple images show light/dark or responsive states, note the deltas
  instead of treating them as unrelated screens.

**If given a raw `.fig` file directly** (not a screenshot exported from it):
`Read` cannot open a `.fig` — it's a zip containing Figma's binary "Kiwi"
format, not an image, and there is no Figma API access in this environment.
Do not attempt to eyeball it as if it were an image, and don't skip straight
to inventing the page from memory. Instead, use the bundled decoder:

1. Decode the node tree and pull the exact media assets in one pass:
   ```
   python .claude/skills/build-page-from-screenshot/scripts/decode_fig.py \
     "<path/to/file.fig>" --out /tmp/fig-tree.json --extract-images /tmp/fig-images
   ```
   Requires only the Python standard library for the common case (raw-deflate
   compressed `.fig` files, which is most of them). If it reports a
   zstd-compressed segment, `pip install zstandard` and re-run — if that
   package genuinely can't be installed in this environment, fall back to
   asking the user for a per-frame PNG export instead of guessing.
2. `/tmp/fig-images/` now holds the design's **exact original media
   files** (photos, icons, illustrations — verify with a quick byte check,
   e.g. PNG files start `\x89PNG`, JPEGs start `\xff\xd8\xff`) under their
   content-hash names, unmodified. Use these files directly in the built
   page (copy the ones you need into the target app, e.g. `public/`) instead
   of recreating, approximating, or sourcing placeholder images — this is
   the main advantage over screenshot-based reproduction.
3. `/tmp/fig-tree.json` has one key, `nodeChanges`: a flat list of every
   node. Each node has a `guid` and `parentIndex.guid` — walk those to
   rebuild the page/frame/layer tree. Useful node `type`s: `CANVAS` (a
   Figma page), `FRAME` (a screen/artboard — match by `name` to the screen
   you're building), `TEXT` (real on-canvas copy under
   `textData.characters` — use it verbatim instead of guessing text), and
   `INSTANCE` (a component instance; `name` is the component name, useful
   for spotting reused patterns). The file is large (tens of MB for a big
   design) — don't load it wholesale into the conversation; write a small
   Python/Bash filter (`jq`, or an inline Python script) to pull just the
   frame(s) you need by name, the same way you'd narrow a Grep. To find
   which extracted image file fills a given node, grep that node's JSON for
   an image-typed paint entry and match its hash to a filename in
   `/tmp/fig-images/` — the exact field layout can vary by node kind, so
   inspect the JSON near the node rather than assuming one fixed path.
4. Continue with Steps 2–6 below using this structured data instead of a
   screenshot: it gives you exact text, exact hierarchy, and exact media, at
   the cost of not having a ready-made visual to eyeball. For Step 6's visual
   check, either ask the user for a PNG export of the specific frame(s) you
   built, or treat the file's own `thumbnail.png` (a single small overview
   render, extractable the same way as the images above) as a rough sanity
   check only — it is not a per-frame render.

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
