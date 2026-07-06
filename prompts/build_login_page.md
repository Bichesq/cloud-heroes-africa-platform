Task: Implement our CHA login page using the existing Next.js App Router + HeroUI v3 + CHA design system stack.

Context:
- Design reference: student-hub/docs/Frame 1.png
- Route: app/SignIn/page.tsx (the root route will no longer be configured as the NextAuth signIn page in student-hub/lib/auth.config.ts - change it as well to point to a home page we are yet to build)

Constraints:
- Read and follow:
  - docs/design-system/overview.md
  - docs/design-system/tokens.md
  - docs/design-system/components.md
  - docs/design-system/page-recipes.md
  - docs/design-system/mapping.md
  - app/globals.css
- Use our existing wrappers from components/ui:
  - AppCard
  - AppButton
  - any other existing wrappers
- Use HeroUI v3 components under the hood, with Tailwind CSS v4 and @heroui/styles.
- Do NOT use HeroUI v2/provider patterns or framer-motion for core UI.
- Fetch HeroUI docs via the HeroUI MCP server for any components you plan to use (e.g. Button, Form, Link).
- Integrate NextAuth sign-in functionality:
  - Use what has been implemented for the Sign In button.
  - Create 

Output format:
1. Section breakdown of the login page.
2. HeroUI and custom component mapping for each section.
3. MCP lookup summary (which HeroUI components and docs you consulted).
4. Implementation plan.
5. Final code for the Login page (replacing app/page.tsx).
6. Notes on any custom composition, styling details (e.g., left-side bronze background overlay, right-side map & collage implementation), or deviations from the design.
