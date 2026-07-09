# Profile Page — Gap Analysis vs `profile.md`

**Scope:** `/profile` implementation in `student-hub/` vs. `docs/requirements/profile.md` (Student Hub – My Profile, View 5).
**First analysis:** 2026-07-06 (pre-implementation) · **Updated:** 2026-07-09 (post-implementation)

> **Status: gaps closed.** The remediation plan derived from the 2026-07-06 analysis was
> fully implemented and verified (build, lint, 32-assertion logic test, auth smoke test,
> plus a live manual session — login, save, avatar upload confirmed in `students.json`).
> This document now records the **current** requirement-by-requirement status.
> Deliberately deferred items are listed at the end.

---

## Part A — Architecture Today

| Piece | File | What it does |
|---|---|---|
| Route (server) | `student-hub/app/(student)/profile/page.tsx` | Auth check, loads student via `getStudent(email)`, builds `ProfileData` entirely from the student record + session (no mock fallbacks), renders client shell |
| Client shell | `.../profile/components/ProfileClient.tsx` | Owns draft-vs-saved form state, edit/save/cancel, privacy toggles (confirm-before-persist), MFA state, avatar, banners |
| Identity card | `.../components/IdentityCard.tsx` | Avatar, name, level, city/country, dynamic flag, privacy toggles (request-confirm pattern) |
| Personal info | `.../components/PersonalInfo.tsx` | Field grid; Edit → Save/Cancel; locked primary email; inline errors/warnings |
| MFA section | `.../components/MfaSection.tsx` | Multi-Factor / Passkeys tabs, methods table, passkey list, confirm modals, recommendation banner |
| Preview rail | `.../components/ProfilePreview.tsx` | Mirror of the **saved** profile; Change Photo upload; hidden-from-public pills; MFA row |
| Confirm modal | `.../components/ConfirmModal.tsx` | Shared HeroUI modal (primary/danger tones, busy state) |
| Field primitives | `.../components/fields.tsx` | `Field` (error/warning), `TextInput`/`SelectInput` (invalid state), `Toggle`, `cardClass` |
| Loading / error | `.../profile/loading.tsx`, `error.tsx` | Skeleton placeholders; Retry + Contact Support error state |
| Validation | `student-hub/lib/profile-schema.ts` | zod schemas shared client/server; strict partial update (unknown keys rejected) |
| Utilities | `lib/profile-utils.ts`, `lib/profile-options.ts` | Tenure/date/age helpers; 54 African countries + flags + dial codes; 17 timezones |
| Audit | `student-hub/lib/audit.ts` → `data/audit-log.json` | Append-only change log (actor, field diffs, timestamp); never fails the request |
| APIs | `app/api/profile/route.ts`, `.../avatar/route.ts`, `.../mfa/route.ts` | Validated profile save, avatar upload (type/size, local storage), simulated MFA actions |
| Persistence | `student-hub/lib/mock-api.ts` → `data/students.json` | JSON file; `normalize()` back-fills new fields; completion judged on merged record |
| Auth | `lib/auth.config.ts`, `proxy.ts` | NextAuth v5 + Google, email whitelist, middleware guards `/profile` |

---

## Part B — Requirement-by-Requirement Status

Legend: ✅ Done · ⚠️ Partial · ⏸ Deferred (agreed out of POC scope)

### 1. Page-Level Behaviours

| Requirement | Status | Detail |
|---|---|---|
| Route `/profile`, auth + whitelist | ✅ | Middleware guards the route; whitelist enforced at Google sign-in |
| Redirect for unauthenticated | ✅ | `redirect("/SignIn")` (previous `/invite` bug fixed); middleware also redirects |
| Skeleton placeholders on load | ✅ | `loading.tsx` with HeroUI Skeletons mirroring the page layout |
| Fetch-failure error + Retry + Support CTA | ✅ | `error.tsx` boundary: Retry (`reset()`) + `mailto:` support CTA |
| Inline warnings for missing mandatory fields | ✅ | Banner on load listing missing fields + per-field amber "Required — not yet provided" notes |

### 2. Student Information Header

| Requirement | Status | Detail |
|---|---|---|
| Avatar, full name | ✅ | Uploaded avatar → Google photo → initials fallback |
| Role/track from the record | ✅ | `student.track` (mock string removed) |
| Location with dynamic flag | ✅ | `countryFlag(country)` over all 54 African countries (🌍 fallback) |
| Joined badge with real date | ✅ | `formatJoinedDate(createdAt)` |
| Second-person tenure copy | ✅ | "You joined on {date}" / "You have been in CHA for **{tenure}**." computed from `createdAt` |
| Privacy toggles persisted | ✅ | `photoPublic` / `countryPublic` are typed `Student` fields; round-trip on reload |
| Confirmation modal on toggle | ✅ | `ConfirmModal` with per-kind/per-direction copy (community/chats/leaderboards, admin visibility) |
| Toggle persists immediately on confirm | ✅ | Single-flag POST on confirm; UI updates only on success |
| Flags applied to public surfaces | ⏸ | No community/chat/leaderboard surfaces exist yet; flags persist correctly for future use |

### 3. Personal Information Section

| Requirement | Status | Detail |
|---|---|---|
| Primary Email read-only always | ✅ | Always disabled, lock icon, "Managed by your Google account…" hint; excluded from the form payload |
| Edit mode for the allowed fields | ✅ | All seven editable fields (incl. timezone) included in the save payload |
| Separate Save and Cancel controls | ✅ | Edit → [Save \| Cancel]; Cancel restores the last-saved snapshot |
| Validation — names, email, timezone, country, phone, birth date | ✅ | Shared zod schema: Unicode name regex, `z.email()`, canonical timezone/country membership, `+<code>` phone pattern, MM/DD/YY birth date with calendar + age 10–80 checks; inline per-field errors; failed save stays in edit mode |
| Server-side validation | ✅ | `profileUpdateSchema` (strict) — unknown keys such as `status`/`track` rejected with 400 + field errors |
| Legal name hint | ✅ | "Insert legal names only as per official documents: ID or Birth Certificate." |

### 4. Profile Preview Panel

| Requirement | Status | Detail |
|---|---|---|
| Mirror of saved profile | ✅ | Renders `savedForm` (committed state), not the in-progress draft |
| MFA Enabled True/False | ✅ | Derived from persisted active MFA methods |
| Change Photo → picker → upload | ✅ | Hidden file input → client type/size check → `POST /api/profile/avatar` → local `public/uploads/avatars/` storage; previous file cleaned up |
| Upload validation + errors | ✅ | JPG/PNG only, ≤2 MB, client and server enforced; error banner on failure |
| Header + Preview update instantly | ✅ | Shared `avatarUrl` state updates both on success |
| "Hidden from public" indicators | ✅ | Amber pills on photo and country rows when the corresponding flag is off |

### 5. MFA Section

| Requirement | Status | Detail |
|---|---|---|
| Recommendation banner when disabled | ✅ | Amber "For better security, enable Multi-Factor Authentication." / green enabled state |
| Multi-Factor / Passkeys tabs | ✅ | HeroUI Tabs |
| Methods table (Method/Transport/Identifier/Last Used/Action) | ✅ | HeroUI Table; empty state with "Enable Email MFA" CTA |
| Disable → confirmation modal | ✅ | Danger-tone modal with security-reduction copy (also for passkey removal) |
| Passkeys list + Add/Remove | ✅ | Label auto-derived from browser/OS; simulated registration (no WebAuthn ceremony) |
| `mfaEnabled` derived + persisted | ✅ | Derived from active methods stored on the student record |
| Real OTP emails / WebAuthn | ⏸ | Simulated backend by agreed decision — no OTP delivery, no WebAuthn ceremonies |
| Re-auth for sensitive actions | ⏸ | Deferred with the simulated backend |
| MFA actions audit-logged | ✅ | `mfa.enable` / `mfa.disable` / `passkey.add` / `passkey.remove` entries |

### 6. Non-Functional & Cross-Cutting

| Requirement | Status | Detail |
|---|---|---|
| Only logged-in student edits own profile | ✅ | Student resolved from the session email in every API route |
| Audit logging (field diffs, actor, timestamp) | ✅ | `lib/audit.ts` → append-only `data/audit-log.json`; profile saves, privacy toggles, avatar, MFA |
| African timezone/country coverage | ✅ | 54 African countries (+ Other) with flags/dial codes; 17 GMT-offset timezones |
| Region-aware phone validation | ⚠️ | Generic `+<country code>` E.164-style pattern with dynamic flag; no per-country digit-length rules (would need libphonenumber) |

---

## Part C — Deferred Items (agreed scope decisions, 2026-07-06)

1. **Real MFA backend** — OTP email delivery and WebAuthn registration/authentication ceremonies; re-authentication before sensitive MFA actions. Current backend simulates method/passkey records only.
2. **Public surfaces consuming privacy flags** — community platform, chats, leaderboards do not exist yet; the flags persist and are ready for them.
3. **Cloud avatar storage** — uploads live in `student-hub/public/uploads/avatars/` (git-ignored); swap for object storage before real deployment.
4. **Per-country phone digit validation** — adopt `libphonenumber-js` if strict regional validation becomes a requirement.

## Implementation Decisions (confirmed 2026-07-06)

1. **MFA depth** — Full UI with simulated backend; `mfaEnabled` derived from active persisted methods.
2. **Avatar storage** — Local folder (`public/uploads/avatars/`), path in `student.avatarUrl`.
3. **Validation** — zod schemas shared by form and API; append-only JSON audit log via `lib/audit.ts`.
