# CHA Platform — UI Kit

An interactive, high-fidelity recreation of the Cloud Heroes Africa product,
built entirely from the design system's own primitives.

Open **`index.html`** and use the switcher at the bottom to move between:

- **Dashboard** — "My Learning Path": course-track filters, module cards,
  up-next lessons with progress, learning-progress bars, recommended course.
- **Profile** — "My Profile": activity statistics, verified skill badges,
  resume-progress card, assignments table, course completion, monthly streak,
  upcoming live labs.
- **Calendar** — day view with date strip, event blocks + attendee groups,
  category filters, and the Create-Event popover.
- **Login** — branded sign-in with email, Google/Apple, and the community hero.

## Files
- `AppShell.jsx` — product chrome (top bar + left sidebar). Exposes `AppShell`.
- `DashboardScreen.jsx`, `ProfileScreen.jsx`, `CalendarScreen.jsx`,
  `LoginScreen.jsx` — screen content, each exposed on `window`.
- `index.html` — loads the DS bundle + screens and wires the switcher.

## Notes
- Composes DS components (`Button`, `Card`, `Chip`, `Tag`, `NavItem`, `Tabs`,
  `ProgressBar`, `Avatar`, `Input`, `Icon`, …) — no primitive is re-implemented.
- Skill/tool logos on the profile card are neutral placeholder tiles (the real
  AWS/Docker/Terraform/Red Hat marks are third-party and not bundled).
- The shell uses the fuller Profile/Calendar chrome across all app screens for
  consistency; the source Dashboard had a slightly lighter-weight top bar.
