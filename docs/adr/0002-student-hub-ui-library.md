# ADR-0002: UI Library for Student Hub (HeroUI V3 vs ShadCN)

- **Status:** Proposed
- **Date:** 2026-06-14
- **Deciders:** Team / Kris / Bichesq
- **Related:**
  - `docs/decision-log.md` (UI library working assumption, 2026-06-11)
  - Student Hub requirements MDs (especially dashboard + layout)
  - ADR-0001: Student Hub Auth with Approved Email List + Google Auth

## Context

Student Hub is the first implementation slice for the Cloud Heroes Africa platform and will set expectations for look-and-feel, interaction patterns, and component reuse across the rest of the student-facing surface. [cite:2]

In the June 11 session, Kris identified **HeroUI V3** (formerly NextUI) as the leading candidate UI library for Student Hub, with **ShadCN** also mentioned as a strong alternative.  
The team agreed that a decision is needed before detailed per-screen requirements are finalized, so that:

- Screen designs can align with the chosen component set.
- Claude can generate consistent component code.
- Styling and theming can be reused across later modules. [cite:2]

The Student Hub front-end will likely be built with React/Next.js, and we expect:

- A relatively rich dashboard (cards, tables, widgets).
- Forms (profile, registration redirects, help desk entry points).
- Navigation, modals/drawers, and notifications.
- Good dark/light mode story, responsive design, and accessibility.

## Decision

We will use **HeroUI V3** as the primary UI component library for the Student Hub front-end.  
ShadCN and other libraries may still be referenced for patterns or individual implementations, but HeroUI V3 is the default choice for layout, components, and theming in Student Hub.

Once accepted, all new Student Hub screens should:

- Prefer HeroUI V3 components and patterns.
- Use HeroUI’s theming system for colours, typography, and spacing.
- Avoid mixing in other UI kits unless there is a clear gap and a deliberate micro-decision (which can be documented separately if significant).

*(If you decide otherwise, you can flip the chosen option in this section and adjust the rationale accordingly.)*

## Options Considered

1. **HeroUI V3 (NextUI)**

   - Pros:
     - Modern, opinionated React component set with good defaults for dashboards and apps (cards, tables, nav, etc.).
     - Strong theming support out-of-the-box, including dark mode and design tokens.
     - Good fit for quickly building a polished student dashboard without heavy design work for every primitive.
     - Clear documentation and a design language that maps well to what Kris described for Student Hub (tiles, widgets, cards for progress, calendar, help desk, etc.). [cite:2]
   - Cons:
     - Opinionated styling can be a constraint if you want very custom look-and-feel later.
     - Adds another dependency layer on top of your base styling approach (e.g., Tailwind/vanilla CSS).
     - Ecosystem is smaller than the Tailwind-native ShadCN pattern for some very custom workflows.

2. **ShadCN (component recipes on top of Tailwind)**

   - Pros:
     - Very popular in the modern React/Next.js ecosystem; pairs well with Tailwind.
     - Provides “copy-paste into your codebase” patterns, making components highly customizable and not locked into a library runtime.
     - Good for teams wanting maximum control and evolvability of component implementations.
   - Cons:
     - More work to integrate and maintain, especially if patterns change upstream.
     - Less “out-of-the-box” theming: you own more of the design system surface.
     - For a project that wants to reduce UI friction and minimize design time, this can increase early workload.

3. **Baseline Tailwind / CSS + minimal primitives (no major UI kit)**

   - Pros:
     - Maximum control and minimal external abstraction.
     - No lock-in to a component library’s design or API decisions.
   - Cons:
     - Higher upfront design and implementation cost for every screen.
     - Harder for non-front-end-focused contributors (and Claude) to assemble consistent UI quickly.
     - Increases risk of visual inconsistency across modules and over time.

## Rationale

Student Hub needs to move quickly from idea to working POC while still looking coherent and trustworthy to students and stakeholders. [cite:2]  
The team already treats HeroUI V3 as the **leading candidate**, and its component set maps well to the type of interface we described (dashboard widgets, cards, navigation, modals). [cite:2]

Key reasons to choose HeroUI V3:

- **Speed to value:**  
  HeroUI provides pre-built, styled components suitable for dashboards and forms, which reduces the time you spend on base UI wiring and allows you to focus on domain logic and flows.

- **Consistency across screens:**  
  Using a single, opinionated library lowers the risk of each screen drifting into different patterns over time. This matters for a multi-module platform where Student Hub is the first impression.

- **Good enough customization story:**  
  While ShadCN offers deeper code-level control, HeroUI’s theming and styling options are sufficient for Phase 1. If later phases demand more custom design, we can layer on custom components selectively or re-evaluate.

- **Alignment with planning process:**  
  You will be writing per-screen requirements MDs and Figma-like descriptions. Having a stable component vocabulary (HeroUI’s) makes those requirements easier to specify and easier for Claude to implement accurately.

Given the POC focus, HeroUI V3 delivers a strong balance of speed, coherence, and maintainability without over-optimizing for flexibility that may never be needed.

## Consequences

### Positive

- Faster Student Hub implementation with a coherent visual language.
- Clear component vocabulary for requirements docs, code, and Claude prompts (e.g., “HeroUI Card”, “HeroUI Table”, “HeroUI Modal”).
- Reduced front-end bikeshedding around primitive design and layout.
- Easier future reuse of patterns for other student-facing surfaces that borrow from Student Hub.

### Negative / Risks

- Later, if you want a very unique visual brand or deeply customized interactions, HeroUI’s abstractions may feel constraining.
- Contributors familiar with ShadCN/Tailwind patterns might need to adjust to HeroUI’s APIs and design system.
- If HeroUI’s ecosystem slows or changes significantly, you may need to invest in migration or custom wrappers.

### Follow-ups / Tasks

- [ ] Confirm decision with Kris and update **Status** to `Accepted` or adjust the chosen option if the team prefers ShadCN.
- [ ] Add a short note in `docs/decision-log.md` pointing to this ADR as the canonical record for the Student Hub UI library decision.
- [ ] Update Student Hub requirements MDs to reference HeroUI components explicitly where helpful (e.g., “this section uses HeroUI `Card` + `Table`”).
- [ ] Configure the project to use HeroUI V3 (installation, theme setup, base layout).
- [ ] Create a small “UI sandbox” page in the repo demonstrating commonly used components (buttons, cards, alerts, modals) for quick reference.

## Status History

- **2026-06-14** – ADR drafted as **Proposed** based on the June 11 meeting, with HeroUI V3 as the recommended choice.
- **YYYY-MM-DD** – (to be filled) Accepted / Rejected after team review.