/* Canonical option lists for the profile form. Client-safe (no Node APIs);
 * imported by both the form UI and the server-side zod schemas so the same
 * lists validate on both ends. */

export type CountryOption = {
  name: string;
  flag: string;
  dial: string; // international dialing code, e.g. "+237"
};

/** All 54 African countries (requirements emphasise African coverage), plus "Other". */
export const COUNTRY_OPTIONS: CountryOption[] = [
  { name: "Algeria", flag: "🇩🇿", dial: "+213" },
  { name: "Angola", flag: "🇦🇴", dial: "+244" },
  { name: "Benin", flag: "🇧🇯", dial: "+229" },
  { name: "Botswana", flag: "🇧🇼", dial: "+267" },
  { name: "Burkina Faso", flag: "🇧🇫", dial: "+226" },
  { name: "Burundi", flag: "🇧🇮", dial: "+257" },
  { name: "Cabo Verde", flag: "🇨🇻", dial: "+238" },
  { name: "Cameroon", flag: "🇨🇲", dial: "+237" },
  { name: "Central African Republic", flag: "🇨🇫", dial: "+236" },
  { name: "Chad", flag: "🇹🇩", dial: "+235" },
  { name: "Comoros", flag: "🇰🇲", dial: "+269" },
  { name: "Congo (Republic)", flag: "🇨🇬", dial: "+242" },
  { name: "Congo (DRC)", flag: "🇨🇩", dial: "+243" },
  { name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225" },
  { name: "Djibouti", flag: "🇩🇯", dial: "+253" },
  { name: "Egypt", flag: "🇪🇬", dial: "+20" },
  { name: "Equatorial Guinea", flag: "🇬🇶", dial: "+240" },
  { name: "Eritrea", flag: "🇪🇷", dial: "+291" },
  { name: "Eswatini", flag: "🇸🇿", dial: "+268" },
  { name: "Ethiopia", flag: "🇪🇹", dial: "+251" },
  { name: "Gabon", flag: "🇬🇦", dial: "+241" },
  { name: "Gambia", flag: "🇬🇲", dial: "+220" },
  { name: "Ghana", flag: "🇬🇭", dial: "+233" },
  { name: "Guinea", flag: "🇬🇳", dial: "+224" },
  { name: "Guinea-Bissau", flag: "🇬🇼", dial: "+245" },
  { name: "Kenya", flag: "🇰🇪", dial: "+254" },
  { name: "Lesotho", flag: "🇱🇸", dial: "+266" },
  { name: "Liberia", flag: "🇱🇷", dial: "+231" },
  { name: "Libya", flag: "🇱🇾", dial: "+218" },
  { name: "Madagascar", flag: "🇲🇬", dial: "+261" },
  { name: "Malawi", flag: "🇲🇼", dial: "+265" },
  { name: "Mali", flag: "🇲🇱", dial: "+223" },
  { name: "Mauritania", flag: "🇲🇷", dial: "+222" },
  { name: "Mauritius", flag: "🇲🇺", dial: "+230" },
  { name: "Morocco", flag: "🇲🇦", dial: "+212" },
  { name: "Mozambique", flag: "🇲🇿", dial: "+258" },
  { name: "Namibia", flag: "🇳🇦", dial: "+264" },
  { name: "Niger", flag: "🇳🇪", dial: "+227" },
  { name: "Nigeria", flag: "🇳🇬", dial: "+234" },
  { name: "Rwanda", flag: "🇷🇼", dial: "+250" },
  { name: "São Tomé and Príncipe", flag: "🇸🇹", dial: "+239" },
  { name: "Senegal", flag: "🇸🇳", dial: "+221" },
  { name: "Seychelles", flag: "🇸🇨", dial: "+248" },
  { name: "Sierra Leone", flag: "🇸🇱", dial: "+232" },
  { name: "Somalia", flag: "🇸🇴", dial: "+252" },
  { name: "South Africa", flag: "🇿🇦", dial: "+27" },
  { name: "South Sudan", flag: "🇸🇸", dial: "+211" },
  { name: "Sudan", flag: "🇸🇩", dial: "+249" },
  { name: "Tanzania", flag: "🇹🇿", dial: "+255" },
  { name: "Togo", flag: "🇹🇬", dial: "+228" },
  { name: "Tunisia", flag: "🇹🇳", dial: "+216" },
  { name: "Uganda", flag: "🇺🇬", dial: "+256" },
  { name: "Zambia", flag: "🇿🇲", dial: "+260" },
  { name: "Zimbabwe", flag: "🇿🇼", dial: "+263" },
  { name: "Other", flag: "🌍", dial: "" },
];

export const COUNTRIES: string[] = COUNTRY_OPTIONS.map((c) => c.name);

export function countryFlag(name: string | undefined | null): string {
  return COUNTRY_OPTIONS.find((c) => c.name === name)?.flag ?? "🌍";
}

/** African timezones by representative city. Format must stay "City (GMT +N)"
 * — it's the value persisted on the student record. */
export const TIMEZONES: string[] = [
  "Abidjan (GMT +0)",
  "Accra (GMT +0)",
  "Dakar (GMT +0)",
  "Algiers (GMT +1)",
  "Casablanca (GMT +1)",
  "Douala (GMT +1)",
  "Kinshasa (GMT +1)",
  "Lagos (GMT +1)",
  "Cairo (GMT +2)",
  "Johannesburg (GMT +2)",
  "Khartoum (GMT +2)",
  "Lusaka (GMT +2)",
  "Addis Ababa (GMT +3)",
  "Antananarivo (GMT +3)",
  "Dar es Salaam (GMT +3)",
  "Nairobi (GMT +3)",
  "Port Louis (GMT +4)",
];

export const DEFAULT_TIMEZONE = "Douala (GMT +1)";

/** Parses the fixed UTC offset out of a "City (GMT +N)" entry. These African
 * zones don't observe DST, so a fixed hour offset is sufficient. Falls back
 * to 0 (UTC) for an unrecognised value. */
export function timezoneOffsetHours(tz: string | undefined | null): number {
  const match = tz?.match(/GMT\s*([+-]\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
