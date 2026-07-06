# Student Hub – My Profile (View 5) Behaviours

## 1. Page-Level Behaviours

- **Route & Access**
  - Path: `/profile`.
  - Accessible only to authenticated students whose email is on the approved list (Google Auth + admin-managed email whitelist).
  - If mandatory profile fields are missing, show inline warnings in relevant sections and optionally a top banner.

- **Loading & Error States**
  - On initial load, show skeleton placeholders for:
    - Student Information header.
    - Personal Information section.
    - Profile Preview panel.
    - MFA section.
  - If profile fetch fails:
    - Show non-blocking error message with a "Retry" action.
    - Keep Support CTA available.

---

## 2. Student Information Header

_Elements: avatar, full name, role/track, location, joined badge, privacy toggles._

- **Identity Display**
  - Show:
    - Avatar (photo).
    - Full name (derived from First Name + Last Name).
    - Role/track (e.g., "DevOps Student | Intermediate").
    - Location (city, country, flag) sourced from profile data.

- **Joined Badge Behaviour**
  - Shows `dateJoined` and tenure text.
  - Tenure text uses **second-person** language:
    - Example: `"You joined on 6/22/2025 – You have been in CHA for 1 year."`
    - Exact copy can be refined, but must say "you", not the user’s name.
  - Tenure computation:
    - Derived from `dateJoined` vs current date.
    - Rules for thresholds (months vs years) documented separately.

- **Privacy Toggles**
  - Toggles:
    - `Display Profile Photo to Public` (boolean).
    - `Display Country of Origin` (boolean).
  - Stored as explicit flags in the student record:
    - `profilePhotoPublic: boolean`.
    - `countryOfOriginPublic: boolean`.

- **Toggle Behaviour**
  - Toggling either switch opens a confirmation modal:
    - Modal copy explains what "public" means and where data will be shown/hidden.
    - Options: "Confirm" and "Cancel".
  - If confirmed:
    - Persist new flag value.
    - Update Profile Preview panel and all public surfaces accordingly.
  - If cancelled:
    - Toggle returns to previous value; no change persisted.

- **Where Public/Private Flags Apply**
  - If `profilePhotoPublic = false`:
    - Community platform (student-facing views) show a placeholder avatar instead of the photo.
    - Chats / messaging views show initials or placeholder, not the photo.
    - Leaderboard / ranking views hide the photo or use a non-photo icon.
  - If `countryOfOriginPublic = false`:
    - Community platform profile cards do not display country-of-origin.
    - Chats and user-hover cards do not show country-of-origin field.
    - Leaderboard / ranking views do not show country-of-origin badges.
  - Admin/staff-only views can still see full data (subject to RBAC) regardless of flags.

---

## 3. Personal Information Section

_Elements: First Name, Last Name, Timezone, Primary Email, Secondary Email, Country of Origin, Phone, Birth Date, Edit button._

- **Primary Email Behaviour**
  - Primary Email is **read-only** on this page.
  - Source of truth: Google Auth / identity provider.
  - Students cannot change the primary email via the Profile screen.
  - If a change is required, it must go through separate support/admin processes.

- **Edit Mode**
  - Clicking "Edit":
    - Switches section into editable state for allowed fields:
      - First Name.
      - Last Name.
      - Timezone.
      - Secondary Email Address.
      - Country of Origin.
      - Phone Number.
      - Birth Date.
    - Primary Email remains read-only even in edit mode.
    - Shows "Save" and "Cancel" controls.
  - "Cancel":
    - Reverts all fields to last saved values.
    - Returns section to read-only state.
  - "Save":
    - Runs validation for all editable fields.
    - On success: persists changes and returns to read-only.
    - On failure: shows inline errors and keeps section in edit mode.

- **Validation Rules**
  - First/Last Name:
    - Required.
    - May include basic alphabetic constraints per locale.
  - Timezone:
    - Required.
    - Must be selected from canonical timezone list (e.g., "Douala (GMT +1)").
  - Secondary Email:
    - Required or optional per policy (define explicitly).
    - Must be valid email format.
  - Country of Origin:
    - Required.
    - Selected from canonical country list.
  - Phone Number:
    - Valid phone format with country code.
    - Region-aware validation preferred (e.g., West/Central Africa patterns).
  - Birth Date:
    - Valid calendar date in `MM/DD/YY` format.
    - Age range constraints may apply (e.g., 10–80) if needed.

- **Legal Name Hint**
  - Attention note:
    - "Insert legal names only as per official documents: ID or Birth Certificate."
  - No additional behaviour, but conveys that admins may verify names against official docs.

---

## 4. Profile Preview Panel

_Elements: Change Photo action, avatar, name, role, location, country-of-origin, birth date, timezone, phone number, MFA Enabled._

- **Live Preview Behaviour**
  - Preview mirrors key fields:
    - Full name.
    - Role/track.
    - Location (city, country).
    - Country of Origin.
    - Date of Birth.
    - Timezone.
    - Phone Number.
    - MFA Enabled (True/False).
  - Updates triggered when:
    - Personal Information section changes are successfully saved.
    - MFA methods are added/disabled (MFA Enabled changes).
    - Privacy toggles are confirmed.

- **Change Photo Behaviour**
  - Clicking "Change Photo":
    - Opens file picker for avatar upload.
    - Accepts specific formats (e.g., JPG/PNG) and size limits.
    - (Optional) provides cropping/preview UI.
  - On successful upload:
    - New avatar saved to storage and linked in student record.
    - Header and Preview update instantly.
  - On failure:
    - Show error message (file too large, unsupported format, network error).

- **Interaction with Visibility Flags**
  - Preview is a **self-view**:
    - Shows full information regardless of visibility flags.
    - May indicate public vs private state for photo and country-of-origin:
      - Example: icon or small label "Hidden from public" when flags are off.
  - Public surfaces use the flags to decide what subset of Preview data to show.

---

## 5. Multi-Factor Authentication (MFA) Section

_Elements: Section title, tabs ("Multi-Factor", "Passkeys"), methods table, actions._

- **Policy: MFA Optional but Strongly Recommended**
  - MFA is **not mandatory**, but:
    - When disabled or not configured, show a recommendation banner/text on this section and/or in the Preview panel (e.g., "For better security, enable Multi-Factor Authentication").
  - Students can use the page without MFA, but the UX nudges them to enable it.

- **Tab Behaviour**
  - "Multi-Factor" tab:
    - Shows list of configured MFA methods (email-based, app-based, etc.).
  - "Passkeys" tab:
    - Shows registered passkeys (WebAuthn).
  - Tab selection:
    - Changes content within section.
    - Does not require full page reload.

- **Multi-Factor Methods Table**
  - Columns:
    - Method (e.g., Email, Authenticator App, SMS).
    - Transport (where codes go: email address, phone, etc.).
    - Identifier (short device label/code).
    - Last Used (date of last successful MFA authentication).
    - Action (e.g., "Disable").
  - Disable behaviour:
    - Clicking "Disable" opens confirmation modal explaining:
      - That MFA for this method will no longer be available.
      - That security may be reduced.
    - On confirm:
      - Method is deactivated.
      - Table updates to reflect that the method is disabled or removed.
    - If all methods are disabled:
      - `mfaEnabled` becomes `false`.
      - MFA recommendation banner is shown.

- **Passkeys Tab**
  - Shows:
    - Each registered passkey with device/label, registered date, last used, and "Remove" action.
  - "Add Passkey" flow (if present):
    - Initiates browser/WebAuthn registration.
    - On success: new passkey entry appears in list.
    - On failure: show error and allow retry.

- **MFA Enabled Flag**
  - Derived from:
    - Presence of at least one active MFA method.
    - Or explicit `mfaEnabled: boolean` updated when methods change.
  - Preview panel displays:
    - `MFA Enabled: True` if any method active.
    - `MFA Enabled: False` if none active.

- **Security Constraints**
  - Sensitive actions (Disable MFA method, Remove passkey) may require:
    - Recent authentication check (e.g., re-auth via Google or password).
    - MFA challenge if MFA is currently enabled.
  - All MFA-related actions are logged for audit.

---

## 6. Non-Functional & Cross-Cutting Behaviours

- **Authorization**
  - Only the logged-in student can edit their own profile via this UI.
  - Admin/staff make changes through separate admin tools.

- **Audit & Logging**
  - Log changes to:
    - Names.
    - Timezone.
    - Secondary Email.
    - Country of Origin.
    - Phone Number.
    - Birth Date.
    - Privacy flags (`profilePhotoPublic`, `countryOfOriginPublic`).
    - MFA methods and passkeys (add, disable, remove).
  - Each log entry includes:
    - Student ID.
    - Field(s) changed.
    - Old and new values (where appropriate).
    - Timestamp.
    - Actor (student vs admin).

- **Internationalization & Regional Support**
  - Timezone and country lists must support African contexts (correct offsets and country names).
  - Phone number validation supports international numbers, with emphasis on West/Central African formats.
