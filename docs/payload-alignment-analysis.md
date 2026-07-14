# Codebase vs. `payload.md` — Alignment Analysis

> Cloud Heroes Africa Platform — gap analysis
> Author: AI-assisted analysis (Claude), reviewed by Bichesq Bijengsi
> Date: 2026-07-12
> Status: Analysis
> Compares: the current codebase (Student Hub POC) against the stipulations in
> [`payload.md`](./payload.md) (Payload CMS — Architecture & Usage Guide)

---

## 1. Executive Summary

`payload.md` describes a **target architecture**: Payload CMS as the shared backend
(content + operational data) over PostgreSQL via Drizzle, serving five application
surfaces. The current codebase implements **one surface (Student Hub)** as a
Next.js POC with **no Payload installation at all** — persistence is local JSON
files under `student-hub/data/`, wrapped by thin CRUD modules in `student-hub/lib/`.

That is not necessarily a violation — the POC was deliberately built with the data
layer isolated behind swap-point modules — but it means **almost every stipulation
in `payload.md` is currently unimplemented**, and a few places where the codebase
*has* made choices quietly diverge from or pre-empt the stipulations. There is also
a **direct documentation conflict**: `payload.md` stipulates Payload + Drizzle,
while `database-evaluation.md` and `student-hub-poc-notes.md` record a
Prisma + PostgreSQL (AWS RDS) decision.

Verdict at a glance:

| Area (`payload.md` §) | Status |
|---|---|
| §1 Payload as shared backend | ❌ Not implemented — no `payload` dependency, no Postgres, no Drizzle |
| §2.1 Content collections | 🟡 Partial — Program/Module/Unit + Events exist as JSON/types; LearningMaterials, Assessments, Questions, KBArticles missing |
| §2.2 Operational collections | 🟡 Partial — ApprovedStudents and a progress store exist; Assessment attempts and both ticket collections missing |
| §2.2 Unit progress status model | ❌ Divergent — binary completion record, no `not_started → … → competent / retake` lifecycle |
| §3 What Payload does NOT own | ✅ Compliant in spirit — auth handshake, business logic, and (absent) email all live outside the data layer |
| §4 Authentication integration | 🟡 Partial — Google OAuth + approved-list gate + form redirect implemented; Payload Users, Payload JWTs, Microsoft SSO missing |
| §5 Access control | ❌ Not implemented — no roles, single implicit `student` actor |
| §6 Custom endpoints | 🟡 Partial — 3 of 6 stipulated endpoints have functional equivalents; codebase also has endpoints `payload.md` doesn't account for |
| §7 Shared-backend topology | ❌ Only 1 of 5 surfaces exists |
| §8 Reconsideration triggers | ⚪ Not applicable yet |
| §9 Open questions | ⚠️ One is being implicitly pre-answered by the code (assessments as a `UnitType`) |

---

## 2. Ground Truth: What the Codebase Actually Is

- **Stack** (`student-hub/package.json`): Next.js 16 App Router, React 19,
  NextAuth v5 (beta), HeroUI v3, Tailwind v4, Zod. **No** `payload`, `drizzle-orm`,
  `pg`, or any database driver.
- **Persistence**: seven JSON files in `student-hub/data/` — `approved-emails.json`,
  `students.json`, `programs.json`, `progress.json`, `todos.json`, `events.json`,
  `audit-log.json` — each fronted by a small module in `student-hub/lib/`
  (`approved-emails.ts`, `mock-api.ts`, `curriculum.ts`, `todos.ts`, `events.ts`,
  `audit.ts`) that owns all file I/O. These modules are explicitly documented in
  code comments as the future integration seam.
- **API surface**: Next.js route handlers under `student-hub/app/api/` —
  `auth/[...nextauth]`, `profile` (+ `avatar`, `mfa`), `progress`, `todos`,
  `events/join`.
- **Types**: `student-hub/types/index.ts` defines `ApprovedEmail`, `Student`
  (with embedded `MfaMethod[]` / `Passkey[]`), `Program → Module → Unit`,
  `UnitCompletion`, `Todo`, `LearningEvent`, plus UI-mock types (`KBArticle`,
  `Alert`, `CalendarEvent`).

---

## 3. Section-by-Section Analysis

### §1 — Role of Payload as the shared backend

**Stipulation:** a single Payload instance backed by shared PostgreSQL (Drizzle)
is the source of truth for both content and operational data, serving five surfaces.

**Reality:** no Payload instance exists anywhere in the repo. The Student Hub reads
and writes JSON files directly through `lib/` modules. There is one surface, not
five; there is no shared database; there is no Admin UI (the stipulated primary
interface for the Administration surface in Phase 1).

**Assessment:** the largest gap, but a *planned* one — the swap-point design in
`lib/` means the migration path is real. What is **not** planned anywhere in the
codebase or `decision-log.md` is the reconciliation described in §6 of this
document (Prisma vs. Drizzle).

### §2.1 — Content collections

| Stipulated collection | In codebase? | Notes |
|---|---|---|
| `Programs` / `Modules` / `Units` | 🟡 Yes, as one nested document | `programs.json` + `Program → Module → Unit` types match the stipulated hierarchy. In Payload these become three flat collections with relationships, not one nested blob. |
| `LearningMaterials` | ❌ No | `Unit` carries only `title`, `type`, `order`, `durationMin` — no content payload at all. The POC simulates consumption, not content delivery. |
| `Assessments` / `Questions` | ❌ No | See §3-progress below — the codebase instead models assessment as a **unit type** (`UnitType = "lesson" \| "lab" \| "assessment"`), which conflicts with the stipulated design where an Assessment is a separate entity attached at unit/module/program level with its own question bank. |
| `KBArticles` | ❌ No (type only) | A `KBArticle` type exists in `types/index.ts` but it is a UI mock (numeric `id`, `excerpt`, external `url`) with no backing store, and nothing implements the stipulated "promoted from resolved Help Desk tickets" lifecycle. |
| `Events` | 🟡 Yes | `events.json` + `LearningEvent` type, surfaced on the dashboard/calendar. But `payload.md` stipulates events are *created in Learning Management*; the codebase has a `CreateEventModal` in the student calendar and much of `/calendar` runs on `calendar/data/mock.ts`. Who may create events needs to be settled before the Payload `Events` collection is designed. |

### §2.2 — Operational collections

| Stipulated collection | In codebase? | Notes |
|---|---|---|
| `ApprovedStudents` | ✅ Yes (as `ApprovedEmail`) | `approved-emails.json` + `lib/approved-emails.ts`. The codebase model is **richer** than stipulated: status lifecycle (`approved`/`revoked`/`pending`), `source` (`form`/`manual`/`import`), notes, and created/updated audit fields. `payload.md` describes only "a list of Gmail addresses" — the doc should be updated to adopt the richer model. Note: `revokeEmail()` exists but nothing calls it; the stipulated "managed by administrators via the Payload Admin UI" has no equivalent (admins today would edit JSON by hand). |
| `StudentProgress` | ❌ Divergent | See next subsection. |
| `AssessmentAttempts` | ❌ No | No attempts, answers, scoring, or failure tracking anywhere. |
| `HelpDeskTickets` | ❌ No | The support page (`app/(student)/support/page.tsx`) is a static card with a `mailto:support@cloudheroesafrica.com` link, explicitly marked "Phase 1 uses email-based support." No ticket model, no system-derived context capture. |
| `ServiceDeskTickets` | ❌ No | Same page tells students to "contact your programme coordinator directly" for MFA/login issues. |

**Unit progress status model — the most significant *divergence* (not just gap):**

`payload.md` stipulates a per-unit status machine:
`not_started → in_progress → completed → competent`, with `retake` on first
assessment failure and team notification on the second.

The codebase instead stores `UnitCompletion { studentId, unitId, completedAt }` —
a **binary** join record written idempotently by `POST /api/progress`
(`app/api/progress/route.ts`). There is no `in_progress`, no
`competent`/`verified` distinction, no `retake`, and no failure-notification
hook. Every dashboard widget (progress %, streak, resume card) is built on this
binary model, so adopting the stipulated status machine is a **breaking change to
the progress store and its consumers**, not an additive one. This should be
decided *before* the Payload `StudentProgress` collection is created, because the
JSON→Payload migration is the natural moment to change the schema.

**Not in `payload.md` at all but present in the codebase (reverse gaps):**

- `Todos` (`todos.json`, `Todo` type with `student`/`system` sources, dismissal
  semantics, `POST/PATCH /api/todos`) — a real operational collection with no home
  in the stipulated collection list.
- `AuditLog` (`audit-log.json`, `lib/audit.ts`, written by profile, progress, and
  event-join endpoints) — likewise unaccounted for. Payload has field-level
  versioning but not this actor/action/changes audit shape; it needs an explicit
  `ops` collection.
- `Student` profile itself — `payload.md` mentions a "Users collection" for auth
  but never specifies where the rich student profile (locale, timezone, privacy
  flags, embedded `mfaMethods`/`passkeys`) lives. The codebase's `Student` record
  is substantially more developed than anything the doc stipulates.

### §3 — What Payload does NOT own

This is the section the codebase **complies with best**, essentially by
construction:

- **Auth handshake external** ✅ — Google OAuth runs through NextAuth v5 in the
  Next.js layer (`lib/auth.config.ts`), exactly the "middleware in the Next.js
  layer" option the doc allows.
- **Business logic in endpoints, not collection hooks** ✅ — validation (Zod),
  the approved-email gate, unit-exists checks, and audit writes all live in route
  handlers and `lib/` functions, which will translate directly to Payload custom
  endpoints.
- **Real-time features** ⚪ — none exist; nothing to assess.
- **Email delivery** ❌ — no email service is integrated (no Resend/SendGrid).
  Approval confirmations and failure alerts stipulated elsewhere in the doc have
  no delivery mechanism yet.

### §4 — Authentication integration

| Stipulation | Status |
|---|---|
| Students authenticate via Google OAuth | ✅ `Google` provider in `lib/auth.config.ts` |
| Post-auth check against `ApprovedStudents` | ✅ `signIn` callback calls `findApprovedEmail()`; only `status === "approved"` passes — the exact stipulated gate, just against JSON instead of a Payload collection |
| Not on list → redirect to registration form (external Google Form, Phase 1) | ✅ Redirects to `/not-approved`, which links out via `NEXT_PUBLIC_REGISTRATION_FORM_URL`. (Env var must be set in each environment or the button links to `#`.) |
| Approved list managed via Payload Admin UI | ❌ No admin surface; JSON edited by hand |
| Learning Management Microsoft SSO | ❌ Surface doesn't exist |
| Shared auth layer: all surfaces piggyback on the Payload `Users` collection; **Payload issues and validates JWTs** | ❌ Divergent — NextAuth issues and validates its own JWTs (`session: { strategy: "jwt" }`), and the "user record" is the local `Student` upserted on login. When Payload arrives, either NextAuth becomes a front-end to Payload's auth (custom strategy) or Payload validates NextAuth tokens — this is an unmade decision the doc glosses over. |

One extra behavior worth recording in `payload.md`: the codebase **auto-creates
the Student record on first login** (`upsertStudent`) and routes first-time users
to `/profile` before the dashboard. The doc's auth flow doesn't mention student
record provisioning at all.

### §5 — Access control

**Stipulation:** six roles (`super-admin`, `admin`, `course-creator`,
`collaborator`, `student`, `donor`) enforced by Payload collection- and
field-level access control.

**Reality:** no role model exists. There is exactly one kind of authenticated
actor; the audit log hard-codes `actorRole: "student"`. Authorization today is
only (a) the approved-email gate at sign-in and (b) route protection for
`/dashboard`, `/profile`, `/my-program` in the `authorized` callback — note the
other student pages (`/calendar`, `/explore`, `/notes`, `/settings`, `/support`,
`/analytics`) are **not** in that protected list, which is a gap against any
reading of the access model. Nothing enforces "write access to their own records"
beyond each endpoint resolving the student from the session, which is actually
sound and maps well to Payload's `where: { student: { equals: user.id } }` access
pattern later.

### §6 — Custom endpoints

| Stipulated endpoint | Codebase equivalent | Status |
|---|---|---|
| `POST /api/auth/google` (OAuth + approved check) | `app/api/auth/[...nextauth]/route.ts` + `signIn` callback | ✅ Functional equivalent, different route shape |
| `POST /api/auth/microsoft` | — | ❌ Missing (no LM surface) |
| `POST /api/assessments/:id/submit` | — | ❌ Missing (no assessments) |
| `GET /api/students/:id/progress` | `POST /api/progress` (self-scoped, write-only); reads happen server-side in dashboard components | 🟡 Partial — no admin-readable, parameterized progress endpoint; current design is session-scoped by construction |
| `POST /api/helpdesk/tickets` | — | ❌ Missing (mailto stub) |
| `POST /api/kb/publish` | — | ❌ Missing |

Endpoints the codebase has that `payload.md` doesn't stipulate:
`GET/PATCH /api/profile`, `POST /api/profile/avatar`, `POST/DELETE /api/profile/mfa`,
`GET/POST/PATCH /api/todos`, `POST /api/events/join` (attendance audit). These are
real product surface and should be added to the doc's endpoint table so the
Payload custom-endpoint design accounts for them.

### §7–§8 — Topology and reconsideration triggers

Only the Student Hub box of the stipulated diagram exists. None of the §8
reconsideration triggers (aggregation load, ops-data volume, assessment engine,
LMS integration) can fire yet — though trigger 4 is foreshadowed by the code
comment in `lib/curriculum.ts`/`types/index.ts` that curriculum is isolated so "a
future real-LMS integration only needs to replace that module's I/O."

### §9 — Open questions

Three of the four remain genuinely open. One is being **implicitly answered by the
codebase in a way that conflicts with the doc**: "Should assessments be their own
standalone plugin/module or remain inline collections?" — the code currently
models assessment as `UnitType: "assessment"`, i.e., neither option; it makes an
assessment *a kind of unit* with no questions, attempts, or scoring. This should
be flagged as a decision to make deliberately, not inherit from the POC shortcut.

---

## 4. Documentation Conflict: Drizzle vs. Prisma

`payload.md` (§1, §7) stipulates **Payload over PostgreSQL via Drizzle ORM** —
Drizzle is not optional there; it is what Payload's Postgres adapter uses.
Meanwhile `docs/student-hub-poc-notes.md` (June 2025) and
`docs/database-evaluation.md` (2026-07-10) record/endorse **Prisma + PostgreSQL on
AWS RDS**.

If Payload is adopted as stipulated, the Prisma decision is effectively
superseded: the schema is defined by Payload collection configs, and Drizzle comes
along automatically. Running Prisma *alongside* Payload against the same database
is possible but creates two competing schema owners and migration systems — the
kind of over-engineering §1 says the single-Payload choice was meant to avoid.
**Recommendation:** record an explicit entry in `decision-log.md` retiring the
Prisma choice (or scoping it to a post-split future per §8), so the three
documents stop pointing in two directions.

Hosting is similarly split: `payload.md` says "Render / AWS — TBD" while
`database-evaluation.md`/POC notes name AWS RDS `db.t4g.micro`. Same
reconciliation needed.

---

## 5. Migration Readiness (the good news)

The POC was built the way you'd want it built if Payload is coming:

1. **All persistence flows through six `lib/` modules** with narrow interfaces
   (`findApprovedEmail`, `upsertStudent`, `getProgram`, `markUnitComplete`, …).
   Re-implementing these against Payload's Local API or REST leaves every page,
   widget, and route handler untouched.
2. **The type model largely *is* the collection model.** `ApprovedEmail`,
   `Student`, `Todo`, `LearningEvent`, `UnitCompletion` translate almost 1:1 to
   Payload collections; `Program/Module/Unit` needs de-nesting into related
   collections but the shapes are ready.
3. **The auth gate already matches the stipulated flow** (Google → approved-list
   check → in / redirect-to-form), so migrating it is a data-source swap plus the
   NextAuth↔Payload JWT decision.
4. **Business logic already lives in endpoints**, satisfying §3 from day one.

What must be *decided* (not just built) before migration:

- Progress: adopt the §2.2 status machine (breaking change to `UnitCompletion`
  and every dashboard consumer) or amend `payload.md` to the binary model for
  Phase 1.
- Assessments: separate collections per the doc vs. the POC's `UnitType`
  shortcut.
- JWT authority: Payload-issued (per §4) vs. NextAuth-issued (as built).
- ORM/hosting conflict (§4 of this document).
- Ownership of the unstipulated collections: `Todos`, `AuditLog`, rich `Student`
  profile, MFA/passkeys.

---

## 6. Recommended Actions

1. **Reconcile the ORM/hosting conflict** in `decision-log.md` (Payload+Drizzle
   supersedes Prisma, or explicitly not).
2. **Amend `payload.md`** to absorb what the codebase already established:
   the richer `ApprovedEmail` model, student auto-provisioning on first login,
   `Todos`, `AuditLog`, profile/MFA endpoints, and the registration-form redirect
   detail (which is already implemented).
3. **Decide the progress status model now** — it's the one place where the POC's
   data shape and the doc's stipulation are structurally incompatible, and the
   migration is the cheapest moment to change it.
4. **Add the missing route protection** for `/calendar`, `/explore`, `/notes`,
   `/settings`, `/support`, `/analytics` in `authorized()` — independent of
   Payload, this is a present-day gap.
5. When Payload work starts, sequence it as: `ApprovedStudents` + `Users`/auth →
   content collections (de-nest programs) → progress (with the decided status
   model) → todos/events/audit → assessments → tickets/KB.

---

## 7. Related Documents

- [`payload.md`](./payload.md) — the stipulations analyzed here
- [`database-evaluation.md`](./database-evaluation.md) — DB-class evaluation (conflicts on ORM; see §4)
- [`student-hub-poc-notes.md`](./student-hub-poc-notes.md) — original Prisma/RDS decision
- [`architecture.md`](./architecture.md) — overall system architecture
- [`decision-log.md`](./decision-log.md) — where the §4 reconciliation should land
