# Cloud Heroes Africa — Design System

The design system for **Cloud Heroes Africa (CHA Platform)**, an online learning
platform that trains African learners for world-class cloud careers — DevOps,
Cloud Security, Terraform, Kubernetes, AWS — through self-paced tracks, live
labs, assessments and a peer community. Its promise, straight from the product:
**"Empowering Africans to build world-class cloud careers — for free."**

This repository is a *design system*: brand foundations (color, type, spacing,
shadows), the webfont setup, reusable React UI primitives, an icon set, and a
full interactive UI-kit recreation of the product.

**Status:** complete — 457 tokens, 86 component exports covering every family in
the source file, 18 Design System cards, and a 4-screen interactive UI kit
(Dashboard, Profile, Calendar, Login).

## Sources

- **Figma:** `CHA Platform.fig` (attached, mounted read-only). Pages used:
  `Dashboard-View`, `Profile-View`, `Calendar-View`, `Login-Page`. Tokens were
  materialised from the file's single Figma Variable collection (198 variables,
  Light/Dark/Alternative modes). No codebase or live URL was provided.
- The Figma Variable collection maps its `button-primary` role to **purple**,
  but every real product screen uses **orange** as the primary action color.
  We follow the product: brand orange is primary; the raw purple tokens are
  preserved in `tokens/fig-tokens.css` for fidelity but are not used in aliases.

---

## CONTENT FUNDAMENTALS — how CHA writes

- **Voice:** warm, encouraging, momentum-driven, practical. It treats the
  learner as a "hero" on a journey and celebrates progress ("You're on a
  Roll!", "Good Morning! Chem Patrick", "Resume Where You Left Off").
- **Person:** speaks to **"you"** / "your" ("My Learning Path", "Your
  Statistics", "Recommended for you"). First-person "My/Your" framing for the
  learner's own data.
- **Casing:** **Title Case** for headings, buttons and nav ("Create Event",
  "Verified Skills Badge Count", "Contact Support"); **sentence case** for
  descriptions ("Master CI/CD pipelines and automate your deployment
  workflows.").
- **Tone of CTAs:** direct, verb-first — "Resume Learning", "Create Event",
  "Contact Support", "Share Your Progress With Peers", "Continue".
- **Numbers & status:** progress is front-and-centre (87%, 60%, 32% Complete).
  Statuses are short pill labels: *In Progress*, *Submitted*, *Not Started*,
  *Locked*, *Upcoming*, *Beginner*.
- **Emoji:** essentially none in the UI chrome. Occasional inline glyphs (⏱ 🔗)
  appear in dense event cards; otherwise iconography carries meaning. Do not
  introduce decorative emoji.
- **Vibe:** aspirational but grounded, African-first, community-oriented,
  career-focused. Copy references real tools (Jenkins, Docker, Kubernetes,
  Terraform, AWS, Red Hat).

---

## VISUAL FOUNDATIONS

- **Color.** Brand **orange** (`#E8541A`/`#EC5A1C`) is the primary — CTAs,
  active nav, feature cards, progress. **Ocean blue** (`#32A7D4`) is the
  secondary accent (module cards, streaks, progress). **Electric blue**
  (`#0485F7`) is reserved for links and utility actions ("Create Event",
  "+ Add", toggles). Near-black **eclipse** (`#18181B`) powers dark chips,
  filled tabs and the "Log Out" button. Neutrals are a **zinc** ramp. The app
  canvas is a soft lavender-white (`#F2F4FB`); cards are pure white.
- **Type.** Three families. **Host Grotesk** (ExtraBold/SemiBold) for display
  and headings — big, confident page titles ("My Learning Path" at 44–46px).
  **Inter** for UI and body. **DM Sans** for some secondary/numeric labels.
  Titles are tightly leaded (~1.05); body is relaxed (~1.5).
- **Shape & rounding.** Very generous, soft rounding is the signature: cards at
  **20–24px**, feature cards up to 32px, and **fully-pill** buttons, chips, nav
  items, tabs, inputs and progress bars. Almost nothing has a sharp corner.
- **Cards.** White surface, no border, a **very soft low-alpha shadow**
  (`0 2px 10px rgba(0,0,0,.05)`). Colored feature cards (orange/ocean/blue) drop
  the shadow for solid fills and can nest a white inner panel (the Activity
  Overview stat card). Outline/sunken variants use a 1px zinc border with no
  shadow.
- **Shadows.** Uniformly soft and diffuse; alphas of 0.04–0.08. No hard or dark
  drop shadows. Elevation is communicated by rounding + fill, not heavy shadow.
- **Backgrounds.** Flat color fields — the lavender canvas and white cards.
  No gradients on chrome; the only gradient is inside progress-bar fills
  (orange 400→600, ocean 400→600). Imagery is warm, natural photography of
  African learners; the login uses an Africa-shaped photo collage over a faint
  grey world map.
- **Motion.** Restrained. Buttons lift 1px and change fill on hover
  (~140ms ease); progress bars ease-out their width; toggles/tabs cross-fade
  backgrounds. No bounces, no infinite loops.
- **States.** Hover = subtle fill change / 1px lift. Active nav = filled orange
  pill. Selected chip/tab = filled eclipse (or blue) pill. Disabled = zinc-100
  fill at ~55% opacity. Focus = 4px blue ring at 15% alpha + blue outline.
- **Borders.** 1px `zinc-200` on inputs, outline cards and dividers; hairline
  `separator` (#E4E4E7) between table rows and list items.
- **Layout.** Product shell = fixed 88px top bar (canvas colored) + 300px white
  left sidebar (top-right corner rounded) + scrolling main. Content pages use a
  two-column grid (≈1.9fr main / 1fr rail); the calendar uses three columns.
- **Transparency/blur.** Light use — semi-transparent white inner panels on
  colored cards (`rgba(255,255,255,0.15–0.82)`); scroll-shadow blur tokens exist
  for fade edges. No heavy glassmorphism.

---

## ICONOGRAPHY

- The Figma file ships a **custom line/glyph icon set (~38 icons)** — thin,
  rounded-cap strokes plus a few filled variants. These are materialised as
  real SVG path data in **`components/icons/icon-data.js`** and rendered with
  **`<Icon name="…" size={20} />`** (`components/icons/Icon.jsx`). Icons paint
  with `currentColor`, so recolor via CSS `color`.
- Friendly aliases are provided (`search`, `house`, `folder`, `settings`,
  `chevron-right`, `arrow-forward`, `plus`, `close`, `star`, `comment`,
  `logo-google`, `logo-apple`, …). The raw Figma-derived names are also valid —
  see `components/icons/Icon.d.ts` for the full list.
- Brand-tool logos (AWS, Docker, Terraform, Red Hat, Kubernetes) appear on the
  profile "Verified Skills" card in the original. Those are third-party brand
  marks and are **not** bundled here; the UI kit shows neutral labelled tiles as
  placeholders. Drop in official SVGs if you need them.
- **Emoji** are not part of the icon system. A couple of unicode glyphs (⏱ 🔗
  ☀ ☾) appear in the densest event cards / theme toggle in the source; prefer
  the `<Icon>` set for anything new.

---

## Index / manifest

**Foundations**
- `styles.css` — global entry point (import this). `@import`s everything below.
- `tokens/fonts.css` — Host Grotesk / Inter / DM Sans (Google Fonts).
- `tokens/fig-tokens.css` — raw Figma Variables (Light/Dark/Alternative modes).
- `tokens/colors.css` — brand palette + semantic aliases (`--color-primary`, …).
- `tokens/typography.css` — font families + type scale.
- `tokens/spacing.css` — spacing, radii, shadows.

**Components** (`window.CloudHeroesAfricaDesignSystem_45bdf7`) — 80+ exports
- `components/core/` — Button, ButtonGroup, ButtonGroupDivider, IconButton,
  CloseButton, Chip, Chips, Tag, TagList, Avatar, AvatarGroup, Link, Separator.
- `components/forms/` — Input, TextField, Label, DescriptionErrorMessage,
  Checkbox, CheckboxControl, Radio, Switch, SwitchControl.
- `components/navigation/` — NavItem, Tabs, Tab, TabsElement, CalendarDay,
  CalendarDayWeek, CalendarNavigation, CalendarDateNav, CalendarTime,
  CalendarTimeValue.
- `components/surfaces/` — Card, CardHeader, CardFooter, Surface, ModalHeader,
  ScrollShadow, ProgressiveBlur.
- `components/feedback/` — ProgressBar, Indicator, Chart, Grid, Lines, Legend,
  AxisX, AxisY.
- `components/icons/` — Icon (+ icon-data.js, 38 glyphs) and
  `components/icons/glyphs/` — 38 tree-shakeable named icon components
  (`House`, `Plus`, `Star`, `ChevronRight`, `LogoGoogle`, …).

**UI kit**
- `ui_kits/platform/` — interactive recreation: Dashboard, Profile, Calendar,
  Login. Open `index.html` and use the bottom switcher.

**Guidelines** — foundation specimen cards in `guidelines/*.card.html`
(Colors, Type, Spacing, Brand) shown on the Design System tab.

**Skill** — `SKILL.md` makes this folder usable as a Claude Agent Skill.

## Component coverage

The Figma file enumerates **79 component "families"**; this system implements
**all of them (86 exports)** across core, forms, navigation, surfaces, feedback
and icons.

### All components

- **Core** (13): `Avatar`, `AvatarGroup`, `Button`, `ButtonGroup`, `ButtonGroupDivider`, `Chip`, `Chips`, `CloseButton`, `IconButton`, `Link`, `Separator`, `Tag`, `TagList`
- **Forms** (9): `Checkbox`, `CheckboxControl`, `DescriptionErrorMessage`, `Input`, `Label`, `Radio`, `Switch`, `SwitchControl`, `TextField`
- **Navigation** (10): `CalendarDateNav`, `CalendarDay`, `CalendarDayWeek`, `CalendarNavigation`, `CalendarTime`, `CalendarTimeValue`, `NavItem`, `Tab`, `Tabs`, `TabsElement`
- **Surfaces** (7): `Card`, `CardFooter`, `CardHeader`, `ModalHeader`, `ProgressiveBlur`, `ScrollShadow`, `Surface`
- **Feedback** (8): `AxisX`, `AxisY`, `Chart`, `Grid`, `Indicator`, `Legend`, `Lines`, `ProgressBar`
- **Icons** (1): `Icon`
- **Icon glyphs** (38): `ArrowForward`, `ArrowUpright`, `Binoculars`, `CaretsExpandVertical`, `ChartPie`, `Check`, `Checkmark`, `ChevronDown`, `ChevronLeft`, `ChevronRight`, `ChevronRightLine`, `CircleDashed`, `CircleDollar`, `CircleInfo`, `CirclesDiamond`, `CloseLine`, `Cog`, `Comment`, `ContextualSearch`, `Ellipsis`, `Envelope`, `External`, `Folder`, `House`, `LogoApple`, `LogoGoogle`, `Magnifier`, `MapPin`, `Menucard`, `Minus`, `Person`, `PersonLine`, `Persons`, `Plus`, `QrCode`, `Square`, `Star`, `Xmark`

A few notes on how families map to components:

- **Icon glyphs** are shipped two ways: the single `Icon` component
  (`<Icon name="…" />`, 38 glyphs in `icon-data.js`) *and* 38 tree-shakeable
  named components in `components/icons/glyphs/` (`House`, `Plus`, `Star`,
  `ChevronRight`, `LogoGoogle`, …) — use whichever fits.
- **Figma-internal atoms** (the `_`-prefixed families: `_Grid`, `_Lines`,
  `_Legend`, `_Axis X`/`_Y Axis`, `_CheckboxControl`, `_SwitchControl`,
  `_ButtonGroupDivider`, `_Tab`, `_TabsElement`, `_CalendarDateNav`,
  `_CalendarTimeValue`, `_CalendarDayWeek`, `_CalendarTime`, `_CardHeader`,
  `_CardFooter`, `_ModalHeader`) are built as their own thin components
  (`Grid`, `Lines`, `Legend`, `AxisX`, `AxisY`, `CheckboxControl`,
  `SwitchControl`, `ButtonGroupDivider`, `Tab`, `TabsElement`, `CalendarDateNav`,
  `CalendarTimeValue`, `CalendarDayWeek`, `CalendarTime`, `CardHeader`,
  `CardFooter`, `ModalHeader`) *and* composed into the higher-level primitives
  (Chart, Checkbox, Switch, Tabs, Card, Calendar screens). Prefer the
  high-level components for app work; the atoms exist for fine-grained control.

Three family labels (`_Y Axis`, `check-2`, `circles-4-diamond`) are covered by
the identically-shaped `AxisY`, `Check` and `CirclesDiamond` components — only
the label string differs.

## Notes / substitutions
- Fonts load from **Google Fonts**. If you have licensed CHA font binaries,
  replace the `@import` in `tokens/fonts.css` with local `@font-face` rules.
- Skill/tool logos on the profile card are placeholders (see ICONOGRAPHY).
