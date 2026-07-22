# Learning Platform

Student-facing learning surface for Cloud Heroes Africa — a separate Next.js app
from Student Hub (decision 2026-07-06) where students browse enrolled programs,
read unit content (static visuals + **local TTS**, no video in V1), complete
Knowledge Checks, and track points, goals, and exam readiness.

Built against:
- `docs/learning-platform/requirements/learning-platform-requirements.md` (source of truth)
- `docs/learning-platform/learning-platform-design-evaluation.md`
- the mockups in `docs/learning-platform/`, adjusted by decision-log entries up to 2026-07-16

## Running locally

```bash
# Student Hub (port 3000)
cd student-hub && npm run dev

# Learning Platform (port 3001)
cd learning-platform && npm install && npm run dev
```

### Environment (`.env.local`)

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Same OAuth client as Student Hub |
| `NEXTAUTH_SECRET` | **Must equal Student Hub's** — this is what makes the shared-session handshake work |
| `NEXTAUTH_URL` | `http://localhost:3001` |
| `NEXT_PUBLIC_STUDENT_HUB_URL` | Links back to the hub (profile, service desk) |
| `NEXT_PUBLIC_REGISTRATION_FORM_URL` | "Apply to join" link |
| `INTEGRATION_TOKEN` | Shared secret for `/api/integration/*` (server-to-server) |
| `SHARED_DATA_DIR` | Optional override for the shared store directory |

**Google Cloud console**: add `http://localhost:3001/api/auth/callback/google`
to the OAuth client's authorized redirect URIs (one-time setup).

## Shared auth & data

LP runs its own NextAuth instance with the same secret and Google client as
Student Hub. On localhost, cookies are port-agnostic, so signing in on either
app signs you into both — that's the Student Hub → LP "handshake". The approved
email gate and student upsert mirror Student Hub's.

Shared JSON stores live at the **repo root** `data/` (read by both apps):
`approved-emails.json`, `students.json`, `support-tickets.json`,
`audit-log.json`. LP-owned learning stores live in `learning-platform/data/`
(`lp-*.json`) and mirror the target Postgres schema in
`docs/learning-platform/schema.sql` 1:1 — migrating to Postgres replaces only
`lib/store/*` and `lib/shared-data.ts`.

## Architecture map

- **Content**: Program → Module → Unit → Section → Item; reading items carry
  ordered content blocks (`heading | richtext | image | code | callout`; a
  `video` block type is reserved for the fast-follow).
- **Unit statuses** (dual-state model): `in_progress → completed` (all readings
  done, earns points) and `verified` (Knowledge Check passed); KC failure sets
  `retake`, a second consecutive failure records an escalation
  (`data/lp-escalations.json`) for team follow-up.
- **Points**: append-only ledger; unit unlock thresholds are enforced in the
  program page and by URL guard in the unit page.
- **TTS**: `lib/tts/useSpeech.ts` (Web Speech API, sentence-chunked with a
  Chrome keep-alive) + `lib/tts/serialize.ts` (blocks → lesson script, also
  shown in the right panel's Lesson Script tab).
- **Help**: `components/help/HelpModal.tsx` on every unit/KC/readiness screen
  POSTs to `/api/support`, which writes the **shared** ticket store with the
  explicit `{program, module, unit}` context (requirements §10).
- **Student Hub integration** (`/api/integration/*`, guarded by
  `x-integration-token` + `?email=`):
  - `summary` — current unit, units remaining, progress %, points
  - `streak` — Goals Meeting Streak (consecutive deadlines met)
  - `readiness` — latest Exam Readiness score/level + history

## Manual verification walkthrough

1. Sign in on `localhost:3000` with an approved Google account, then open
   `localhost:3001` — you should already be signed in.
2. Dashboard "Resume Where You Left Off" → lands on your current LP unit
   (via `/programs/cloud-practitioner/resume`).
3. Catalog: Cloud Practitioner is Enrolled; the other three show Locked.
4. Read through Unit 1's items with "Go to Next Item" — rail dots fill,
   progress rises, the unit flips to Completed and awards points; Unit 2
   unlocks at 10 points.
5. The Knowledge Check unlocks after all readings; passing shows
   Competent/Verified (+5 points); failing twice records an escalation.
6. TTS bar: play/stop, voice + rate pickers (test in Chrome and Edge).
7. Set a unit deadline on the program page, complete the unit before the date,
   then `GET /api/integration/streak` shows `current: 1`.
