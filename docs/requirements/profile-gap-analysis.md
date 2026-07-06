# Profile Page — Gap Analysis vs `profile.md`

**Scope:** Current `/profile` implementation in `student-hub/` vs. `docs/requirements/profile.md` (Student Hub – My Profile, View 5).
**Date:** 2026-07-06

---

## Part A — What Exists Today

The profile page is implemented and visually complete against the CHA design mock. The architecture:

| Piece | File | What it does |
|---|---|---|
| Route (server) | `student-hub/app/(student)/profile/page.tsx` | Auth check, loads student via `getStudent(email)`, merges real data over `mockProfile` fallbacks, renders client shell |
| Client shell | `.../profile/components/ProfileClient.tsx` | Owns all form state (`useState`), header + joined badge, error banner, save round-trip (POST `/api/profile`) |
| Identity card | `.../components/IdentityCard.tsx` | Avatar, name, level, city/country + the two privacy toggles |
| Personal info | `.../components/PersonalInfo.tsx` | 3-column field grid, Edit/Done button, 8 fields |
| MFA card | `.../components/MfaCard.tsx` | Static copy + one Enable/Disable button (local state only) |
| Preview rail | `.../components/ProfilePreview.tsx` | Live preview of name/role/location/DOB/timezone/phone/MFA + a "Change Photo" button (no handler) |
| Field primitives | `.../components/fields.tsx` | `Field`, `TextInput`, `SelectInput`, `Toggle`, `cardClass` (plain Tailwind, brand-styled) |
| Mock/fallback data | `.../profile/data/mock.ts` | `ProfileData` type, `TIMEZONES` (6), `COUNTRIES` (16), `mockProfile` fallback |
| API | `student-hub/app/api/profile/route.ts` | GET student / POST `updateStudentProfile` (session-gated, **no validation**) |
| Persistence | `student-hub/lib/mock-api.ts` → `data/students.json` | JSON file on disk; no database/ORM |
| Auth | `student-hub/lib/auth.config.ts`, `proxy.ts` | NextAuth v5 + Google, email whitelist (`approved-emails.json`), middleware guards `/profile` |

**The core problem is not missing UI — it's that several visible controls are wired to nothing (or to mock data):**

1. **Mock-data fallbacks leak into production view.** `page.tsx` merges the student record over `mockProfile`, but `timezone`, `mfaEnabled`, `joinedAt`, `yearsInCha`, `level`, `photoPublic`, `countryPublic` always come from the mock because the `Student` type doesn't carry them. Every student sees "Joined 6/22/2025 – 1 Year", level "DevOps Student | Intermediate".
2. **Saved values that never round-trip.** The privacy toggles ARE sent on save (`photoPublic`, `countryPublic`) and land in `students.json`, but on reload the page reads them from the mock — so they reset to `true` every visit. Same for `timezone`: editable in the form but **not even included in the save payload** — silently discarded.
3. **MFA is cosmetic.** One button flips a local `useState`. Nothing is persisted, no OTP email is ever sent (the copy claims one is), and the state resets to `false` (mock) on reload.
4. **"Change Photo" is a dead button** — no `onClick`, no upload API, no storage anywhere in the repo.
5. **Zero validation** — client or server. The API route passes the request body straight into the student record as `Partial<Student>`.

---

## Part B — Requirement-by-Requirement Status

Legend: ✅ Done · ⚠️ Partial · ❌ Missing

### 1. Page-Level Behaviours

| Requirement | Status | Detail |
|---|---|---|
| Route `/profile`, auth + whitelist | ✅ | Middleware (`proxy.ts`) guards the route; whitelist enforced at Google sign-in via `findApprovedEmail` |
| Redirect for unauthenticated | ⚠️ | `page.tsx:20` redirects to `/invite` — **a route that does not exist** (should be `/SignIn`). Latent bug; middleware usually catches first |
| Skeleton placeholders on load | ❌ | No `loading.tsx`, no Suspense, no skeleton components anywhere in the app |
| Fetch-failure error + Retry + Support CTA | ❌ | No error state for the initial profile load |
| Inline warnings for missing mandatory fields | ⚠️ | Only a single banner shown *after* a save attempt; no inline per-section warnings, nothing on initial load |

### 2. Student Information Header

| Requirement | Status | Detail |
|---|---|---|
| Avatar, full name | ✅ | HeroUI Avatar with Google photo / initials fallback |
| Role/track (e.g. "DevOps Student \| Intermediate") | ⚠️ | Displayed, but hardcoded mock string for all students; `Student.track` field exists but is unused here |
| Location (city, country, flag) | ⚠️ | City/country from record, but the flag is a **hardcoded 🇨🇲 emoji** regardless of country |
| Joined badge with real `dateJoined` | ❌ | Shows mock `"6/22/2025"` / `"1 Year"` for everyone; `Student` has no `dateJoined` (though `createdAt` exists and could serve) |
| Second-person tenure copy ("You joined on… You have been…") | ❌ | Current copy is third-person: `"{firstName} is {yearsInCha} Old in CHA"` — explicitly violates the spec |
| Tenure computed from `dateJoined` vs today | ❌ | No computation; static mock string |
| Privacy toggles exist | ⚠️ | Both toggles render and are sent on save, BUT: values reset to mock `true` on reload (never read back); flags are **not declared in the `Student` type** (untyped drift in `students.json`) |
| Confirmation modal on toggle | ❌ | Toggles flip instantly, no Confirm/Cancel modal, no explanation copy |
| Toggle persists immediately on confirm | ❌ | Only persists if the user also happens to go through Edit → Done on Personal Info |
| Flags applied to public surfaces (community/chat/leaderboard) | ❌ | No such surfaces exist yet; nothing consumes the flags. (Out of this page's scope, but flags must persist correctly so future surfaces can use them) |

### 3. Personal Information Section

| Requirement | Status | Detail |
|---|---|---|
| Primary Email **read-only always** | ❌ | It becomes editable in edit mode (`PersonalInfo.tsx:61-63`). Edits are silently discarded (not in the save payload) — worse than read-only: user thinks they changed it |
| Edit mode for the 7 allowed fields | ⚠️ | Edit/Done toggle exists and fields unlock, but **Timezone edits are silently discarded** (not in payload, not in `Student` type) |
| Separate "Save" and "Cancel" controls | ❌ | Single Edit/Done button; "Done" always saves. **No way to cancel/revert** to last saved values |
| Validation — required names | ❌ | None (only a post-save "fill in required fields" warning banner) |
| Validation — canonical timezone | ⚠️ | Select limits choices to 6 hardcoded timezones; no server-side check |
| Validation — secondary email format | ❌ | None (client or server) |
| Validation — canonical country | ⚠️ | Select limits to 16 countries + "Other"; no server-side check |
| Validation — phone format w/ country code, region-aware | ❌ | Free-text input; hardcoded 🇨🇲 prefix icon only |
| Validation — birth date MM/DD/YY, age range | ❌ | Plain text input with placeholder; any string accepted |
| Server-side validation | ❌ | `POST /api/profile` accepts arbitrary `Partial<Student>` — a client could overwrite `status`, `track`, etc. (only `email`/`id`/`approvedEmailId` are protected) |
| Legal name hint ("Insert legal names only…") | ❌ | Current hint says "We'll never share this with anyone else". Also, save silently sets `legalName = firstName + lastName` — no user awareness |

### 4. Profile Preview Panel

| Requirement | Status | Detail |
|---|---|---|
| Live mirror of name/role/location/country/DOB/timezone/phone | ✅ | Reads live from form state; updates as you type |
| MFA Enabled True/False display | ⚠️ | Displays the local toggle, but since MFA state is never persisted it is always the mock value (`False`) after reload |
| Updates on save / MFA change / toggle confirm | ⚠️ | Updates on local state change (fine), but underlying persistence gaps above make it lie after reload |
| "Change Photo" → file picker → upload | ❌ | Button has **no onClick handler**. No upload API route, no storage integration, no write path for `avatarUrl` |
| Format/size validation, error messages on upload | ❌ | N/A — no upload exists |
| Header + Preview update instantly after upload | ❌ | N/A |
| "Hidden from public" indicators when flags are off | ❌ | No indication of public/private state in the preview |

### 5. MFA Section

| Requirement | Status | Detail |
|---|---|---|
| MFA optional + recommendation banner when disabled | ⚠️ | Card copy changes when disabled, but it's descriptive ("…will not be sent"), not a recommendation banner; nothing in the Preview panel |
| "Multi-Factor" / "Passkeys" tabs | ❌ | No tabs — single static card |
| Methods table (Method, Transport, Identifier, Last Used, Action) | ❌ | No table, no concept of MFA methods |
| Disable → confirmation modal | ❌ | Button flips state instantly |
| Passkeys list (device, registered, last used, Remove) | ❌ | Nothing WebAuthn/passkey-related exists anywhere in the repo |
| Add Passkey (WebAuthn registration) | ❌ | — |
| `mfaEnabled` derived from active methods / persisted | ❌ | Client-only `useState`; never persisted; resets on reload |
| Re-auth for sensitive actions | ❌ | — |
| MFA actions audit-logged | ❌ | — |

### 6. Non-Functional & Cross-Cutting

| Requirement | Status | Detail |
|---|---|---|
| Only logged-in student edits own profile | ✅ | API resolves the student from the session email; no way to touch another record |
| Audit logging (all field changes, old/new, actor, timestamp) | ❌ | No logging infrastructure at all; only `updatedAt` timestamps |
| African timezone/country coverage | ⚠️ | 6 timezones / 16 countries hardcoded — a start, not canonical lists |
| Region-aware phone validation | ❌ | None |

### Data-Layer Gaps (root cause of most ⚠️/❌ above)

`Student` type (`student-hub/types/index.ts`) is missing: `timezone`, `photoPublic`, `countryOfOriginPublic`, `mfaEnabled` (or an MFA-methods collection), `dateJoined` (can derive from `createdAt`). Additionally `data/students.json` has drifted — it contains untyped keys (`photoPublic`, `timezone`, `firstName`, snake_case duplicates) written by earlier saves, and the existing record is missing `id`, `approvedEmailId`, `status`, `createdAt`, and `profileCompletedAt`.

---

## Part C — Summary of What Has NOT Been Done

**Broken/misleading (fix first):**
1. Privacy toggles, timezone, and MFA state don't survive reload (mock fallbacks win over saved data).
2. Primary Email appears editable but edits are thrown away.
3. Timezone appears editable but edits are thrown away.
4. "Change Photo" button does nothing.
5. `redirect("/invite")` targets a nonexistent route.
6. API accepts unvalidated arbitrary fields.

**Missing behaviours:**
7. Toggle confirmation modals + immediate persistence.
8. Save/Cancel edit controls (cancel-revert).
9. All field validation (client + server).
10. Second-person tenure copy computed from a real join date.
11. Dynamic country flag.
12. Real role/track from the student record.
13. Avatar upload (picker, validation, storage, API).
14. "Hidden from public" indicators in Preview.
15. MFA tabs, methods table, passkeys, confirmation modals, persisted/derived `mfaEnabled`, recommendation banner.
16. Skeleton loading states; fetch-error state with Retry.
17. Inline missing-mandatory-field warnings on load.
18. Audit logging.
19. Legal-name hint copy.
20. Expanded canonical timezone/country lists; region-aware phone validation.

---

## Implementation Decisions (confirmed 2026-07-06)

1. **MFA depth** — Full UI with simulated backend: tabs, methods table, passkey list, confirmation modals; MFA method records persisted in the student data file; `mfaEnabled` derived from active methods. No real OTP emails or WebAuthn ceremonies yet.
2. **Avatar storage** — Local folder (`student-hub/public/uploads/avatars/`), path stored in `student.avatarUrl`. Swap for cloud storage before real deployment.
3. **Validation** — `zod` schemas shared by the form (inline errors) and `POST /api/profile` (reject invalid payloads). Audit log: append-only `data/audit-log.json` via `lib/audit.ts`.
