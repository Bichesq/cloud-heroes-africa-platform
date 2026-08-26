# Shared Prisma Model Audit

**Date:** 2026-08-24
**Scope:** Audit-and-plan only, per `prompts/audit_prisma.md`. No `schema.prisma` files were
modified, no symlinks were created, no other code was changed.

## ⚠ Conflicts with the draft plan (`docs/plan/2026-08-23-centralize-shared-data.md`)

1. **Nothing is duplicated in code today.** The repo has exactly one `schema.prisma`
   (`learning-platform/prisma/schema.prisma`, 20 models, all `Lp*`-prefixed, zero `@relation`
   to anything resembling `Student`). `student-hub` has no Prisma dependency, no
   `schema.prisma`, and reads/writes plain JSON. The "4 shared models" this audit classifies
   are the draft plan's **step 5 proposal**, not existing duplication. Confirmed with the
   coordinator before proceeding — this audit evaluates that proposal pre-implementation.
2. **`audit-log.json` is not actually shared today.** `learning-platform` has zero references
   to `AuditEntry`/`logAudit`/`audit-log.json` anywhere in its source (only a doc comment in
   `lib/shared-data.ts` and `README.md` mention it as living in the shared dir). Only
   `student-hub/lib/audit.ts` reads/writes it. The draft plan's Scope section calls this one
   of "4 repo-root shared stores... read/written by both apps today" — that's inaccurate for
   this file specifically. See model 4 below.
3. **The domain-ownership table `audit_prisma.md` asked me to check against doesn't literally
   exist in `docs/decision-log.md`.** There is no table shaped like "Learning Management
   owns / Administration owns / Learning Module owns / Hub-Identity owns." What the log
   actually contains (2026-06-04 "App partitioning", 2026-06-08 "Administration module
   scope" and "Learning Management core scope") is: **five planned application surfaces**
   — Student Hub, Learning Platform, Learning Management, Administration, Donor Hub — of
   which only Student Hub and Learning Platform are built. Per those decisions:
   - **Administration** (not built) owns: Help Desk, Service Desk, KB management, **student
     management** (2026-06-08), and the **approved-email list** (2026-06-11).
   - **Learning Management** (not built, currently folded into `learning-platform`'s own
     codebase) owns: program/module/unit design, assessment design, learning-material admin,
     events (2026-06-08).
   - Student Hub and Learning Platform's own ownership of *identity* and *progress* data
     respectively is inferred from the codebase, not a literal decision-log line — flagging
     that inference explicitly, per the audit's own constraints.

   The practical effect: **the rightful domain owner of 3 of the 4 candidate shared tables
   (ApprovedEmail, SupportTicket, AuditEntry) is "Administration," an app that doesn't exist
   yet.** Both `learning-platform` and `student-hub` are today informally standing in for it.
   This reframes the classification below — it isn't really "LP vs. student-hub," it's
   "the real owner hasn't been built yet, so who should hold the pen in the meantime."
4. **Single biggest issue for the draft plan: `Student` has two independent, uncoordinated
   writers today**, and the plan would carry that forward unchanged into Prisma. See Model 2
   and the Risks section — this is worth fixing as part of, not after, the migration.

---

## 1. Corrected model inventory and classification

| # | Model | Exists in code today? | Bucket | Reasoning |
|---|-------|------------------------|--------|-----------|
| 1 | `ApprovedEmail` | No (JSON only) | **B** | Single-field lookup by email, no joins, no aggregation, in both apps. |
| 2 | `Student` | No (JSON only) | **A**, with a flagged correctness defect | Genuine future relational need (9 `Lp*` tables get real FKs to it per the draft plan's step 2) *and* both apps currently have full independent write authority over it — not just a read pattern. |
| 3 | `SupportTicket` | No (JSON only) | **B** | `learning-platform` only ever calls `createTicket` — write-only, one shape, no read/list/status-transition. `student-hub` runs the actual ticketing engine (full CRUD + status log). |
| 4 | `AuditEntry` | No (JSON only), and **not currently used by learning-platform at all** | **C** | Zero evidence today that `learning-platform` needs this model. Recommend NOT adding it to `learning-platform/prisma/schema.prisma` in step 1 of the draft plan unless there's a concrete near-term plan for LP to write audit entries — flagging as ambiguous rather than dropping outright, since "audit trail for profile/MFA changes" could plausibly extend to LP-initiated actions later. |

There is no field-level divergence to report for any model, because none of them exist in a
second schema yet — noting this explicitly rather than fabricating a diff, per the audit's own
instruction.

### Detail per model

**1. `ApprovedEmail`**
- `learning-platform/lib/approved-emails.ts`: `findApprovedEmail(email)` only — read-only by
  its own header comment ("LP never mutates it — approvals/revocations are Administration's
  job"). Called from the auth flow.
- `student-hub/lib/approved-emails.ts`: `findApprovedEmail` (used in `auth.config.ts`'s
  sign-in callback) **and** `revokeEmail` (write) — but `revokeEmail` has no callers anywhere
  in the repo (confirmed by the draft plan's own out-of-scope note; not re-verified line by
  line here, taking that as established). So in practice, both apps only read this today.
- Low-frequency, simple, no aggregation → bucket B is a clean fit for both apps as they stand.

**2. `Student`**
- `learning-platform/lib/students.ts`: `upsertStudent` (creates a new row on first login,
  updates `lastLogin` otherwise) and `getStudent`. This is a **full, independent copy** of
  `student-hub/lib/mock-api.ts`'s `upsertStudent`/`getStudent` — same shape, same defaulting
  logic, same `DEFAULT_PROGRAM_ID`, maintained twice.
- `student-hub/lib/mock-api.ts`: the above, plus `updateStudentProfile` (profile editing) and
  `banStudent` (dead code, no callers, per the draft plan's own note).
- No relational Prisma usage exists anywhere yet (nothing to check — the model doesn't exist).
  Once the draft plan's step 2 FK-tightening lands, `learning-platform`'s 9 `Lp*` tables
  (`LpEnrollment`, `LpStudentUnit`, etc.) will hold real `@relation` fields to `Student`,
  which is a genuine bucket-A relational need for LP going forward — every progress/assessment
  query is per-student and would benefit from (or eventually require) the FK.
- **The actual problem isn't Prisma access, it's write ownership**: `learning-platform`
  creates brand-new `Student` rows on login today, in a domain (identity) that isn't its own
  by any decision-log framing. This is a **pre-existing correctness risk that predates this
  migration** and would simply be carried into Postgres unchanged if step 4/5 of the draft
  plan proceed as written (both `lib/students.ts` files keep independent `upsertStudent`
  logic, now both writing to the same table instead of the same file).

**3. `SupportTicket`**
- `learning-platform/lib/support-tickets.ts`: `createTicket` only — always `desk: "help"`,
  no read, no status transition. Comment confirms: "LP does not run its own ticketing engine."
- `student-hub/lib/support-tickets.ts`: `getTickets`, `getTicket`, `createTicket`,
  `setTicketStatus`, `resolveTicketContext` — the real engine, feeding
  `app/api/support/route.ts` and the Help Desk/Service Desk pages.
- LP's usage is narrow and stable enough to be a clean bucket-B API candidate: a
  `POST /api/support/tickets` call to whichever app hosts the real engine, rather than a
  duplicated Prisma model.

**4. `AuditEntry`**
- `student-hub/lib/audit.ts`: `logAudit`, called from profile/MFA/passkey mutation paths.
  Append-only, best-effort (never throws).
- `learning-platform`: no references found (`grep` across `.ts` for `audit-log`, `logAudit`,
  `AuditEntry` returns only a doc comment in `lib/shared-data.ts` and a `README.md` mention).
  There is currently nothing for a `learning-platform` Prisma model to serve.

---

## 2. Bucket A — shared `.prisma` file mechanism + Prisma version check

**Only `Student` lands in bucket A.**

- **Installed Prisma version (checked, not assumed):** `learning-platform/node_modules/prisma/package.json`
  reports **6.19.3** (`package.json` pins `^6` for both `prisma` and `@prisma/client`).
- **Multi-file schema (`prismaSchemaFolder`) status at 6.19.3:** confirmed via web search
  against Prisma's own changelog — the feature shipped as a preview flag in **v5.15.0**
  (2024-06-04) and reached **General Availability in v6.7.0**. 6.19.3 is well past that, so
  **no `previewFeatures = ["prismaSchemaFolder"]` flag is needed** — a `prisma/schema/`
  folder of multiple `.prisma` files works out of the box.
  Sources:
  - [Prisma ORM v5.15.0: multi-file schemas and Pulse delivery guarantees](https://www.prisma.io/changelog/2024-06-06)
  - [Organize Your Prisma Schema into Multiple Files](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support)
  - [Releases: prisma/prisma](https://github.com/prisma/prisma/releases)

- **Proposed mechanism:** a physical file at repo root, e.g.
  `prisma-shared/identity-models.prisma`, containing only the `model Student { ... }` block
  (no `datasource`/`generator` — multi-file schema allows those to live in exactly one file
  per project while models are spread across many). Each app's own `prisma/schema/` folder
  (`learning-platform/prisma/schema/` and, once created, `student-hub/prisma/schema/`) gets a
  **symlink** into this file, so `prisma generate`/`prisma migrate` in either project reads
  the identical model text — eliminating the duplication tradeoff the draft plan currently
  accepts.
- **Practical caveat worth flagging, since this repo is developed on Windows (per the current
  environment):** creating a symlink on Windows normally requires either Developer Mode
  enabled or an elevated shell, and Git's own symlink support on Windows is opt-in
  (`core.symlinks`) and produces a plain text file containing the link target on checkouts
  where it's off — silently breaking the "shared file" property for any teammate who hasn't
  configured it. This is a real adoption risk, not just a style note; verify the team's Git
  config before relying on this mechanism, or use an NTFS junction / a small pre-`generate`
  copy script as a fallback.
- **This does not change who runs `prisma migrate`** (see Section 4) — it only removes the
  hand-duplication of the model's field list.

---

## 3. Bucket B — DTO shape + owning-domain API endpoint

**`ApprovedEmail`** (both apps, read-only in practice)
- DTO: `ApprovedEmailStatusDTO { email: string; status: "approved" | "revoked" | "pending" }`
  — mirrors the one field-check both apps actually perform.
- Endpoint: not urgent to build — low frequency (one check per sign-in), and until
  "Administration" exists as a real app there's no clear owning-domain host to call. If it
  becomes worth an API rather than a shared table, propose `GET /api/admin/approved-emails/:email`
  hosted by whichever app becomes the Administration stand-in (today, that would be
  `student-hub`, since it already owns the sign-in flow that checks this).

**`SupportTicket`** (learning-platform's usage only — student-hub keeps full Prisma access
as the real ticketing engine)
- DTO: `CreateTicketDTO { studentId: string; categoryId: string; topic: string; description: string; preferredChannel: string | null; context: TicketContext }`
  — identical to the shape `learning-platform/lib/support-tickets.ts#createTicket` already
  takes; no new fields needed.
- Endpoint: propose `POST /api/support/tickets` on `student-hub` (it already has
  `app/api/support/route.ts` for its own session-based flow; this would need a
  server-to-server variant, the same `x-integration-token` pattern
  `learning-platform/lib/integration-auth.ts` already uses for the reverse direction). Noting
  this route doesn't exist yet — proposed, not verified against an existing handler.

---

## 4. Migration-ownership table

| Model | Domain that should own it (per decision-log, or inferred where noted) | Who should run `prisma migrate` |
|---|---|---|
| `ApprovedEmail` | Administration (2026-06-11 decision) — not built; **inferred** interim owner: `student-hub`, since it already owns the sign-in flow that checks it | `learning-platform` (see note below) |
| `Student` | Split: identity/profile fields → Student Hub (**inferred** from product decisions like profile-completion gating, MFA section scope — not a literal decision-log ownership line); admin-status fields (`status: banned`) → Administration (2026-06-08, "student management") — not built | `learning-platform` (see note below) |
| `SupportTicket` | Administration → Help Desk/Service Desk (2026-06-08), currently the real engine lives in `student-hub` | `learning-platform` (see note below) |
| `AuditEntry` | Administration, by analogy with the above (audit/logging is an admin concern) — **inferred**, not stated in decision-log | N/A — recommend not adding to `learning-platform`'s schema yet (see Model 4) |

**Note on the "who runs `prisma migrate`" column:** the draft plan's own Risks section
already correctly identifies that **two independent Prisma projects both running `migrate`
against one database is unsafe** (colliding `_prisma_migrations` bookkeeping). Given that
constraint, and that `learning-platform` already holds this database's entire migration
history for its 20 `Lp*` tables, **keeping `learning-platform` as the sole technical migration
runner is still the pragmatic choice** — switching the runner to `student-hub` would just
relocate the same single-owner requirement without removing it, at the cost of migrating
existing history. **What should change is not the runner, but making explicit — in
decision-log — that "migration runner" (technical/operational) and "domain/business owner"
(who should own the actual write APIs and business rules) are two different things** for
these three tables. `learning-platform` running `prisma migrate` for `ApprovedEmail`/
`SupportTicket` doesn't mean `learning-platform` should be growing write logic for them —
today it already isn't (see Section 1), which is good; the FK-tightening + Postgres move
should preserve that narrowness rather than let it drift now that direct table access is
available.

---

## 5. Risks if left as-is

- **Split-brain `Student` writes (the biggest one).** Both apps independently create and
  update `Student` rows today via hand-duplicated logic. Moving to Postgres doesn't fix this
  by itself — it just means two Prisma clients racing to upsert the same row instead of two
  file-writers racing on the same JSON file. Worth deciding, as part of this migration (not
  after), which app's `upsertStudent` is authoritative and making the other call it as an API
  rather than porting both copies to Prisma as-is.
- **Migration-history collision** if student-hub (or any future app) is ever pointed at
  `prisma migrate` against `learning_platform` by mistake — already flagged in the draft plan,
  reaffirmed here.
- **Silent domain drift**: none of `ApprovedEmail`/`SupportTicket`/`AuditEntry` have a real
  owning app yet ("Administration" isn't built). Giving `learning-platform` full Prisma
  models for all of them (as the draft plan's step 1 currently does) makes it *easier*, not
  harder, for write logic to accidentally grow on the non-owning side, since a Prisma model
  offers no access-level distinction between "I read this" and "I write this" the way a
  narrow hand-written `lib/` function currently does.
- **Speculative surface area**: adding `AuditEntry` to `learning-platform`'s schema today
  would create a model with zero current callers — dead weight that also becomes one more
  thing to keep in sync if/when it's symlinked or hand-duplicated later.

---

## 6. Proposed decision-log addition

Append to `docs/decision-log.md` under a new dated entry:

> **2026-08-24 | Shared-data access pattern | Direct Prisma model access across apps is
> reserved for genuine relational needs (bucket A); read-mostly or write-once shared data is
> served via a narrow API from the owning domain (bucket B), not a duplicated Prisma model.
> "Migration runner" (which app's `package.json` invokes `prisma migrate`) is a separate
> question from "domain owner" (which app's business logic is authoritative for a table) —
> the former follows technical/operational constraints (one owner per shared database to
> avoid `_prisma_migrations` collisions), the latter follows the App Partitioning /
> Administration / Learning Management ownership decisions of 2026-06-04 and 2026-06-08. Until
> Administration and Learning Management exist as real apps, `student-hub` and
> `learning-platform` respectively stand in for them, and should keep their current
> read/write narrowness rather than expanding it just because direct table access becomes
> available. | Decided | Team (proposed by audit) | Formalizes the rule this log has
> previously flagged as "remains an architectural decision that should be formally added."**

---

## Revision log

- 2026-08-24: initial audit (Steps 1–4 of `prompts/audit_prisma.md`).
