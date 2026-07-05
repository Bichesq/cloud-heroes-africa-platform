"use client";

/* Small presentational primitives shared across the profile cards.
 * Styled with plain Tailwind so the brand field look (1px zinc border,
 * 12px radius, blue focus ring) is exact — HeroUI's Input/Select/Switch
 * defaults would need overrides to match, and its Switch would paint the
 * brand-orange accent where the design uses electric blue. */

import type { ReactNode } from "react";

export const cardClass =
  "rounded-3xl bg-cha-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.4)]";

const fieldClass =
  "h-11 w-full rounded-xl border border-cha-border bg-cha-surface px-3.5 text-sm text-cha-ink " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none transition " +
  "placeholder:text-cha-faint focus:border-cha-blue focus:ring-4 focus:ring-cha-blue/15 " +
  "disabled:bg-cha-surface-2 disabled:text-cha-muted";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-cha-muted">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[11.5px] text-cha-faint">{hint}</p>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  disabled,
  placeholder,
  leading,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  leading?: ReactNode;
  type?: string;
}) {
  if (leading) {
    return (
      <div
        className={
          "flex h-11 w-full items-center gap-2 rounded-xl border border-cha-border bg-cha-surface px-3.5 " +
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition focus-within:border-cha-blue focus-within:ring-4 focus-within:ring-cha-blue/15 " +
          (disabled ? "bg-cha-surface-2" : "")
        }
      >
        <span className="shrink-0">{leading}</span>
        <input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-cha-ink outline-none placeholder:text-cha-faint"
        />
      </div>
    );
  }
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClass}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  disabled,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={
          fieldClass +
          " cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed"
        }
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cha-faint"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

/** Blue pill toggle matching the design's visibility switches. */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-cha-muted">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors ${
          checked ? "bg-cha-blue" : "bg-cha-border"
        }`}
      >
        <span
          className={`absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-all ${
            checked ? "left-[23px]" : "left-[3px]"
          }`}
        />
      </button>
      {label}
    </label>
  );
}
