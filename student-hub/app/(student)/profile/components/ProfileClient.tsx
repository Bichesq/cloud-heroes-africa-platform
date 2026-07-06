"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import IdentityCard, { type ToggleKind } from "./IdentityCard";
import PersonalInfo, { type PersonalForm } from "./PersonalInfo";
import MfaSection from "./MfaSection";
import ProfilePreview from "./ProfilePreview";
import ConfirmModal from "./ConfirmModal";
import type { ProfileData } from "../types";
import { fieldErrors as zodFieldErrors, profileFormSchema } from "@/lib/profile-schema";
import { formatJoinedDate, isMfaEnabled, tenureText } from "@/lib/profile-utils";

const REQUIRED_FIELDS: { key: keyof PersonalForm; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "country", label: "Country of Origin" },
  { key: "phone", label: "Phone Number" },
  { key: "birthDate", label: "Birth Date" },
];

type Banner = { tone: "error" | "warning" | "success"; text: string };

function missingFields(form: PersonalForm) {
  return REQUIRED_FIELDS.filter(({ key }) => !form[key].trim());
}

function missingBanner(form: PersonalForm): Banner | null {
  const missing = missingFields(form);
  if (missing.length === 0) return null;
  return {
    tone: "warning",
    text: `Your profile is incomplete — please add: ${missing
      .map((m) => m.label)
      .join(", ")}. A complete profile unlocks the dashboard.`,
  };
}

const BANNER_STYLES: Record<Banner["tone"], string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

/**
 * Client shell for the profile page. Owns the draft form (edit/save/cancel),
 * the privacy toggles (confirm-before-persist), the MFA method/passkey state,
 * and the avatar. `savedForm` is the last persisted state — header and
 * preview render from it; `form` is the in-progress draft.
 */
export default function ProfileClient({ data }: { data: ProfileData }) {
  const initialForm: PersonalForm = {
    firstName: data.firstName,
    lastName: data.lastName,
    timezone: data.timezone,
    secondaryEmail: data.secondaryEmail,
    country: data.country,
    phone: data.phone,
    birthDate: data.birthDate,
  };

  const [savedForm, setSavedForm] = useState(initialForm);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<Banner | null>(() => missingBanner(initialForm));

  const [photoPublic, setPhotoPublic] = useState(data.photoPublic);
  const [countryPublic, setCountryPublic] = useState(data.countryPublic);
  const [pendingToggle, setPendingToggle] = useState<{
    kind: ToggleKind;
    next: boolean;
  } | null>(null);
  const [toggleSaving, setToggleSaving] = useState(false);

  const [mfaMethods, setMfaMethods] = useState(data.mfaMethods);
  const [passkeys, setPasskeys] = useState(data.passkeys);
  const [mfaBusy, setMfaBusy] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl);

  const fullName = `${savedForm.firstName} ${savedForm.lastName}`.trim();
  const mfaEnabled = isMfaEnabled(mfaMethods);
  // Inline per-field warnings for missing mandatory data (read-only view).
  const warnings = editing
    ? {}
    : Object.fromEntries(
        missingFields(savedForm).map(({ key }) => [key, "Required — not yet provided"])
      );

  function change(field: keyof PersonalForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function startEdit() {
    setEditing(true);
    setBanner(null);
  }

  function cancelEdit() {
    setForm(savedForm);
    setErrors({});
    setEditing(false);
    setBanner(missingBanner(savedForm));
  }

  async function save() {
    const parsed = profileFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed));
      setBanner({ tone: "error", text: "Please fix the highlighted fields." });
      return;
    }

    setSaving(true);
    setErrors({});
    setBanner(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        if (json?.fieldErrors) setErrors(json.fieldErrors);
        setBanner({
          tone: "error",
          text: json?.fieldErrors
            ? "Please fix the highlighted fields."
            : "Couldn't save your profile. Please try again.",
        });
        return; // stay in edit mode so changes aren't lost
      }
      setSavedForm(form);
      setEditing(false);
      setBanner({ tone: "success", text: "Profile saved." });
    } catch {
      setBanner({ tone: "error", text: "Couldn't save your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function confirmToggle() {
    if (!pendingToggle) return;
    const { kind, next } = pendingToggle;
    const payload = kind === "photo" ? { photoPublic: next } : { countryPublic: next };

    setToggleSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("toggle save failed");
      if (kind === "photo") setPhotoPublic(next);
      else setCountryPublic(next);
    } catch {
      setBanner({
        tone: "error",
        text: "Couldn't update your privacy setting. Please try again.",
      });
    } finally {
      setToggleSaving(false);
      setPendingToggle(null);
    }
  }

  async function mfaAction(payload: Record<string, string>): Promise<boolean> {
    setMfaBusy(true);
    try {
      const res = await fetch("/api/profile/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.student) {
        setBanner({
          tone: "error",
          text: json?.error ?? "Couldn't update MFA settings. Please try again.",
        });
        return false;
      }
      setMfaMethods(json.student.mfaMethods);
      setPasskeys(json.student.passkeys);
      return true;
    } catch {
      setBanner({ tone: "error", text: "Couldn't update MFA settings. Please try again." });
      return false;
    } finally {
      setMfaBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Content column */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-5">
          <div>
            <h1 className="whitespace-nowrap font-display text-[40px] font-extrabold leading-[1.1]">
              My Profile
            </h1>
            <div className="mt-2 text-[19px] font-semibold text-cha-muted">
              Student Information
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-cha-ocean px-[18px] py-3.5 text-white shadow-[0_10px_24px_rgba(50,167,212,0.32)]">
            <Users size={18} className="opacity-95" />
            <div className="leading-snug">
              <div className="text-[13.5px] font-bold">
                You joined on {formatJoinedDate(data.dateJoined)}
              </div>
              <div className="text-[13px] opacity-90">
                You have been in CHA for <strong>{tenureText(data.dateJoined)}</strong>.
              </div>
            </div>
          </div>
        </div>

        {banner && (
          <div
            role="status"
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${BANNER_STYLES[banner.tone]}`}
          >
            {banner.text}
          </div>
        )}

        <IdentityCard
          fullName={fullName}
          level={data.level}
          city={data.city}
          country={savedForm.country}
          avatarUrl={avatarUrl}
          photoPublic={photoPublic}
          countryPublic={countryPublic}
          onRequestToggle={(kind, next) => setPendingToggle({ kind, next })}
        />

        <PersonalInfo
          form={form}
          primaryEmail={data.primaryEmail}
          editing={editing}
          saving={saving}
          errors={errors}
          warnings={warnings}
          onEdit={startEdit}
          onSave={() => void save()}
          onCancel={cancelEdit}
          onChange={change}
        />

        <MfaSection
          methods={mfaMethods}
          passkeys={passkeys}
          busy={mfaBusy}
          onAddEmailMethod={() => mfaAction({ action: "add-email-method" })}
          onDisableMethod={(id) => mfaAction({ action: "disable-method", id })}
          onAddPasskey={(label) => mfaAction({ action: "add-passkey", label })}
          onRemovePasskey={(id) => mfaAction({ action: "remove-passkey", id })}
        />
      </div>

      {/* Preview rail — self-view of the saved profile */}
      <ProfilePreview
        form={savedForm}
        city={data.city}
        level={data.level}
        avatarUrl={avatarUrl}
        mfaEnabled={mfaEnabled}
        photoPublic={photoPublic}
        countryPublic={countryPublic}
        onAvatarChange={setAvatarUrl}
        onUploadError={(text) => setBanner({ tone: "error", text })}
      />

      {/* Privacy toggle confirmation */}
      <ConfirmModal
        open={pendingToggle !== null}
        onOpenChange={(open) => !open && setPendingToggle(null)}
        title={
          pendingToggle?.kind === "photo"
            ? pendingToggle.next
              ? "Show your photo publicly?"
              : "Hide your photo from public?"
            : pendingToggle?.next
              ? "Show your country of origin publicly?"
              : "Hide your country of origin?"
        }
        confirmLabel="Confirm"
        busy={toggleSaving}
        onConfirm={() => void confirmToggle()}
      >
        {pendingToggle?.kind === "photo" ? (
          pendingToggle.next ? (
            <>
              Your profile photo will be visible to other students across the
              community platform, chats and leaderboards.
            </>
          ) : (
            <>
              Other students will see a placeholder with your initials instead
              of your photo on the community platform, in chats and on
              leaderboards. Admins and staff can still see it.
            </>
          )
        ) : pendingToggle?.next ? (
          <>
            Your country of origin will be visible on your public profile card,
            in chats and on leaderboards.
          </>
        ) : (
          <>
            Your country of origin will be hidden from public profile cards,
            chats and leaderboards. Admins and staff can still see it.
          </>
        )}
      </ConfirmModal>
    </div>
  );
}
