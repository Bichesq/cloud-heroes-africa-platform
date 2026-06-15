# CHA – Student Hub POC Notes

## Purpose
Track implementation progress, blockers, open questions, and integration unknowns
that surface while building the first Student Hub proof of concept. This note feeds
the next planning session.

## Status
- [x] Repo slice / routing structure created
- [x] Google OAuth flow (Auth.js beta + Google provider)
- [x] Approved email access control — replaced invite code flow
- [x] Profile completion page (all fields including legal name, preferred name)
- [x] Profile completeness gate — `profileCompletedAt` timestamp drives middleware redirect
- [x] Dashboard shell (static/mock data)
- [x] Service Desk / Help Desk entry hooks
- [x] Knowledge Base widget — full-width, local search + category filters
- [x] Nav shell — Sidebar (desktop) + hamburger drawer (mobile) + TopBar with avatar
- [x] Landing page — branded, Get Started triggers signIn("google") directly
- [x] /not-approved page — unapproved emails land here with link to Google Form
- [x] Data model — Option C selected (ApprovedEmail + Student with soft linkage)
- [x] POC questions and blockers logged
- [ ] Prisma + PostgreSQL setup (next task)
- [ ] Option C auth implementation wired to real DB (next task)
- [ ] Admin panel for managing approved emails (Phase 2)

---

## Scope (agreed June 2025)
Student Hub is the first implementation slice. It acts as a **gateway and view
layer** — it surfaces data from Learning Platform, Learning Management, and
Administration but does not own or manage those artifacts.

### Entry flow (updated — invite code removed)
1. Landing page → "Get Started with Google" triggers `signIn("google")`.
2. Auth.js `signIn` callback normalizes email and checks `ApprovedEmail` table.
   - Not approved → `/not-approved` page with link to Google Form registration.
   - Approved → continue.
3. Check if `Student` record exists.
   - First login → auto-create `Student`, link `approvedEmailId`.
   - Returning → update `lastLogin`.
4. JWT callback stores `email`, `givenName`, `familyName`, `studentId`.
5. Middleware checks `profileCompletedAt`:
   - Null → redirect to `/profile`.
   - Set → proceed to `/dashboard`.

### Profile fields
- Given name, family name (from Google — read-only)
- Email (from Google — read-only)
- Legal name
- Preferred / display name (policy unresolved — TODO flag in code)
- City, country
- Phone number
- Alternate email
- Birth date
- MFA setup (pending Kris decision — see Open Questions)

### Dashboard sections
| Section               | Data source (target)       | Phase 1 state               |
|-----------------------|----------------------------|-----------------------------|
| Program + progress    | Learning Platform API      | Static mock                 |
| Assessment summary    | Learning Platform API      | Static mock                 |
| Alerts / updates      | Administration module      | Hard-coded array            |
| Calendar view         | Learning Management events | Static examples             |
| Knowledge base        | Administration / Help Desk | Local search, mock articles |
| Help Desk entry point | Help Desk module           | Link placeholder            |
| Service Desk          | Administration module      | Link + static text          |

### Service Desk hooks
- "Can't access my account" link in nav sidebar and login area.
- `/support` page — static info, email placeholder, account recovery note.
- "Lost MFA / lost Google account" — static for Phase 1, email-based.

---

## Tech stack
- Next.js 16.2.9 (App Router) + TypeScript
- Tailwind CSS
- Auth.js beta — Google OAuth, JWT session strategy, HTTP-only cookie
- Prisma + PostgreSQL (AWS RDS `db.t4g.micro` for Phase 1) — setup pending
- Mock API / local JSON (`data/students.json`) until Prisma is wired up
- `react-google-recaptcha` — removed (invite code flow dropped)

---

## Data model — Option C

**Decision: dedicated `ApprovedEmail` table + separate `Student` model, linked on
first login.**

Rationale: clean separation between "approved to enter" and "user identity +
behaviour". No migration needed later. AWS cost vs Option A: negligible.

### ApprovedEmail
| Field       | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | uuid PK      |                                |
| email       | string UK    | normalized lowercase           |
| status      | string       | approved, revoked, pending     |
| source      | string       | manual, form, import           |
| notes       | text         | admin notes                    |
| createdBy   | uuid         |                                |
| createdAt   | timestamp    |                                |
| updatedBy   | uuid         |                                |
| updatedAt   | timestamp    |                                |

### Student
| Field              | Type      | Notes                              |
|--------------------|-----------|------------------------------------|
| id                 | uuid PK   |                                    |
| approvedEmailId    | uuid FK   | links to ApprovedEmail             |
| email              | string UK |                                    |
| givenName          | string    | from Google OAuth                  |
| familyName         | string    | from Google OAuth                  |
| legalName          | string    | entered during profile             |
| preferredName      | string    | policy TBD                         |
| phone              | string    |                                    |
| alternateEmail     | string    |                                    |
| birthDate          | date      |                                    |
| city               | string    |                                    |
| country            | string    |                                    |
| status             | string    | active, banned                     |
| lastLogin          | timestamp | updated every login                |
| profileCompletedAt | timestamp | null until profile form saved      |
| createdAt          | timestamp |                                    |
| updatedAt          | timestamp |                                    |

---

## Folder structure (current)

student-hub/

├── app/
│   ├── page.tsx                          ← landing page
│   ├── not-approved/page.tsx             ← unapproved email page
│   ├── (public)/                         ← invite/ DELETED (flow removed)
│   ├── (auth)/                           ← callback/ DELETED (Auth.js handles)
│   └── (student)/
│       ├── layout.tsx                    ← session guard + Sidebar + TopBar
│       ├── components/
│       │   ├── Sidebar.tsx               ← desktop nav
│       │   └── TopBar.tsx                ← mobile nav + avatar dropdown
│       ├── profile/
│       │   ├── page.tsx
│       │   └── ProfileForm.tsx
│       ├── dashboard/
│       │   ├── page.tsx
│       │   ├── data/mock.ts
│       │   └── components/
│       │       ├── ProgressWidget.tsx
│       │       ├── AssessmentCard.tsx
│       │       ├── AlertsList.tsx
│       │       ├── CalendarWidget.tsx
│       │       ├── HelpDeskEntry.tsx
│       │       └── KnowledgeBaseWidget.tsx
│       └── support/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   └── profile/route.ts
├── lib/
│   ├── auth.config.ts                    ← signIn/jwt/session/authorized callbacks
│   ├── auth.ts                           ← exports handlers, auth, signIn, signOut
│   ├── approved-emails.ts                ← isEmailApproved() Phase 1 JSON check
│   └── mock-api.ts                       ← saveStudent/getStudent → students.json
├── middleware.ts                          ← exports auth from Auth.js
├── types/index.ts
└── docs/
└── student-hub-poc-notes.md          ← this file

---

## Open questions
> Add new questions here as you hit them while coding.

### Auth & access
- [ ] **MFA during registration** — requirements diagram lists MFA as a step.
  Pending Kris:
  - Option A: defer to Google (recommended for Phase 1 — no extra infra)
  - Option B: SMS OTP on phone number entered during registration
  - Option C: TOTP (Google Authenticator / Authy) QR code during profile
- [ ] **Session expiry** — how long before re-authentication is required?
- [ ] **Multiple Gmail accounts abuse** — Phase 1: accepted risk. Phase 2: StudentID concept, IP/behaviour tracking.
- [ ] **Role-based access** — approved email list must be behind authenticated, role-based admin access. Not yet implemented.

### Profile
- [ ] **Preferred / display name policy** — can students set freely or is it moderated?
- [ ] **Phone validation** — free text now. Consider `libphonenumber-js` for E.164.
- [ ] **Alternate email purpose** — comms only, or recovery? Affects helper text.
- [ ] **Birth date minimum age** — any minimum? Add validation if so.
- [ ] **Countries list** — static Africa-first list in `ProfileForm.tsx`. Consider `country-list` library.
- [ ] **Can/Should data transfer from Google Reg Form to student profile?**

### Learning platform
- [ ] **Programme progress shape** — what does the Learning Platform API return?
- [ ] **Next assessment** — fixed cohort schedule or individual path?
- [ ] **Learning platform URL + SSO** — "Go to Learning Platform" links to `#`.
- [ ] **Calendar events model** — what fields does Learning Management expose?

### Help Desk & Service Desk
- [ ] **Support email / URL** — `support@cloudheroesafrica.com` is a placeholder.
- [ ] **Service Desk platform** — Phase 1 email. Future: Zendesk, Freshdesk, Jira?
- [ ] **Ticket list for students** — filtered by status, recency, or module?
- [ ] **Lost account intake location** — Student Hub login, public website, or Admin/Service Desk app?

### Knowledge base
- [ ] **KB source** — Notion, Confluence, or custom CMS?
- [ ] **Search API** — local filter is placeholder. Real API TBD.
- [ ] **KB target** — open inside hub or new tab?

### Dashboard
- [ ] **Alerts source** — admin panel entries, LMS triggers, or WhatsApp/Teams mirroring?
- [ ] **Profile picture** — show Google `picture` claim in TopBar instead of initials?
- [ ] **Sign-out redirect** — currently `/` (landing). Confirm this is correct.

---

## Blockers
> Log anything blocking progress here.

- [ ] **Database not yet set up** — Prisma + PostgreSQL setup is the immediate next task before Option C auth can be wired to a real DB.
- [ ] **Google Form URL** — `NEXT_PUBLIC_REGISTRATION_FORM_URL` in `.env.local` is a placeholder. Needed before `/not-approved` page is production-ready.
- [ ] **Admin panel** — no way for Kris to manage approved emails via UI yet. Phase 1 workaround: edit `data/approved-emails.json` manually.

---

## Decisions made

| Decision | Choice | Date |
|---|---|---|
| OAuth provider | Auth.js beta + Google provider | June 2025 |
| Session storage | HTTP-only JWT cookie | June 2025 |
| Invite code + reCAPTCHA | Removed — replaced with approved email list | June 2025 |
| Access control (Phase 1) | ApprovedEmail table, Kris manages JSON manually | June 2025 |
| Unapproved users | /not-approved → Google Form link | June 2025 |
| Data model | Option C — ApprovedEmail + Student with soft linkage | June 2025 |
| Profile completeness gate | profileCompletedAt timestamp — null = incomplete | June 2025 |
| Profile fields | All fields, preferredName policy TBD | June 2025 |
| Nav layout | Sidebar (desktop) + hamburger drawer (mobile) | June 2025 |
| KB widget | Full-width dashboard section, local search + filters | June 2025 |
| MFA approach | Pending Kris — recommended: defer to Google 2FA | June 2025 |
| Database | Prisma + PostgreSQL, AWS RDS db.t4g.micro Phase 1 | June 2025 |
| AWS cost — Option A vs C | Negligible difference — C chosen on engineering grounds | June 2025 |
| Home page | Branded landing, Get Started → signIn("google") | June 2025 |
| Monorepo vs separate repos | Monorepo | June 2025 |

---

## Decisions needed before finalizing POC
- MFA approach (pending Kris)
- Preferred name / display name policy (pending Kris)
- Auth token strategy across multiple app surfaces (Student Hub, Learning Platform, Learning Management)
- Admin panel for approved email management (Phase 2 scope decision)

---

## Environment variables required
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_REGISTRATION_FORM_URL
DATABASE_URL

---

## Links
- [[CHA – Decision Log]]
- [[CHA – Student Registration Flow]]
- [[CHA – Architecture Overview]]
- [[CHA – Home Screen Design]]
- [[CHA – Service Desk model]]