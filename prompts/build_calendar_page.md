Task: Implement our CHA calendar page using the existing Next.js App Router + HeroUI v3 + CHA design system stack.

Context:
- Design reference: student-hub/docs/Calendar View Light 2 with Popup.png
- Route: app/(student)/calendar/page.tsx

Constraints:
- Read and follow:
  - docs/design-system/overview.md
  - docs/design-system/tokens.md
  - docs/design-system/components.md
  - docs/design-system/page-recipes.md
  - docs/design-system/mapping.md
  - src/styles/tokens.css
- Use our existing wrappers from app/(student)/ui:
  - AppCard
  - AppButton
  - SectionHeader
  - any other existing wrappers
- Use HeroUI v3 components under the hood, with Tailwind CSS v4 and @heroui/styles.
- Do NOT use HeroUI v2/provider patterns or framer-motion for core UI.
- Fetch HeroUI docs via the HeroUI MCP server for any components you plan to use (e.g. Tabs, Table, Modal).

Output format:
1. Section breakdown of the calendar page.
2. HeroUI component mapping for each section.
3. MCP lookup summary (which HeroUI components and docs you consulted).
4. Implementation plan.
5. Final code for CalendarWidget (or calendar page).
6. Notes on any custom composition or deviations from the design.