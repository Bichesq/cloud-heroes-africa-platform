# Database Evaluation: Document DB (MongoDB) vs Relational (PostgreSQL)

> Cloud Heroes Africa Platform — technical evaluation
> Author: AI-assisted analysis (Claude), reviewed by Bichesq Bijengsi
> Date: 2026-07-10
> Status: Recommendation
> Scope: Persistence choice for Student Hub and the wider CHA platform (Learning Platform, Learning Management, Administration)

---

## 1. Purpose

The Student Hub POC currently persists everything as local JSON files under `student-hub/data/`, with thin CRUD modules in `student-hub/lib/` (`mock-api.ts`, `approved-emails.ts`, `curriculum.ts`, `todos.ts`, `events.ts`, `audit.ts`) acting as the intended swap point for a real database. This document evaluates which database class fits the data we actually have — a document database such as MongoDB, or a relational database such as PostgreSQL — and gives a recommendation.

Note: the team already recorded a decision for **Prisma + PostgreSQL on AWS RDS (db.t4g.micro, Phase 1)** in `docs/student-hub-poc-notes.md` (June 2025). This evaluation independently tests that decision against the data model rather than assuming it.

---

## 2. Inventory of Our Data and Its Shape

All application types live in `student-hub/types/index.ts` (plus `lib/audit.ts`). Classified by shape:

### 2.1 Strongly relational data (the majority)

| Entity | Shape | Relationships |
|---|---|---|
| `ApprovedEmail` | Flat record with status lifecycle (`approved` / `revoked` / `pending`) | Referenced by `Student.approvedEmailId` — the access-control gate at login |
| `Student` | Mostly flat scalars (name, contact, locale, status, timestamps) | FK to `ApprovedEmail`, FK to active `Program` |
| `UnitCompletion` | Flat join record: `studentId`, `unitId`, `completedAt` | Classic **many-to-many** (student ↔ curriculum unit) |
| `Todo` | Flat, per-student | One-to-many Student → Todo |
| `LearningEvent` | Flat, shared/global | Future: attendance would be another student↔event join |

The planned Phase-2+ entities from `docs/architecture.md` §13 are even more relational: `Assessment` / `AssessmentQuestion` / `AssessmentResponse` / `AssessmentResult` (question banks with per-student response rows), `Role`, `Session`, plus anticipated cohorts. Assessments in particular are join-heavy by nature: "which students completed assessment X", "average score per cohort", "responses per question".

### 2.2 Document-shaped data (the minority)

| Data | Shape | Notes |
|---|---|---|
| `Program → Module → Unit` | 3-level nested tree, read-mostly | Curriculum content; served today as one nested JSON document per program |
| `Student.mfaMethods`, `Student.passkeys` | Small embedded arrays | Always read/written together with the student |
| `AuditEntry.changes[]` | Append-only log; `from`/`to` are schemaless (`unknown`) values | Naturally semi-structured |
| `Todo.dismissed` | Single embedded object `{ at, reason }` | Trivial either way |

### 2.3 Key observation

The data that **drives queries** (who is approved, who completed what, what's due, who attended, assessment results) is relational. The data that is **document-shaped** is either read-mostly content (curriculum) or small payloads that never need cross-document querying (MFA methods, audit change diffs). This asymmetry matters: relational databases handle embedded JSON well, but document databases handle joins and cross-collection integrity poorly.

---

## 3. Evaluation Criteria

Criteria weighted for CHA's context: a small team, an AWS-hosted demo growing into a multi-surface platform (Student Hub, Learning Platform, Learning Management, Administration), and student data that must stay consistent.

| # | Criterion | Why it matters here |
|---|---|---|
| 1 | Fit to data relationships | Progress tracking, assessments, cohorts are join-shaped |
| 2 | Data integrity guarantees | ApprovedEmail gating, ban enforcement, audit trail must not drift |
| 3 | Handling of nested/semi-structured data | Curriculum tree, MFA arrays, audit diffs |
| 4 | Reporting and admin queries | Board demos, admin panel, cohort analytics |
| 5 | Ecosystem fit (Next.js, Auth.js, ORM) | Small team, AI-assisted workflow needs well-trodden paths |
| 6 | AWS hosting cost/ops at Phase-1 scale | Pre-funding budget; db.t4g.micro-class instance |
| 7 | Team skill development | CHA is also a learning vehicle for cloud/DevOps careers |

---

## 4. Analysis

### 4.1 PostgreSQL (relational)

**Strengths for our data**

- **Relationships are first-class.** `UnitCompletion` (student↔unit), future assessment responses, event attendance, and cohort membership are joins. SQL answers "completion rate per module per cohort" in one query; in MongoDB this becomes `$lookup` aggregation pipelines or application-side joins.
- **Integrity is enforced by the database, not by code discipline.** A foreign key from `Student.approvedEmailId` to `ApprovedEmail`, a unique constraint on `email`, and a check constraint on `status` make the Option-C auth model (ADR-0001) structurally impossible to violate — important when the ban/revocation flow is a stated security requirement.
- **JSONB covers our document-shaped pockets.** The curriculum tree can live in a `jsonb` column (or be normalized later into `program` / `module` / `unit` tables — our types already carry `order` fields for exactly that). `mfaMethods`, `passkeys`, and `AuditEntry.changes` fit JSONB naturally, and Postgres can still index into them (GIN indexes) if we ever need to query them.
- **Transactions across entities.** First-login upsert touches `ApprovedEmail` + `Student` + audit log; profile updates touch `Student` + audit log. A single ACID transaction keeps these atomic. (MongoDB has multi-document transactions since 4.0, but they are the exception path there, not the default idiom.)
- **Ecosystem fit.** Prisma + PostgreSQL + Auth.js is the most-documented persistence stack for Next.js App Router. Auth.js has a first-party Prisma adapter if we later move from JWT sessions to database sessions (relevant to the open multi-surface auth-token question).
- **AWS fit.** RDS PostgreSQL db.t4g.micro is free-tier eligible and the exact instance already budgeted in the POC notes. Managed backups, snapshots, and an upgrade path (read replicas, Aurora) come with it.

**Weaknesses**

- Schema migrations are a required discipline (mitigated: Prisma Migrate automates this, and it's a valuable skill for the team to learn).
- Early-stage schema churn has slightly more ceremony than "just save the object" (mitigated: our types are already stable and relational — the churn largely already happened in the POC).

### 4.2 MongoDB (document)

**Strengths for our data**

- The `Program → Module → Unit` tree maps one-to-one onto a document; no impedance at all for curriculum reads.
- `Student` with embedded `mfaMethods`/`passkeys` is a textbook document.
- The append-only audit log with schemaless `changes` payloads is a natural fit (capped collections, flexible shape).
- Faster iteration when the schema is unknown — but ours no longer is: Option C is a documented PK/FK/UK design.
- MongoDB Atlas has a free tier; developer experience is good.

**Weaknesses for our data**

- **Our core queries cross collections.** Progress (`UnitCompletion`), todos, events, audit entries all reference students by id — they cannot be embedded in the student document (unbounded growth, cross-student queries). So in practice we'd run MongoDB *as if it were relational*, paying document-DB costs (manual referential integrity, `$lookup` pipelines) without collecting document-DB benefits.
- **No foreign keys or database-enforced uniqueness across relationships.** The approved-email gate, ban re-entry prevention, and student↔completion consistency would rely entirely on application code. A bug silently produces orphaned or duplicate records — bad for an audit-sensitive student platform.
- **Analytics/reporting is harder.** Admin panel and board-facing metrics (completion rates, streaks, assessment outcomes per cohort) are aggregation-pipeline territory; every BI/reporting tool speaks SQL first.
- **On AWS, self-managed or third-party.** DocumentDB is not fully MongoDB-compatible and is markedly more expensive than a t4g.micro RDS instance; Atlas adds a second vendor outside our AWS account. Either option complicates the Phase-1 infrastructure story.
- Prisma's MongoDB support exists but is second-class relative to its PostgreSQL support (no migrations, fewer features).

### 4.3 Scorecard

Scores 1–5, weighted by the criteria above (5 = best fit):

| Criterion | Weight | PostgreSQL | MongoDB |
|---|---|---|---|
| Fit to data relationships | 3 | 5 | 2 |
| Data integrity guarantees | 3 | 5 | 2 |
| Nested/semi-structured data | 2 | 4 (JSONB) | 5 |
| Reporting & admin queries | 2 | 5 | 3 |
| Ecosystem fit (Next.js/Auth.js/Prisma) | 2 | 5 | 3 |
| AWS cost/ops at Phase 1 | 2 | 5 | 3 |
| Team skill development | 1 | 5 | 4 |
| **Weighted total** | | **73 / 75** | **41 / 75** |

---

## 5. Recommendation

**Use PostgreSQL (with Prisma) — confirming the decision already logged in the POC notes.** Our data is relational at its core: students gated by approved emails, progress as a many-to-many join, and a roadmap (assessments, cohorts, roles, admin panel) that only gets more join-shaped. The genuinely document-like parts are small and read-mostly, and Postgres JSONB absorbs them without giving up integrity or SQL.

MongoDB would only be the better choice if our workload were dominated by large, self-contained, schema-varying documents queried one at a time — that is not what a learning platform's data looks like.

### Suggested modeling guidelines when the Prisma schema is written

1. **Normalize the query-driving entities**: `ApprovedEmail`, `Student`, `Todo`, `LearningEvent`, `UnitCompletion` (composite unique on `studentId + unitId`), and future `Assessment*`, `Cohort`, `Role` tables — with real FKs and unique constraints per the Option-C design in `docs/student-hub-poc-notes.md`.
2. **Use JSONB for the document-shaped pockets**:
   - `AuditEntry.changes` → `jsonb` column (keep `studentId`, `actor`, `action`, `timestamp` as real indexed columns).
   - `Student.mfaMethods` / `passkeys` → either JSONB or small child tables; prefer child tables if the admin panel will ever query "students with SMS MFA".
3. **Curriculum**: start with `Program.modules` as JSONB (matches today's read-mostly, whole-tree access in `lib/curriculum.ts`), but keep `Unit.id` stable and globally unique since `UnitCompletion.unitId` references into it. Normalize into `module`/`unit` tables when the Learning Platform module starts editing curriculum.
4. **Sessions**: keep JWT strategy for now; the Prisma adapter for Auth.js is available if the multi-surface auth question resolves toward database sessions.
5. **Local development**: run Postgres in Docker (`postgres:16-alpine`) to mirror RDS; keep the JSON seed files in `student-hub/data/` as Prisma seed input so the POC data carries over.

### What this unblocks

- The open POC checklist item "Prisma + PostgreSQL setup (next task)".
- "Option C auth implementation wired to real DB".
- A concrete `DATABASE_URL` for `.env.local` and the RDS Phase-1 provisioning task.

---

## 6. Decision Log Entry

| Date | Decision | Rationale | Status |
|---|---|---|---|
| 2026-07-10 | PostgreSQL (AWS RDS) + Prisma over MongoDB/document DB | Core data is relational (FKs, many-to-many progress, assessment roadmap); JSONB covers nested pockets; best Next.js/Auth.js/AWS fit at Phase-1 cost | Confirms June 2025 decision in POC notes |
