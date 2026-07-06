import type { MfaMethod } from "@/types";

/* Client-safe helpers shared by the profile UI and the profile API. */

export function isMfaEnabled(methods: MfaMethod[] | undefined | null): boolean {
  return methods?.some((m) => m.active) ?? false;
}

/** "2025-06-22T00:00:00.000Z" → "6/22/2025" (no timezone surprises: parses the date part only). */
export function formatJoinedDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${m}/${d}/${y}`;
}

/**
 * Second-person tenure text derived from the join date vs today.
 * < 1 month → "less than a month"; < 12 months → "N month(s)"; else "N year(s)".
 */
export function tenureText(dateJoinedIso: string, now: Date = new Date()): string {
  const joined = new Date(dateJoinedIso);
  if (isNaN(joined.getTime()) || joined > now) return "less than a month";

  let months =
    (now.getFullYear() - joined.getFullYear()) * 12 +
    (now.getMonth() - joined.getMonth());
  if (now.getDate() < joined.getDate()) months -= 1;

  if (months < 1) return "less than a month";
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "year" : "years"}`;
}

/** ISO date ("1983-01-22") → form display "01/22/83". */
export function isoToMdy(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return "";
  return `${m}/${d}/${y.slice(2)}`;
}

/**
 * Form input "MM/DD/YY" (also accepts M/D/YY, MM/DD/YYYY, spaces around
 * slashes) → ISO date, or null when not a real calendar date.
 * Two-digit years pivot on the current year: 00..<yy now> → 2000s, else 1900s.
 */
export function mdyToIso(mdy: string, now: Date = new Date()): string | null {
  const match = mdy.trim().match(/^(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  let year = Number(match[3]);
  if (match[3].length === 2) {
    const pivot = now.getFullYear() % 100;
    year += year <= pivot ? 2000 : 1900;
  }

  if (month < 1 || month > 12) return null;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return null;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Full years since an ISO birth date. */
export function ageFromIso(iso: string, now: Date = new Date()): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) {
    age -= 1;
  }
  return age;
}
