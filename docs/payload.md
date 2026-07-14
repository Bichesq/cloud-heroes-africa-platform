# Payload CMS — Architecture & Usage Guide

> **Scope:** This document describes how Payload CMS is used across the Cloud Heroes
> Africa platform — what it owns, what it does not own, and how it integrates with
> the rest of the system.
>
> **Status:** Active — reflects decisions made through July 2026 sessions.

---

## 1. Role of Payload CMS in This Platform

Payload CMS serves as the **shared backend** for the Cloud Heroes Africa platform.
It is the single source of truth for both:

- **Content data** — the structured educational content authored by creators
  (programs, modules, units, learning materials, assessments)
- **Operational data** — the transactional state generated as students move through
  the platform (progress records, assessment attempts, approved student lists, etc.)

This decision was made to avoid over-engineering a two-service split before the POC
is complete. A single Payload instance backed by a shared PostgreSQL database
(via Drizzle ORM) serves all five application surfaces:

| Surface             | Consumes Payload via          |
| ------------------- | ----------------------------- |
| Student Hub         | REST API / custom endpoints   |
| Learning Platform   | REST API / custom endpoints   |
| Learning Management | REST API / custom endpoints   |
| Administration      | Payload Admin UI + REST API   |
| Donor Hub           | REST API (Phase 2)            |

Payload was chosen because:

- It is code-first and TypeScript-native, matching the team's existing stack
- It generates a production-ready Admin UI from the collection definitions
- It supports PostgreSQL natively via Drizzle ORM
- The team (Bichesq) already has deep familiarity with it
- Custom endpoints allow business logic to be added without fighting the framework

---

## 2. What Payload Owns

### 2.1 Content Collections (`content`)

These are structured content items created and managed by course creators and staff
inside Learning Management or the Payload Admin UI.

| Collection         | Description                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| `Programs`         | Top-level learning programs (e.g., Cloud Practitioner Track)                |
| `Modules`          | Groups of related units within a program                                    |
| `Units`            | Individual learning units within a module                                   |
| `LearningMaterials`| Text, video links, embedded content, and file attachments attached to units |
| `Assessments`      | Assessment definitions (question bank, type, pass threshold)                |
| `Questions`        | Individual questions belonging to an assessment                             |
| `KBArticles`       | Knowledge base articles created by Help Desk staff from resolved tickets    |
| `Events`           | Learning events created in Learning Management, surfaced on Student Hub     |

**Content hierarchy:**

Program
└── Module (one or more)
└── Unit (one or more)
├── LearningMaterials (one or more)
└── Assessment (one per unit, module, or program level)
└── Questions (one or more)


Assessment levels mirror the course hierarchy:

- **Unit assessment** — knowledge check after each unit
- **Module assessment** — competency check after all units in a module
- **Program assessment** — final check across the full program

### 2.2 Operational Collections (`ops`)

These are transactional records generated at runtime by student and admin activity.
They are stored in Payload/PostgreSQL but are not CMS content — they are system
state.

| Collection           | Description                                                                      |
| -------------------- | -------------------------------------------------------------------------------- |
| `ApprovedStudents`   | Admin-managed list of Gmail addresses permitted to access the platform           |
| `StudentProgress`    | Per-student, per-unit progress status (see status model below)                  |
| `AssessmentAttempts` | Record of each assessment attempt by a student, including answers and score      |
| `HelpDeskTickets`    | Student support tickets (see Help Desk documentation for full field spec)        |
| `ServiceDeskTickets` | Infrastructure/account issues (separate workflow from Help Desk)                 |

**Unit progress status model:**

A student's progress on a unit follows this status progression:

not_started → in_progress → completed → competent
↓
retake (on first assessment failure)
↓
[team notified] (on second consecutive failure)


- `completed` — the student has consumed all unit content
- `competent` / `verified` — the student has passed the unit assessment
- `retake` — the student failed the assessment once; unit resets to allow retry
- On a second failure, a team member is notified to follow up with the student

---

## 3. What Payload Does NOT Own

Payload is not responsible for:

- **Authentication logic** — Google OAuth (Student Hub) and Microsoft SSO
  (Learning Management) are implemented as custom auth strategies in Payload or
  as middleware in the Next.js layer. Payload stores the resulting user records,
  but the OAuth handshake is handled externally.
- **Business logic / rules engine** — scoring, unlock triggers, failure
  notifications, and escalation rules live in custom API endpoints, not in
  Payload collection hooks. This keeps logic testable and separated from the
  data layer.
- **Real-time features** — any live chat, real-time notifications, or WebSocket
  connections are handled at the Next.js or infrastructure layer, not through
  Payload.
- **Email delivery** — transactional emails (approval confirmations, failure
  alerts, ticket notifications) are sent by a dedicated email service
  (e.g., Resend or SendGrid), triggered by custom endpoint logic.

---

## 4. Authentication Integration

### Student Hub — Google OAuth

- Students authenticate via Google OAuth
- After authentication, the system checks the student's Gmail address against the
  `ApprovedStudents` Payload collection
- If the email is on the list → student is logged in and enters Student Hub
- If the email is not on the list → student is redirected to the registration/
  intake form (external Google Form in Phase 1)
- The `ApprovedStudents` list is managed by administrators via the Payload Admin UI

### Learning Management — Microsoft SSO

- Authors, volunteer professors, and course creators authenticate via Microsoft
  SSO using Cloud Heroes Africa organization accounts
- Payload stores the resulting user record linked to their Microsoft identity
- No separate in-app password or profile management is needed for this surface

### Shared Auth Layer

- Authentication is the common layer across all platform modules
- Each application surface (Student Hub, Learning Platform, Learning Management,
  Administration) piggybacks on the same Payload Users collection and auth setup
- Payload issues and validates JWTs consumed by all front-end applications

---

## 5. Access Control

Payload's built-in collection-level and field-level access control is used to
enforce the following permission model:

| Role                | Access                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- |
| `super-admin`       | Full access across all collections and all surfaces; can override any permission    |
| `admin`             | Manages ApprovedStudents, HelpDeskTickets, ServiceDeskTickets, KBArticles, Users   |
| `course-creator`    | Full CRUD on Programs, Modules, Units, Assessments they own; read-only on others   |
| `collaborator`      | Read-only on course content unless explicitly granted edit/admin access by owner   |
| `student`           | Read access to enrolled content; write access to their own progress/attempt records|
| `donor`             | Restricted read-only view (Donor Hub — Phase 2)                                    |

Key rules:
- Course creators own their programs; others default to read-only
- Course creators do not have student-management capabilities
- Admin accounts cannot create other admin/volunteer accounts without super-admin
  involvement (governance control, not yet fully defined)

---

## 6. Custom Endpoints

Business logic that cannot be expressed as simple CRUD operations is exposed via
Payload custom endpoints. These include:

| Endpoint                          | Purpose                                                                 |
| --------------------------------- | ----------------------------------------------------------------------- |
| `POST /api/auth/google`           | Initiates Google OAuth flow and checks ApprovedStudents on callback     |
| `POST /api/auth/microsoft`        | Initiates Microsoft SSO flow for Learning Management users              |
| `POST /api/assessments/:id/submit`| Accepts student answers, scores them, updates StudentProgress, triggers failure notifications on second failure |
| `GET /api/students/:id/progress`  | Returns a student's full progress map across all enrolled programs      |
| `POST /api/helpdesk/tickets`      | Creates a Help Desk ticket with system-derived context (student, program, module, unit at time of submission) |
| `POST /api/kb/publish`            | Promotes a resolved Help Desk ticket to a KB article after staff review |

---

## 7. Payload and the Shared Backend Architecture

The June 4 decision confirmed: **one shared data store with multiple APIs and
multiple front-end surfaces**.

Payload fulfills this as follows:

┌─────────────────────────────────────────────────────┐
│ PostgreSQL (shared) │
│ (hosted on Render / AWS — TBD) │
└────────────────────────┬────────────────────────────┘
│
┌──────────▼──────────┐
│ Payload CMS │
│ (REST + GraphQL │
│ + Admin UI) │
└──┬────┬────┬────┬──┘
│ │ │ │
┌───────┘ │ │ └──────────┐
▼ ▼ ▼ ▼
Student Hub Learning Learning Administration
(Next.js) Platform Management (Next.js /
(Next.js) (Next.js) Payload Admin)


All five surfaces talk to the same Payload instance. The Payload Admin UI itself
serves as the primary interface for the Administration surface in Phase 1, with
a custom Administration app added in a later phase if needed.

---

## 8. When to Reconsider This Architecture

This single-Payload architecture should be reviewed and potentially split if:

1. Assessment analytics or cohort reporting require complex aggregation queries
   that become too slow through Payload's API layer
2. The operational data volume (StudentProgress, AssessmentAttempts) grows to a
   point where it impacts the performance of content queries
3. A dedicated assessment engine (e.g., adaptive learning, randomized question
   banks with weighted scoring) is needed that exceeds what Payload collections
   can cleanly model
4. A third-party LMS integration becomes a requirement

At that point, the operational collections (`StudentProgress`, `AssessmentAttempts`)
should be extracted into a dedicated service with its own database, while Payload
retains ownership of the content collections.

---

## 9. Open Questions

The following questions remain unresolved and should be addressed before
implementation of the learning platform layer begins:

| Question | Why it matters |
| -------- | -------------- |
| Should assessments be their own standalone Payload plugin/module or remain inline collections? | Affects how reusable the assessment engine is across programs |
| How are randomized or shuffled question banks handled at the collection level? | Affects the `Questions` collection design |
| Should student progress be queryable in aggregate by admins (cohort dashboards)? | Affects whether Payload's API is sufficient or if raw DB queries are needed |
| What is the Payload deployment target — Render, AWS EC2, or AWS ECS? | Affects build and environment configuration |

---

## 10. Related Documents

- [`architecture.md`](./architecture.md) — overall system architecture
- [`decision-log.md`](./decision-log.md) — full decision history including the
  Payload CMS suitability decision (2026-05-21, Section 4)
- [`requirements/`](./requirements/) — per-surface requirements files
- [`adr/`](./adr/) — architecture decision records