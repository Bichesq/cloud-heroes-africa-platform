# Learning Management

Internal authoring app for Cloud Heroes Africa staff: create programs, author units, topics,
Knowledge Checks and Module Assessments, and manage who can author each program.
Plan: `docs/plan/2026-09-21-learning-management-authoring-app.md`.

- **Port:** 3002 (student-hub 3000, learning-platform 3001).
- **Sign-in:** Microsoft Entra ID, CHA tenant only. Separate from the learners' Google sign-in:
  own `AUTH_SECRET`, own `lm.*` cookies, 8-hour sessions.
- **Database:** the shared `learning_platform` Postgres. This app **never runs migrations**;
  `learning-platform` is the only migration runner. Models come from `prisma-shared/`, copied in
  by `npm run prisma:generate`.
- **Security:** nonce-based Content-Security-Policy on every response (`proxy.ts`), default-deny
  routing, and server-side author checks on every page (`lib/session.ts`).

## Setup

1. **Entra app registration** (CHA tenant, single-tenant):
   - Redirect URI (Web): `http://localhost:3002/api/auth/callback/microsoft-entra-id`
   - Note the Application (client) ID and Directory (tenant) ID; create a client secret.
2. `cp .env.example .env` and fill in:
   - `DATABASE_URL`: same as learning-platform.
   - `AUTH_SECRET`: **new** value (`npx auth secret`), never the learner apps' secret.
   - `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`.
3. `npm install` then `npm run prisma:generate`.
4. `npm run dev` → http://localhost:3002

Without a tenant ID, sign-in fails closed (`/signin?error=Configuration`). It never falls back
to Microsoft's multi-tenant endpoint.

## Development login (no Microsoft credentials)

Entra credentials exist only in production. For development, add to `.env`:

```
LM_DEV_LOGIN=1
LM_DEV_EMAILS="bichesq@gmail.com"
```

The sign-in page then shows a **Development only** email form for the listed addresses. Guards
(`lib/dev-login.ts`, unit-tested):
- It only works when `NODE_ENV` isn't production **and** `LM_DEV_LOGIN=1`. Otherwise the provider
  isn't registered at all.
- The allowlist is checked twice: in the provider and in the sign-in callback.
- The app **refuses to start** in production if `LM_DEV_LOGIN` is set.

Dev sign-in skips the Microsoft tenant check, so test the real Entra flow (e.g. against a mock
OIDC server) before production.

## First Owners / Directors

The four seeded programs have no Owner or Director yet. Bootstrap them once; after that, Settings &
Access manages the lists:

```
npm run bootstrap:roles -- --program cloud-practitioner --owner someone@cloudheroes.africa --director someone-else@cloudheroes.africa
```

Program ids: `cloud-practitioner`, `it-fundamentals`, `hands-on-labs`, `linux-foundations`.
Authors are created by email. Each person's Microsoft account is bound on their first sign-in.
