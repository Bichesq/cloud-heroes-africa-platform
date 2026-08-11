# Repository Audit — Cloud Heroes Africa Platform

> Discovery-only audit. Date: 2026-08-11.

## 1. Monorepo Tooling

**Not present** — no `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`, or root `package.json`/`package-lock.json` of any kind. There is no workspace manager at all.

The "monorepo" is actually just **sibling folders under one git repo**, each a fully independent Next.js project with its own `package.json`, `node_modules`, `package-lock.json`, and lockfile. Nothing hoists dependencies or wires the apps together at the tooling level — root-level sharing is done by filesystem convention (see §4/§8), not by workspace config.

Root structure:
```
.claude/  .code-review-graph/  .github/  .vscode/
backup/   data/   docs/   docs-template/
learning-platform/   prompts/   student-hub/
.mcp.json  .gitignore
AGENTS.md  CLAUDE.md  CONTRIBUTING.md  GEMINI.md  README.md
sync-cha-notes.bat
"This"  "Working"   ← two stray empty files, likely accidental (e.g. from a pasted command), not project files
```

`docs/decision-log.md` confirms this is deliberate: **"Platform monorepo — a monorepo will house all five sub-applications... (Decided, 2026-06-15)"**, but the workspace tooling to back that decision hasn't been set up yet — only 2 of the planned 5 app surfaces (Student Hub, Learning Platform) exist as code today.

## 2. Existing Apps/Packages

No `apps/*` or `packages/*` convention — apps sit at repo root by name. No `packages/` (shared library) directory exists at all.

| Directory | package.json name | Purpose (inferred) |
|---|---|---|
| `student-hub/` | `student-hub` | Student-facing gateway app — auth/login, dashboard, profile, calendar, help/service desk, "my program" progress. Runs on default Next.js port. |
| `learning-platform/` | `learning-platform` | Course delivery app — catalog, programs/units, knowledge checks, readiness assessments, notes. Runs on port 3001 (`next dev -p 3001`), separate deployment from Student Hub, linked via a "handshake." |

Three more app surfaces (Learning Management, Administration, Donor Hub) are decided-but-not-yet-built per the decision log.

There is no shared package for cross-app code (types, UI, auth). Each app duplicates its own `lib/auth.ts`, `lib/approved-emails.ts`, `lib/support-schema.ts`, `lib/support-tickets.ts`, etc. — near-identical files exist independently in both apps rather than being extracted to a shared package.

## 3. Backend Stack

Both apps are identical here (same versions, same choices):

- **Language/runtime**: TypeScript (`typescript ^5`), Node types `@types/node ^20`. `tsconfig.json` targets `ES2017`, `strict: true`, `moduleResolution: bundler`, path alias `@/*` → app root.
- **Web framework**: **Next.js 16.2.9** (App Router), React 19.2.4. No separate Express/Fastify/NestJS — backend logic lives entirely in Next.js Route Handlers under `app/api/**/route.ts`.
- **ORM/database client**: **None.** No Prisma/Drizzle/TypeORM/pg dependency in either `package.json`. Persistence is flat JSON files read/written via `fs.readFile`/`fs.writeFile` (see §4). A Postgres schema exists as a design doc only (`docs/learning-platform/schema.sql`), explicitly not yet wired to code.
- **Validation library**: **Zod** (`zod ^4.4.3`) — e.g. `student-hub/lib/profile-schema.ts`, `todo-schema.ts`, `support-schema.ts`, and equivalents in `learning-platform/lib/`.
- **Test runner**: **Not present.** No Vitest/Jest config, no `*.test.ts`/`*.spec.ts` files found anywhere outside `node_modules`.
- **Linting/formatting**: ESLint 9 flat config (`eslint.config.mjs`) per app, extending `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`. **Per-app, not shared** — each app has its own copy of the same config; no shared root ESLint config or Prettier config found anywhere in the repo.
- **Auth**: `next-auth@5.0.0-beta.31` (Auth.js v5) in both apps — Google OAuth, split into `auth.config.ts` (Node runtime) and `auth.config.edge.ts` (Edge-safe, used by `proxy.ts`, the renamed Next.js middleware file).

## 4. Database

- **Schema file**: `docs/learning-platform/schema.sql` — a **target/planned** Postgres schema (not yet applied anywhere), documented as "Decisions: custom backend on Postgres (2026-07-13, Payload CMS abandoned); JSONB for flexible payloads." Tables include `lp_programs`, `lp_modules`, `lp_units`, `lp_sections`, `lp_items`, `lp_content_blocks`, `lp_knowledge_checks`, etc., plus shared identity tables (`approved_emails`, `students`, `support_tickets`, `audit_log`) noted as owned by "platform core."
- **No migrations folder, no docker-compose.yml, no actual DB engine configured.** `docs/database-evaluation.md` (dated 2026-07-10) is a live comparison of MongoDB vs. Postgres for this data model, recommending Postgres + Prisma on AWS RDS (`db.t4g.micro`), but per the decision log this is still listed as an **Open** decision ("Database final selection: Postgres vs NoSQL — urgent before data model is locked").
- **Actual current persistence**: local JSON files, read/written through a small hand-rolled store layer:
  - Root-level shared stores: `data/approved-emails.json`, `data/students.json`, `data/support-tickets.json`, `data/audit-log.json` — shared across apps.
  - App-local stores: `student-hub/data/*.json` (events, programs, progress, todos) and `learning-platform/data/*.json` (lp-assessments, lp-enrollments, lp-knowledge-checks, lp-programs, lp-student-items, lp-student-units).
  - `learning-platform/lib/store/json-store.ts` is the generic `readStore<T>`/`writeStore<T>` helper; its own comment states the intent explicitly: *"swapping to Postgres... replaces only these modules."*
  - Cross-app sharing convention: `learning-platform/lib/shared-data.ts` resolves a `SHARED_DIR` (`process.env.SHARED_DATA_DIR ?? path.resolve(process.cwd(), "..", "data")`) pointing at the repo-root `data/` folder — this is how the two apps currently "share a database" without an actual DB.

## 5. Existing Conventions

**Route/folder structure** (Next.js App Router, same pattern in both apps):
- Route groups: `app/(student)/...` (student-hub) / `app/(learner)/...` (learning-platform) for the authenticated shell; `app/(public)/`, `app/not-approved`, `app/SignIn` outside it.
- Each page folder has its own local `components/` (and sometimes `data/`) subfolder for page-scoped UI, e.g. `app/(student)/dashboard/components/`.
- API routes under `app/api/<resource>/route.ts`, with dynamic segments as `[id]` folders (e.g. `app/api/knowledge-checks/[kcId]/attempts`).
- Business logic/data-access lives in `lib/` at the app root, named by domain (`auth.ts`, `curriculum.ts`, `todos.ts`, `streak.ts`, `support-tickets.ts`), not by technical layer (no `controllers/`, `services/`, `models/` split). Learning-platform additionally has `lib/store/` for its JSON persistence modules and `lib/tts/` for text-to-speech.
- Naming: kebab-case files, PascalCase components, one Zod schema file per domain (`*-schema.ts`).

**Documentation files** (each is short enough to quote fully rather than summarize):

- Root `CLAUDE.md` and `AGENTS.md`: mandate using the **code-review-graph MCP tools before Grep/Glob/Read** for any code exploration, and mandate the **build-page-from-screenshot skill** before implementing any UI.
- `student-hub/CLAUDE.md` (app-scoped, overrides nothing but adds to root): mandates HeroUI v3 only, design tokens from `docs/design-system/`, and MCP-backed HeroUI docs before implementing components — "Design system first, HeroUI v3 primitives second, MCP docs always, custom composition last."
- `GEMINI.md`: likely a Gemini-CLI equivalent of CLAUDE.md (same repo, multi-assistant setup) — not inspected in detail.
- `README.md` frames this repo as a **planning/AI-assisted-dev workspace**, not a conventional product monorepo — "Prepare a complete working project skeleton... before AWS approval."
- `CONTRIBUTING.md` describes a **lead-developer model**: Bichesq owns central direction; others work via branches/forks/experiments merged back in.
- `docs/decision-log.md`: an extremely detailed, dated log of ~150+ product and process decisions (2026-05-18 → 2026-08-06) — authoritative source for "why" behind current scope (e.g. invite codes eliminated, Payload CMS abandoned, Postgres migration still pending, points-based unit unlocking, assessment rules, etc.).
- `docs/architecture.md`: pre-planning draft, still framed as "Version: Initial working draft... Pre-planning draft for team working session" — i.e. aspirational, not as-built.
- `docs/database-evaluation.md`: standalone technical evaluation (MongoDB vs Postgres), recommends Prisma+Postgres but not yet implemented.
- `docs/Cloud Heroes Africa Design System/`: contains `SKILL.md`, `tokens/`, `components/`, `ui_kits/`, a design bundle (`_ds_bundle.js`, `_ds_manifest.json`) and an oxlint adherence config (`_adherence.oxlintrc.json`) — the design-system source referenced by the `build-page-from-screenshot` skill.
- `docs-template/` and `backup/`: template copies of the docs structure and dated backups of `decision-log.md` — housekeeping, not live conventions.
- `prompts/`: reusable Claude prompt templates (`build_login_page.md`, `build_calendar_page.md`, `build_help.md`, `build-learning-platform.md`, `claude-project-template.md`) used to drive page-by-page implementation.

## 6. Environment/Config Handling

- **No `.env.example`** found in either app or at root — a gap for anyone onboarding a new app or new contributor.
- Each app has its own `.env.local` (gitignored) with app-specific variable names, no shared/root env file:
  - `student-hub/.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_REGISTRATION_FORM_URL`, `NEXT_PUBLIC_LEARNING_PLATFORM_URL`.
  - `learning-platform/.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_REGISTRATION_FORM_URL`, `NEXT_PUBLIC_STUDENT_HUB_URL`, `INTEGRATION_TOKEN` (server-to-server integration secret between the two apps).
  - Note: reCAPTCHA vars survive in student-hub's `.env.local` even though the decision log records reCAPTCHA as removed (2026-06-11) — likely stale/unused now.
- No config-validation module (no `env.ts`/`t3-env`/zod-parsed env) — env vars are read directly via `process.env.X` at point of use (e.g. `shared-data.ts`'s `SHARED_DATA_DIR` fallback). Cross-app data sharing path is itself controlled by an env var (`SHARED_DATA_DIR`, defaulting to `../data` relative to `cwd()`).

## 7. CI/CD

**Not present**, essentially. `.github/` contains only `PULL_REQUEST_TEMPLATE.md` — no GitHub Actions workflows (`.github/workflows/` doesn't exist), no other CI config, no deployment scripts found anywhere in the repo (aside from `sync-cha-notes.bat` at root, which appears to be a local note-sync utility unrelated to app deployment). Build/deploy today is presumably manual (`next build` / `next start` per app, no orchestration).

## 8. Other Structurally Notable Points for a New App

- **No shared package to depend on.** A new app would need to either duplicate `lib/auth.ts`, `lib/approved-emails.ts`, `lib/support-schema.ts` etc. again (current pattern) or this is the moment to extract a real shared package — worth flagging since decision log already commits to "one shared data store... across separate app surfaces."
- **Cross-app data sharing today is a bare filesystem convention**, not an API or DB: apps expect a sibling `data/` directory at `../data` relative to their own `cwd()`. A new app must sit as a sibling folder at repo root (same level as `student-hub`/`learning-platform`) for this path math to keep working, or set `SHARED_DATA_DIR` explicitly.
- **Port convention**: student-hub uses Next's default (3000), learning-platform hardcodes `-p 3001`. A third app should pick the next free port explicitly in its `dev`/`start` scripts.
- **Auth pattern to replicate**: `auth.config.ts` (Node) + `auth.config.edge.ts` (Edge) split, with `proxy.ts` (Next's renamed middleware) importing only the edge config — required because Edge Runtime can't import Node-only modules; profile-completion gating is deliberately kept out of the edge middleware and done in a Node-runtime layout instead.
- **Design-system compliance is enforced by CLAUDE.md instructions**, not lint rules: any new UI work must go through the `build-page-from-screenshot` skill and HeroUI v3 MCP docs.
- **No dead-simple root command** (no root `package.json` scripts) to run/build "everything" — each app must be `cd`'d into individually.
- **Two stray empty root files** (`This`, `Working`) look like an accidental artifact (e.g., pasted shell fragment) rather than intentional project files — flagged for cleanup, not touched as part of this discovery-only audit.
