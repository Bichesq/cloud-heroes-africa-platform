"use client";

import { useState } from "react";
import Link from "next/link";
import { PanelLeft, Users } from "lucide-react";
import IdentityCard from "./IdentityCard";
import PersonalInfo, { type PersonalForm } from "./PersonalInfo";
import MfaCard from "./MfaCard";
import ProfilePreview from "./ProfilePreview";
import type { ProfileData } from "../data/mock";

/**
 * Client shell for the profile page. Owns the editable form state, the
 * two visibility toggles, the MFA flag, and the save round-trip. The
 * layout is a content column + a 340px "Profile Preview" rail, matching
 * the approved "My Profile" mock.
 */
export default function ProfileClient({ data }: { data: ProfileData }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoPublic, setPhotoPublic] = useState(data.photoPublic);
  const [countryPublic, setCountryPublic] = useState(data.countryPublic);
  const [mfaEnabled, setMfaEnabled] = useState(data.mfaEnabled);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<PersonalForm>({
    firstName: data.firstName,
    lastName: data.lastName,
    timezone: data.timezone,
    primaryEmail: data.primaryEmail,
    secondaryEmail: data.secondaryEmail,
    country: data.country,
    phone: data.phone,
    birthDate: data.birthDate,
  });

  function change(field: keyof PersonalForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleEdit() {
    // Toggling out of edit mode persists the form.
    if (editing) {
      // Map form fields onto the Student schema and include the fields the
      // completion gate checks (legalName, city, country, birthDate, phone).
      // `city` isn't in the editable form, so pass it through from `data`.
      const payload = {
        givenName: form.firstName,
        familyName: form.lastName,
        legalName: `${form.firstName} ${form.lastName}`.trim(),
        alternateEmail: form.secondaryEmail,
        phone: form.phone,
        birthDate: form.birthDate,
        city: data.city,
        country: form.country,
        photoPublic,
        countryPublic,
      };

      // The dashboard is gated on a completed profile — warn (but still save)
      // if a required field the gate checks is missing, so the user isn't
      // silently stuck on this page.
      const missing =
        !payload.legalName.trim() ||
        !payload.city ||
        !payload.country ||
        !payload.birthDate ||
        !payload.phone;

      setSaving(true);
      setError(null);
      try {
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("save failed");
        if (missing) {
          setError(
            "Saved, but fill in all required fields (name, country, phone, birth date) to unlock the dashboard."
          );
        }
      } catch {
        setError("Couldn't save your profile. Please try again.");
        setSaving(false);
        return; // stay in edit mode so changes aren't lost
      } finally {
        setSaving(false);
      }
    } else {
      setError(null);
    }
    setEditing((v) => !v);
  }

  const fullName = `${form.firstName} ${form.lastName}`.trim();

  return (
    <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* Content column */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <Link
              href="/dashboard"
              className="mt-1.5 grid h-[34px] w-[34px] place-items-center rounded-full bg-cha-surface text-cha-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-cha-surface-2"
              aria-label="Back to dashboard"
            >
              <PanelLeft size={18} />
            </Link>
            <div>
              <h1 className="whitespace-nowrap font-display text-[40px] font-extrabold leading-[1.1]">
                My Profile
              </h1>
              <div className="mt-2 text-[19px] font-semibold text-cha-muted">
                Student Information
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 rounded-2xl bg-cha-ocean px-[18px] py-3.5 text-white shadow-[0_10px_24px_rgba(50,167,212,0.32)]">
            <Users size={18} className="opacity-95" />
            <div className="leading-snug">
              <div className="text-[13.5px] font-bold">Date Joined: {data.joinedAt}</div>
              <div className="text-[13px] opacity-90">
                {data.firstName} is <strong>{data.yearsInCha}</strong> Old in CHA
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="status"
            className="rounded-2xl border border-cha-orange/30 bg-cha-orange/10 px-4 py-3 text-sm font-medium text-cha-orange"
          >
            {error}
          </div>
        )}

        <IdentityCard
          data={data}
          fullName={fullName}
          photoPublic={photoPublic}
          countryPublic={countryPublic}
          onPhotoPublic={setPhotoPublic}
          onCountryPublic={setCountryPublic}
        />

        <PersonalInfo
          form={form}
          editing={editing && !saving}
          onEdit={handleEdit}
          onChange={change}
        />

        <MfaCard enabled={mfaEnabled} onToggle={() => setMfaEnabled((v) => !v)} />
      </div>

      {/* Preview rail */}
      <ProfilePreview data={{ ...data, mfaEnabled }} form={form} />
    </div>
  );
}
