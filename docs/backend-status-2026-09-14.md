# Backend Status Report — Cloud Heroes Africa Platform

**Date:** 2026-09-14
**Prepared for:** Team sync
**Prepared by:** Bichesq (AI-assisted, verified directly against code/migrations/docs — not from commit messages alone)
**Scope:** Backend only (student-hub + learning-platform). No frontend/UI status included.

> Everything below was checked against the actual `prisma/schema/*.prisma` files, migration folders, `lib/`/`app/api/` source, and `docker-compose.yml` in this repo as of today — not inferred from commit titles or planning docs alone. Where a claim comes only from a planning doc and hasn't been verified in code, it's labeled "per docs" or "not yet verified in code."

---

## 1. TL;DR

- Both apps have moved off flat JSON files onto a **shared Postgres database via Prisma**. This is real and working in code (schema, migrations, and `lib/` call sites all confirmed).
- **learning-platform** owns the database migrations end-to-end and now has a materially complete **standalone-assessment engine** (question bank, randomization, partial credit, save-and-resume, retake cooldowns) plus Knowledge Checks, content hierarchy, tokens, and readiness assessments.
- **student-hub** has been ported onto the same Prisma models for its identity/todos/events/support-ticket data, but still has **no migrations of its own** — by design, not by accident (see §3).
- Three planned app surfaces — **Learning Management/Instructor Portal, Administration, Donor Hub** — do not exist as code yet. Help Desk backend logic currently lives inside student-hub, standing in for the not-yet-built Administration app.
- Test coverage is minimal (2 test files, both in learning-platform, both covering the assessment engine only).
- There are real open decisions that affect the backend and haven't been formally closed (§7) — worth surfacing today rather than assuming they're settled.

---

## 2. Architecture snapshot

- Two independent Next.js 16 apps (`student-hub`, `learning-platform`), no workspace tooling (no turborepo/pnpm workspaces) — each has its own `package.json`/`node_modules`.
- **One shared Postgres database** (`docker-compose.yml`, local dev: `postgres:16-alpine` on `5432`), accessed by both apps through Prisma.
- **Prisma multi-file schema** (GA since Prisma 6.7, both apps on `^6`): three physical schema files —
  - `learning-platform/prisma/schema/lp-core.prisma` — the 20 `Lp*` content/progress/assessment models. **learning-platform is the sole app that runs `prisma migrate`.**
  - `prisma-shared/platform-core-models.prisma` — 4 shared models: `ApprovedEmail`, `Student`, `SupportTicket`, `AuditEntry`.
  - `prisma-shared/student-hub-local-models.prisma` — 4 student-hub-owned models: `Todo`, `Event`, `ShMockProgram`, `ShUnitCompletion`.
  - The two `prisma-shared/*.prisma` files are **copied** (not symlinked — Windows `core.symlinks=false` in this checkout ruled that out) into both apps' `prisma/schema/` folders by `scripts/sync-shared-prisma.mjs`, run automatically before `prisma generate`/`prisma migrate`.
- **Migration history** (learning-platform, 4 migrations applied): `init` → `add_shared_and_local_models` → `relax_legacy_id_types` → `add_student_fk`. student-hub's `prisma/` folder has schema files but **no `migrations/` folder at all** — it only ever runs `prisma generate`, never `prisma migrate`, against the same database.
- **Why one migration runner:** two Prisma projects both running `migrate` against one database would corrupt shared `_prisma_migrations` bookkeeping. This was evaluated and decided deliberately (`docs/shared-schema-audit.md`), not an oversight.
- A one-time migration script (`learning-platform/scripts/migrate-shared-data.ts`) moved the old JSON files (`data/approved-emails.json`, `data/students.json`, `data/support-tickets.json`, `data/audit-log.json`, plus student-hub's own `todos.json`/`events.json`/`programs.json`/`progress.json`) into Postgres. It's idempotent (upserts by known id) and does **not** delete the source JSON files — those are still sitting in the repo pending a manual cleanup step.

---

## 3. What's built — by domain

### Identity / auth
- Google OAuth via NextAuth v5 (`next-auth@5.0.0-beta.31`) in both apps, gated by an `ApprovedEmail` allow-list.
- `Student` registry is now a real Postgres table (`students`), with **student-hub as the sole authoritative writer** — this fixes a pre-existing bug where both apps independently upserted the same row on login (flagged and fixed per `docs/shared-schema-audit.md` §5, "split-brain writes").
- learning-platform no longer writes `Student` rows directly — it calls student-hub's `POST /api/integration/students` (server-to-server, `x-integration-token` header) instead. This endpoint also has an admin-update counterpart at `/api/integration/students/[id]`.
- **MFA is a POC stub, not real MFA yet**: `student-hub/app/api/profile/mfa/route.ts` persists method/passkey records on the `Student` row and drives a derived `mfaEnabled` flag, but explicitly **does not send an OTP email or run a WebAuthn ceremony** (per the file's own comment). Treat MFA as "data model + UI plumbing exists," not "MFA is enforced."

### Learning Platform — content & progress
- Content hierarchy is `Program → Module → Unit → ContentBlock` (Section/Item levels removed, per the 2026-08-11 decision) — confirmed in `lp-core.prisma`.
- Token-based unit unlock, `LpTokenLedger` as an append-only, idempotent-award ledger.
- Enrollment, per-unit progress status (`in_progress/completed/retake/verified`), per-unit goals and notes, all Prisma-backed (`lib/store/*.ts`).

### Learning Platform — assessment engine (the biggest chunk of recent work)
- **Knowledge Checks**: in-unit, pass/fail scoring, retake on failure, escalation record created on a **second** consecutive failure (`lib/store/escalations.ts`).
- **Standalone Assessments** — a full rebuild, not an extension of the old fixed-question model:
  - Question bank with topic tagging and difficulty tiers (easy/medium/difficult).
  - Randomized question selection respecting a configurable difficulty mix, with a documented thin-bank fallback (`lib/assessment-engine.ts`).
  - Proportional partial credit for multi-select questions; all-or-nothing for single-choice.
  - Attempt lifecycle (`in_progress/submitted/expired`) with save-and-resume (answers upserted progressively), server-side time limits, and forward-only navigation support in the data model.
  - Weak-topic rollup stored per attempt, feeding the "weak-topic-focused failure guidance" requirement.
  - This engine's core logic is **pure and unit-tested independently of HTTP/DB** (`lib/assessment-engine.ts` header explicitly calls this out as a design goal) — see §5 on test coverage.
- **Readiness assessments**: simpler, fixed-question model, deliberately not using the randomization engine above.
- API surface: `app/api/assessments/[assessmentId]/attempts/**`, `app/api/knowledge-checks/[kcId]/attempts`, `app/api/readiness/[assessmentId]/results`.

### Help Desk / Service Desk (ticketing)
- Real engine lives in **student-hub** (`lib/support-tickets.ts`, `app/api/support/route.ts`): create, list, get, and student-triggered status transitions (`cancel`, `consent-close`).
- learning-platform only ever **creates** tickets against the same shared `SupportTicket` model — it has no read/list/status-transition logic (confirmed write-only in `learning-platform/lib/support-tickets.ts`).
- The `TicketStatus` enum already includes `pending` (matching the Aug 27 decision to add a "Pending" status), alongside `open/responded/resolved/cancelled`.
- **Not yet confirmed in code:** a staff-facing single "Close Ticket" action (replacing separate Resolve/Close), and the reopen-removal / search-by-name-or-ticket-number flow from the Sep 7 meeting. The student-facing route only exposes `cancel`/`consent-close` — no staff/admin route was found for the newer closure model. Worth asking whoever owns that piece whether it's built elsewhere or still pending.

### Cross-app integration
- A shared-secret header (`x-integration-token`) authorizes server-to-server calls in both directions (`lib/integration-auth.ts` in each app).
- learning-platform exposes `/api/integration/{students, readiness, streak, summary}` for student-hub's dashboard to pull progress/token/streak data.
- student-hub exposes `/api/integration/students[/[id]]` for learning-platform's login-time upsert.

### Todos / Events / mock program catalog (student-hub)
- All migrated off JSON onto Prisma (`Todo`, `Event`, `ShMockProgram`, `ShUnitCompletion`) — confirmed by reading `lib/curriculum.ts`, `lib/events.ts`, `lib/mock-api.ts` directly; each has a comment citing the JSON file it replaced.
- Note: student-hub's mock program catalog (`ShMockProgram`) is **still a separate, unreconciled catalog** from learning-platform's real one — explicitly out of scope for the migration that just happened.

---

## 4. Test coverage

- **2 test files total, both in learning-platform, both about the assessment engine**: `lib/__tests__/assessment-engine.test.ts`, `lib/__tests__/submit-idempotency.test.ts`. Run via `npm run test` (Vitest).
- **student-hub has zero test files.**
- No CI is wired up to run these (no `.github/workflows/`) — tests currently only run if someone runs them locally.

---

## 5. What's not built yet

- **Instructor Portal / Learning Management** — Sep 7 decision scoped it as a minimal internal-only UI (name/description/authors/order fields, Microsoft SSO, owned by Eddie), but **no corresponding app or routes exist in the repo yet**. Program/module/unit content today is presumably seeded directly, not authored through any UI.
- **Administration app** — doesn't exist. Help Desk, approved-email management, and student-status admin all currently live inside student-hub as an informal stand-in (explicitly called out in `docs/shared-schema-audit.md`).
- **Donor Hub** — not started.
- **Sentry / error monitoring** — decided 2026-09-07 per the planning docs, but there is **no Sentry dependency or config anywhere in either `package.json`** — not started.
- **Real MFA** (OTP delivery, WebAuthn passkey ceremony) — data model and API scaffolding exist; the actual security mechanism does not (see §3).
- **`.env.example` / env validation** — neither app has one; env vars are read ad hoc via `process.env`.
- **CI/CD** — no GitHub Actions workflows exist.
- Old JSON data files (`data/*.json`, per-app `data/*.json`) are still present in the repo post-migration, pending a manual cleanup step called out in the migration plan.

---

## 6. Open decisions / blockers that affect the backend

These aren't just documentation gaps — each one changes what the backend should actually do, so they're worth a real yes/no today rather than left implicit:

1. **Final assessment-engine datastore is still open.** The Aug 27 meeting decided the assessment module's data should be *architecturally separate* from student-hub's, linked only by student ID — but whether that "separate store" is still Postgres/Prisma (as built today) or a different engine entirely was explicitly left open, with Bichesq owning a follow-up recommendation. Today's code uses Postgres/Prisma for everything, so a decision to change this would be a real migration, not a config flag.
2. **"Database final selection: Postgres vs NoSQL" is still marked `Open`** at the bottom of `docs/decision-log.md`, even though every other doc and all the actual code treat Postgres as settled. This needs a formal close-out entry so it stops looking unresolved to anyone reading the log fresh.
3. **The Sep 10 reconciliation doc (`docs/plan/2026-09-10-v1-requirements-reconciliation.md`) is still in Draft status — its changes have not been applied to `decision-log.md` or `jira-v1-planning-doc.md` yet.** Several of the reversals it describes (soft vs. hard profile-completion gate, MFA method, passkey provisional delay, retake-cooldown schedule, Help Desk reopen-ticket removal) are **not yet reflected consistently in the backend code** — e.g. the code still needs to be checked against whichever of these landed. Flagging this explicitly rather than assuming the draft is authoritative.
4. **MFA method contradiction, unresolved as of the Sep 7 meeting notes**: one part of that meeting's summary says authenticator-app-only; a direct quote later in the same summary says "phone, authenticator, passkey" (matching the original July decision). The reconciliation doc explicitly declined to edit this until someone checks the Fathom transcript directly. The current backend code (`profile/mfa/route.ts`) supports multiple method types, consistent with the *original* decision — if the team intends authenticator-only, that's a backend change, not just a docs one.
5. **Help Desk V1 scope is still formally `Needs decision (scope vs. capacity)`** in the Jira planning doc, even though the backend ticketing engine is clearly being built and used. Worth an explicit yes so estimating/reporting on it isn't ambiguous.

---

## 7. Suggested talking points for the meeting

- Backend persistence migration (JSON → Postgres) for both apps: **done**, verified in code.
- Assessment engine: **substantially built** (core logic + attempt lifecycle), test-covered at the unit level, not yet covered by integration/API tests.
- Help Desk: the *student-facing* backend half is built; **staff-facing closure/search workflow from the Aug 27/Sep 7 meetings needs a status check** — is it built elsewhere, in progress, or not started?
- Three of five planned app surfaces (Learning Management, Administration, Donor Hub) have no backend code at all yet — worth deciding if/when those get scheduled.
- Two blockers in §6 (items 1 and 4) block real decisions, not just paperwork — recommend resolving those explicitly today rather than letting the draft reconciliation doc sit unmerged.
