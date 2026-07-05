"use client";

import { Pencil } from "lucide-react";
import { Field, TextInput, SelectInput, cardClass } from "./fields";
import { TIMEZONES, COUNTRIES } from "../data/mock";

export type PersonalForm = {
  firstName: string;
  lastName: string;
  timezone: string;
  primaryEmail: string;
  secondaryEmail: string;
  country: string;
  phone: string;
  birthDate: string;
};

/**
 * Personal Information card — 3-column field grid. Fields are read-only
 * until "Edit" is pressed; pressing again ("Done") persists via the
 * parent's onSave (POST /api/profile).
 */
export default function PersonalInfo({
  form,
  editing,
  onEdit,
  onChange,
}: {
  form: PersonalForm;
  editing: boolean;
  onEdit: () => void;
  onChange: (field: keyof PersonalForm, value: string) => void;
}) {
  const ro = !editing;

  return (
    <div className={`flex flex-col gap-6 p-7 ${cardClass}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="whitespace-nowrap font-display text-[22px] font-bold text-cha-orange">
          Personal Information
        </h2>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-full bg-[#e7f2fe] px-4 py-2 text-sm font-semibold text-cha-blue transition hover:bg-[#d8ebfd] dark:bg-cha-blue/15 dark:hover:bg-cha-blue/25"
        >
          <Pencil size={15} /> {editing ? "Done" : "Edit"}
        </button>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="First Name" required hint="We'll never share this with anyone else">
          <TextInput value={form.firstName} disabled={ro} onChange={(v) => onChange("firstName", v)} />
        </Field>
        <Field label="Last Name" required>
          <TextInput value={form.lastName} disabled={ro} onChange={(v) => onChange("lastName", v)} />
        </Field>
        <Field label="Timezone" required>
          <SelectInput value={form.timezone} disabled={ro} onChange={(v) => onChange("timezone", v)} options={TIMEZONES} />
        </Field>

        <Field label="Primary Email Address" required>
          <TextInput type="email" value={form.primaryEmail} disabled={ro} onChange={(v) => onChange("primaryEmail", v)} />
        </Field>
        <Field label="Secondary Email Address">
          <TextInput type="email" value={form.secondaryEmail} disabled={ro} onChange={(v) => onChange("secondaryEmail", v)} />
        </Field>
        <Field label="Country of Origin" required>
          <SelectInput value={form.country} disabled={ro} onChange={(v) => onChange("country", v)} options={COUNTRIES} />
        </Field>

        <Field label="Phone Number" required>
          <TextInput
            type="tel"
            value={form.phone}
            disabled={ro}
            onChange={(v) => onChange("phone", v)}
            leading={<span className="text-[15px] leading-none">🇨🇲</span>}
          />
        </Field>
        <Field label="Birth Date" required>
          <TextInput value={form.birthDate} disabled={ro} placeholder="MM / DD / YY" onChange={(v) => onChange("birthDate", v)} />
        </Field>
        <div className="hidden xl:block" />
      </div>
    </div>
  );
}
