# CHA – Student Registration Flow

## Purpose
Design and document the external student intake and vetting process for Cloud Heroes
Africa, Phase 1. This stays outside the platform so the team keeps a human in the
loop before any student is granted access.

## Status
- [ ] Vetting goals and criteria defined
- [ ] Google Form drafted
- [ ] Response sheet set up and shared
- [ ] Form shared with Kris and team for review
- [ ] Intake workflow documented
- [ ] Google Form URL added to `NEXT_PUBLIC_REGISTRATION_FORM_URL` in `.env.local`
- [ ] Google Form URL added to `/not-approved` page in Student Hub

---

## How this connects to the platform (updated June 2025)

The registration flow is now the **only entry point** for new students.
Invite codes have been removed. The platform uses an approved email list instead.

Applicant fills Google Form
→ Kris reviews response in Google Sheet
→ Accept → add email to ApprovedEmail table (Phase 1: JSON file)
→ Waitlist → no action yet
→ Decline → optional response email
→ Approved student visits Student Hub
→ Signs in with Google
→ Auth checks ApprovedEmail table — email found, status = approved
→ Student record auto-created on first login
→ Redirected to /profile to complete registration
→ Then /dashboard

Unapproved students who attempt to sign in are redirected to `/not-approved`,
which links back to this Google Form.

---

## Google Form – Question Groups

### 1. Identity
- Full legal name
- Email address (required, validated) — this is the email that gets added to the approved list
- Country and city
- Time zone

### 2. Background
- Current occupation (student / graduate / working professional / other)
- Prior exposure to cloud computing or software development (none / beginner / intermediate / advanced)
- Highest level of education completed

### 3. Motivation
- Why do you want to join Cloud Heroes Africa? (free text, 3–5 sentences)
- What do you hope to do with your certification after completing the program? (free text)

### 4. Availability
- How many hours per week can you realistically commit? (multiple choice: <5 / 5–10 / 10–15 / 15+)
- Preferred learning time windows (morning / afternoon / evening / flexible)

### 5. Technical Readiness
- Do you have reliable access to a personal laptop? (yes / no / shared access)
- How would you describe your internet reliability? (stable / mostly stable / unreliable)
- Preferred working language (English / French / both)

### 6. Commitment Acknowledgement
- "I understand Cloud Heroes Africa is a structured, time-committed program and I
  agree to participate actively." (checkbox, required)

### Reviewer notes
- **Scoring aid:** Flag anyone selecting less than 5 hrs/week for closer review —
  not an automatic decline, but worth a human look.
- **Red flag:** Answers mentioning exams in the next 4–6 weeks warrant waitlist
  rather than immediate acceptance.
- **Free-text quality bar:** Motivation questions (groups 3) are your best signal.
  A vague or one-line answer is a stronger filter than any multiple-choice response.
- **Email accuracy is critical:** The email entered on this form is the one that
  gets added to the approved list. A typo means the student can never log in.
  Consider adding an "confirm your email" field or a note asking them to
  double-check before submitting.
- **Confirmation email:** Turn on "Send respondents a copy of their response" in
  Google Forms settings so applicants have a record.

---

## Vetting Criteria

| Signal           | Green                         | Amber                           | Red                              |
|------------------|-------------------------------|---------------------------------|----------------------------------|
| Email            | Valid + matches Google account| Valid but uncertain             | Missing, invalid, or fake        |
| Availability     | 10+ hrs/week                  | 5–10 hrs/week                   | <5 hrs/week                      |
| Motivation       | Specific, goal-oriented       | Generic but genuine             | Blank or copy-pasted             |
| Tech readiness   | Own laptop + stable internet  | Shared access                   | No reliable access               |
| Language         | English fluent                | Basic                           | Not stated                       |

---

## Vetting Workflow

1. New response lands in the linked Google Sheet.
2. Reviewer scans responses weekly (or after each submission batch).
3. Mark each row: **Accept / Waitlist / Decline**.
4. For accepted applicants:
   - Phase 1: manually add their email to `data/approved-emails.json` in the
     Student Hub repo. Set `status: "approved"`, `source: "form"`, add notes.
   - Phase 2: admin panel in Administration app — add via UI, creates
     `ApprovedEmail` row in database automatically.
5. Send welcome email to the student with:
   - Link to the Student Hub (`/`)
   - Instruction to click "Get Started with Google" using the email they registered with
   - Brief overview of what to expect on first login (profile completion)
6. Log decision date and reviewer initials in the Google Sheet.

---

## Welcome email template (Phase 1)

> Subject: You're in — Cloud Heroes Africa
>
> Hi [Name],
>
> Great news — your application to Cloud Heroes Africa has been reviewed and
> you've been accepted into [Cohort name].
>
> To get started, visit [Student Hub URL] and click "Get Started with Google".
> Make sure you sign in with the Google account linked to [email address] —
> this is the email we have on file for you.
>
> On first login you'll be asked to complete your profile. This takes about
> 5 minutes. After that you'll have access to your dashboard.
>
> If you have any trouble signing in, reply to this email and we'll help you out.
>
> Welcome to the team.
> [Coordinator name] — Cloud Heroes Africa

---

## Approved emails JSON structure (Phase 1)

When adding a student manually to `data/approved-emails.json`:

```json
{
  "email": "student@gmail.com",
  "status": "approved",
  "source": "form",
  "notes": "Cohort 4 — strong motivation answer, 10+ hrs/week",
  "createdBy": "kris",
  "createdAt": "2025-06-15"
}
```

Phase 2 this moves to the `ApprovedEmail` database table managed via admin panel.

---

## Open Questions

- [ ] **Declined applicants** — should they receive a response email? If yes, what
  does it say and who sends it?
- [ ] **Waitlist process** — how long does a waitlisted applicant wait? Is there a
  cohort intake schedule that determines when they're reconsidered?
- [ ] **Email typo recovery** — if the student submits the wrong email on the form
  and it gets approved, they can never log in. What is the correction process?
  (Kris edits the JSON / DB directly for Phase 1.)
- [ ] **Form URL** — needs to be confirmed and added to `NEXT_PUBLIC_REGISTRATION_FORM_URL`
  in `.env.local` and to the `/not-approved` page.
- [ ] **Data transfer from form to profile** — can/should responses from the Google
  Form (city, country, language preference) pre-populate the student's profile
  on first login? Would need a way to match form response to Google account.
- [ ] **Cohort capacity** — is there a maximum number of students per cohort? If so,
  the vetting workflow needs a cap and a clear point at which the form closes
  or routes to waitlist automatically.

---

## Decisions made

| Decision | Choice | Date |
|---|---|---|
| Invite code model | Removed — replaced with approved email list | June 2025 |
| Approval mechanism | Kris reviews Google Form → adds email to approved list | June 2025 |
| Phase 1 approved list | `data/approved-emails.json` edited manually | June 2025 |
| Phase 2 approved list | Admin panel → ApprovedEmail DB table | June 2025 |
| Unapproved login attempt | Redirected to /not-approved → Google Form link | June 2025 |
| reCAPTCHA | Removed with invite code flow | June 2025 |

---

## Links
- [[CHA – Decision Log]]
- [[CHA – Student Hub POC Notes]]
- [[CHA – Architecture Overview]]
- [[CHA – Home Screen Design]]
- [[CHA – Service Desk model]]