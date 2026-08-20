# Move local Postgres for learning-platform (and future student-hub) into Docker

**Date:** 2026-08-19
**Status:** Done — Docker Desktop installed, container running, database migrated and verified. Full authenticated browser walkthrough (Google OAuth) still a manual step for the user.

## Context

`docs/plan/2026-08-17-local-postgres-setup.md` brought up a **native**
Windows Postgres install for `learning-platform` (manually started via
`pg_ctl`, schema migrated, legacy JSON data seeded). The user asked for this
to run in Docker instead.

Two things surfaced during discovery that shaped this plan:

- `docs/database-evaluation.md` §5 already recommended `postgres:16-alpine`
  in Docker for local dev "to mirror RDS." `learning-platform/.env`'s old
  comment claiming "native local install, not Docker — team preference"
  didn't trace to any real entry in `docs/decision-log.md` — it was an
  unbacked assumption written during the earlier migration pass, now
  corrected.
- The user wants this Postgres container to eventually serve **student-hub
  too**, matching the 2026-07-13 decision-log entry about "a unified
  database architecture." `student-hub/` has no Prisma/DB setup yet, so
  this plan doesn't build that, but the compose file's location (repo root)
  and one-Postgres-many-databases shape are chosen so adding a
  `student_hub` database later is a small addition, not a redesign.

**Blocker:** Docker Desktop is not installed on the dev machine (no `docker`
on PATH, no service, no WSL distro — WSL2 itself is enabled). Docker's
installer self-elevates via UAC and is an interactive GUI flow (EULA, WSL2
backend setup, likely a reboot) — the user has to run it themselves.
Everything after install runs from a normal, non-elevated shell.

## Steps

Done so far (don't require Docker running):

1. ✅ `docker-compose.yml` added at repo root — `postgres:16-alpine`,
   `POSTGRES_USER`/`POSTGRES_PASSWORD=postgres` (matches
   `learning-platform/.env`'s existing `DATABASE_URL`, no value changes
   needed), port `5432:5432`, named volume `pgdata` for persistence, a
   `pg_isready` healthcheck. `POSTGRES_DB` intentionally left at the
   default `postgres` superuser database — per-app databases
   (`learning_platform` now, `student_hub` later) are created explicitly as
   a setup step rather than baked into the image.
2. ✅ `learning-platform/.env`'s stale comment fixed to point at the
   compose file instead of claiming a native-install team preference.

Completed 2026-08-20, once Docker Desktop was installed and `docker ps` worked:

3. ✅ Decommissioned the native Postgres instance — turned out to be a
   no-op: port 5432 had no listener, no `postgres` process was running, and
   `postmaster.pid` (PID 5612) was stale. Left binaries/data directory on
   disk untouched, as planned.
4. ✅ `docker compose up -d postgres` (image pull was slow on this
   connection but completed); container came up healthy. `docker compose
   exec postgres createdb -U postgres learning_platform` succeeded.
5. ✅ From `learning-platform/`: `npx prisma migrate deploy` applied
   `20260819153121_init` cleanly. `npm run migrate:lp` re-seeded from the
   legacy JSON stores with the same clean result as the native pass:
   107/107 content blocks, 2 known `lp_student_items` rows dropped.
6. ✅ Verified: `docker compose ps` healthy; a one-off `tsx` script (deleted
   after use) confirmed `getPrograms()` (4 programs) and
   `getProgram("cloud-practitioner")` (2 modules) return real data through
   the container; dev server up on port 3001 with `/api/auth/session`
   returning 200/JSON and `/courses` returning 200 with no
   `PrismaClientInitializationError`. Full authenticated browser
   walkthrough (Google OAuth) remains a manual step for the user.

## Files affected

- `docker-compose.yml` — new, repo root. Done.
- `learning-platform/.env` — comment fix only. Done.
- `docs/plan/2026-08-17-local-postgres-setup.md` — marked superseded. Done.
- No application source files change.

## Out of scope

- Any student-hub Prisma/schema work — only the compose file's shape
  anticipates it.
- Registering Docker/WSL as a persistent boot-time service — Docker Desktop
  handles its own startup once installed.

## Revision log

- 2026-08-19: initial draft; steps 1–2 (compose file, `.env` comment)
  completed same day. Steps 3–6 blocked on Docker Desktop install.
- 2026-08-20: Docker Desktop installed; steps 3–6 completed. Container
  running, database migrated and verified end-to-end. Plan closed out —
  remaining manual step is the authenticated OAuth walkthrough.
