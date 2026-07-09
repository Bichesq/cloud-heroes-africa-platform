"use client";

import { Check, Lock, Pencil, TriangleAlert, X } from "lucide-react";
import { COUNTRIES, TIMEZONES, countryFlag } from "@/lib/profile-options";
import { Field, TextInput, SelectInput, cardClass } from "./fields";

export type PersonalForm = {
  firstName: string;
  lastName: string;
  displayName: string;
  timezone: string;
  secondaryEmail: string;
  country: string;
  phone: string;
  birthDate: string;
};

/**
 * Personal Information card — 3-column field grid. Read-only until "Edit"
 * is pressed; "Save" validates + persists, "Cancel" reverts to the last
 * saved values. Primary Email is never editable (sourced from Google Auth).
 */
export default function PersonalInfo({
  form,
  primaryEmail,
  editing,
  saving,
  errors,
  warnings,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: {
  form: PersonalForm;
  primaryEmail: string;
  editing: boolean;
  saving: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof PersonalForm, value: string) => void;
}) {
  const ro = !editing || saving;

  return (
    <div className={`flex flex-col gap-6 p-7 ${cardClass}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="whitespace-nowrap font-display text-[22px] font-bold text-cha-orange">
          Personal Information
        </h2>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-cha-muted transition hover:bg-cha-surface-2 disabled:opacity-50"
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-full bg-cha-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-cha-blue/90 disabled:opacity-60"
            >
              <Check size={15} /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-full bg-[#e7f2fe] px-4 py-2 text-sm font-semibold text-cha-blue transition hover:bg-[#d8ebfd] dark:bg-cha-blue/15 dark:hover:bg-cha-blue/25"
          >
            <Pencil size={15} /> Edit
          </button>
        )}
      </div>

      <p className="-mt-3 flex items-center gap-1.5 text-[12.5px] font-medium text-amber-600 dark:text-amber-400">
        <TriangleAlert size={14} className="shrink-0" />
        Insert legal names only as per official documents: ID or Birth Certificate.
      </p>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="First Name" required error={errors.firstName} warning={warnings.firstName}>
          <TextInput
            value={form.firstName}
            disabled={ro}
            invalid={!!errors.firstName}
            onChange={(v) => onChange("firstName", v)}
          />
        </Field>
        <Field label="Last Name" required error={errors.lastName} warning={warnings.lastName}>
          <TextInput
            value={form.lastName}
            disabled={ro}
            invalid={!!errors.lastName}
            onChange={(v) => onChange("lastName", v)}
          />
        </Field>
        <Field
          label="Preferred Display Name"
          error={errors.displayName}
          hint="Shown in your dashboard greeting instead of your first name."
        >
          <TextInput
            value={form.displayName}
            disabled={ro}
            invalid={!!errors.displayName}
            onChange={(v) => onChange("displayName", v)}
          />
        </Field>

        <Field label="Timezone" required error={errors.timezone} warning={warnings.timezone}>
          <SelectInput
            value={form.timezone}
            disabled={ro}
            invalid={!!errors.timezone}
            onChange={(v) => onChange("timezone", v)}
            options={TIMEZONES}
          />
        </Field>
        <Field
          label="Primary Email Address"
          required
          hint="Managed by your Google account — contact support to change it."
        >
          <TextInput
            type="email"
            value={primaryEmail}
            disabled
            leading={<Lock size={14} className="text-cha-faint" />}
            onChange={() => {}}
          />
        </Field>

        <Field label="Secondary Email Address" error={errors.secondaryEmail}>
          <TextInput
            type="email"
            value={form.secondaryEmail}
            disabled={ro}
            invalid={!!errors.secondaryEmail}
            onChange={(v) => onChange("secondaryEmail", v)}
          />
        </Field>
        <Field label="Country of Origin" required error={errors.country} warning={warnings.country}>
          <SelectInput
            value={form.country}
            disabled={ro}
            invalid={!!errors.country}
            onChange={(v) => onChange("country", v)}
            options={COUNTRIES}
          />
        </Field>
        <Field label="Phone Number" required error={errors.phone} warning={warnings.phone}>
          <TextInput
            type="tel"
            value={form.phone}
            disabled={ro}
            invalid={!!errors.phone}
            placeholder="+237 673 194 627"
            onChange={(v) => onChange("phone", v)}
            leading={<span className="text-[15px] leading-none">{countryFlag(form.country)}</span>}
          />
        </Field>

        <Field label="Birth Date" required error={errors.birthDate} warning={warnings.birthDate}>
          <TextInput
            value={form.birthDate}
            disabled={ro}
            invalid={!!errors.birthDate}
            placeholder="MM / DD / YY"
            onChange={(v) => onChange("birthDate", v)}
          />
        </Field>
      </div>
    </div>
  );
}
