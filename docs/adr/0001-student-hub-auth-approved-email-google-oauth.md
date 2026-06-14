# ADR-0001: Student Hub Auth with Approved Email List + Google Auth

- **Status:** Accepted
- **Date:** 2026-06-11
- **Deciders:** Team / Kris / Bichesq
- **Related:**
  - `docs/decision-log.md` (2026-06-11 auth decisions)
  - Student Hub requirements MDs (login, registration, dashboard)

## Context

Cloud Heroes Africa needs a secure but simple way for students to sign in to the Student Hub.  
Earlier sessions explored an invite-code based onboarding flow with reCAPTCHA, where vetted students received unique invite codes that they had to enter before completing Google OAuth. [page:1][cite:2]

This design created extra steps and manual handling (generating codes, sending them, students copy-pasting) without clearly improving security over simpler gating models.  
At the same time, the team stressed the need to protect the community from abuse, spam registrations, and account re-entry by banned users, while still supporting an accessible student experience. [page:1]

We also agreed that, in Phase 1, student intake is driven by an external form (e.g., Google Form) plus human vetting, and that Student Hub is the first implementation slice as the main authenticated entry point. [cite:2]

## Decision

Student Hub will use **Google OAuth** as the primary authentication mechanism for students, combined with an **admin-managed approved-email list** that gates access. [page:1][cite:2]

- When a user clicks the Student Hub login buttons (“Get Started” or “Student Sign-In / Continue with Google”), they are sent through the same Google OAuth flow.
- After Google returns the user’s Gmail address, Student Hub checks whether that email is present on an **approved-email list** managed within the Administration module.
- If the email is on the approved list:
  - The student account is created or loaded, and the user is allowed into the Student Hub (dashboard, etc.).
- If the email is **not** on the approved list:
  - The system informs the user that they are not yet registered and redirects them to the registration/onboarding path (currently the external Google Form). [page:1]

The **invite code** and **reCAPTCHA** steps are removed from the Student Hub auth flow. [page:1][cite:2]

## Options Considered

1. **Invite Codes + reCAPTCHA + Google Auth (previous design)**

   - Pros:
     - Unique codes tied to students can act as one layer of “firewall”.
     - reCAPTCHA protects against some automated bot signup attempts.
   - Cons:
     - Requires generating, storing, and distributing codes reliably.
     - Students must manage and copy/paste tokens correctly.
     - Extra UX friction and support overhead.
     - Still vulnerable to bad actors who obtain invite codes or create new emails.

2. **Open Self-Registration with Google Auth Only**

   - Pros:
     - Minimal friction for students.
     - Easiest implementation.
   - Cons:
     - Gates the community weakly: anyone with a Gmail can enter.
     - Does not support the vetting concerns Kris raised (e.g., protecting community culture, reducing abuse, preventing repeated re-entry with new emails). [page:1]
     - Harder to manage banned users or enforce community boundaries.

3. **Approved Email List + Google Auth (chosen)**

   - Pros:
     - Simple UX: students sign in with Google; no codes to manage.
     - Clear control point for admins via an explicit approved-email list.
     - Helps prevent banned users from rejoining with the same email.
     - Aligns naturally with the existing vetting process (external form + human approval). [page:1]
   - Cons:
     - Admin overhead: someone must maintain the approved-email list.
     - Does not stop a determined bad actor from attempting with multiple new Gmail accounts (mitigated by vetting and monitoring).
     - Requires careful handling of the list in the Administration module (security, audit logs, etc.).

## Rationale

The invite-code + reCAPTCHA flow added complexity and friction without providing a proportionate security benefit for Phase 1.  
The team explicitly agreed on June 11 to **eliminate invite codes** and **remove reCAPTCHA** from the student auth flow, in favour of a simpler Google Auth based flow backed by an admin-maintained approved-email list. [page:1][cite:2]

This aligns with the project’s priorities:

- **Security & community protection:**  
  - The approved-email list acts as a controllable gate: only vetted addresses can log in.  
  - Banned users can be removed from the list to prevent re-entry with the same email.

- **Simplicity & UX:**  
  - Students use a familiar Google sign-in without dealing with codes.  
  - Both “Get Started” and “Student Sign-In” can share the same underlying flow, reducing branching complexity while keeping a friendly UI. [page:1]

- **Fit with existing intake process:**  
  - Vetting remains upstream: external registration form + interviews/group sessions, which then feed the approved-email list.  
  - The auth system itself stays relatively thin and maintainable in the Student Hub. [page:1]

## Consequences

### Positive

- Reduced friction for students: no invite code, fewer steps, predictable Google sign-in. [page:1]
- Clear separation between **intake/vetting** (forms, calls) and **authentication** (Student Hub login).  
- Central control for admins: a single list in Administration to manage who can log in. [page:1]
- Simpler implementation within Student Hub, aligning well with the decision to start with Student Hub as the first implementation slice. [cite:2]

### Negative / Risks

- Requires robust tooling in Administration to:
  - Add, update, and remove approved emails.
  - Audit who approved which student and when.
- Does not prevent abuse via multiple different Gmail accounts; that must be mitigated via vetting, monitoring, and possibly future controls (e.g., student IDs, behaviour monitoring). [page:1]
- If the approved-email list is mismanaged (e.g., stale entries, incorrect addresses), legitimate students may be blocked or unvetted addresses may be granted access.

### Follow-ups / Tasks

- [ ] Implement the approved-email list model and admin UI in the Administration module (e.g., “Approved Students” list). [page:1]
- [ ] Implement Student Hub login:
  - Shared flow for “Get Started” and “Student Sign-In / Continue with Google”.
  - Post-Google-auth check against the approved-email list.
  - Branching: allowed → dashboard; not allowed → registration path. [page:1]
- [ ] Update Student Hub requirements MDs (`Project-Overview.md`, `login.md`, etc.) to reflect this auth model and remove invite-code/reCAPTCHA references. [cite:2]
- [ ] Update `docs/decision-log.md` to reference this ADR for all 2026-06-11 auth-related decisions. [cite:2]
- [ ] Design and implement audit logging around changes to the approved-email list (who added/removed which email and when).

## Status History

- **2026-06-11** – Decision agreed in Student Hub auth discussion (meeting). [page:1]
- **2026-06-14** – ADR written and marked **Accepted** for implementation.