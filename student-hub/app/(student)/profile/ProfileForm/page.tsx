"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Student } from "@/types";

type Props = {
  defaultValues: Partial<Student>;
};

const COUNTRIES = [
  "Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia",
  "Tanzania", "Uganda", "Rwanda", "Cameroon", "Senegal",
  "Côte d'Ivoire", "Zimbabwe", "Zambia", "Mozambique", "Angola",
  "Other",
];

export default function ProfileForm({ defaultValues }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<Student>>({
    legal_name: "",
    display_name: "",
    phone: "",
    alternate_email: "",
    birth_date: "",
    city: "",
    country: "",
    ...defaultValues,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: keyof Student, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.city || !form.country || !form.legal_name || !form.birth_date) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save profile.");

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Identity — pre-filled from Google, read-only */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Identity
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name">
            <input
              type="text"
              value={form.given_name ?? ""}
              disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </Field>
          <Field label="Last name">
            <input
              type="text"
              value={form.family_name ?? ""}
              disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Email">
            <input
              type="email"
              value={form.email ?? ""}
              disabled
              className="input bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </Field>
        </div>
      </section>

      {/* Legal & preferred name */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Name details
        </h2>
        <div className="flex flex-col gap-4">
          <Field label="Legal name *" hint="Full name as it appears on your ID">
            <input
              type="text"
              value={form.legal_name ?? ""}
              onChange={(e) => update("legal_name", e.target.value)}
              placeholder="e.g. Amara Kwame Osei"
              className="input"
              required
            />
          </Field>
          <Field
            label="Preferred name"
            hint="What you'd like to be called — TODO: policy not yet settled"
          >
            <input
              type="text"
              value={form.display_name ?? ""}
              onChange={(e) => update("display_name", e.target.value)}
              placeholder="e.g. AK"
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Contact
        </h2>
        <div className="flex flex-col gap-4">
          <Field label="Phone number" hint="Include country code, e.g. +234 801 234 5678">
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+234 801 234 5678"
              className="input"
            />
          </Field>
          <Field label="Alternate email" hint="Optional backup email address">
            <input
              type="email"
              value={form.alternate_email ?? ""}
              onChange={(e) => update("alternate_email", e.target.value)}
              placeholder="backup@example.com"
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Personal details */}
      <section>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Personal details
        </h2>
        <div className="flex flex-col gap-4">
          <Field label="Date of birth *">
            <input
              type="date"
              value={form.birth_date ?? ""}
              onChange={(e) => update("birth_date", e.target.value)}
              className="input"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City *">
              <input
                type="text"
                value={form.city ?? ""}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Accra"
                className="input"
                required
              />
            </Field>
            <Field label="Country *">
              <select
                value={form.country ?? ""}
                onChange={(e) => update("country", e.target.value)}
                className="input"
                required
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save and continue →"}
      </button>
    </form>
  );
}

// Small helper to keep field markup DRY
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}