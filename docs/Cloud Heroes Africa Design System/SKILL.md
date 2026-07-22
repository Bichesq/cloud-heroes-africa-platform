---
name: cha-platform-design
description: Use this skill to generate well-branded interfaces and assets for Cloud Heroes Africa (CHA Platform), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference
- **Brand:** Cloud Heroes Africa — cloud-careers learning platform. Warm,
  encouraging, "you"-focused, Title Case headings. Tagline: "Empowering
  Africans to build world-class cloud careers — for free."
- **Primary color:** orange `#E8541A`. Secondary: ocean `#32A7D4`. Links:
  electric blue `#0485F7`. Dark: `#18181B`. Canvas: `#F2F4FB`.
- **Type:** Host Grotesk (display/headings), Inter (UI/body), DM Sans (labels).
- **Shape:** generous rounding (cards 20–24px), fully-pill buttons/chips/tabs,
  soft low-alpha shadows.
- **Global CSS:** link `styles.css`.
- **Components:** load `_ds_bundle.js`, read from
  `window.CloudHeroesAfricaDesignSystem_45bdf7`. Full inventory + the
  interactive UI kit are in `ui_kits/platform/`.
- **Icons:** `<Icon name="…" />` from `components/icons/`.
