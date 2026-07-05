/* ------------------------------------------------------------------ *
 * Mock data for the redesigned profile page.
 * The real values come from getStudent(session.user.email); these are
 * the fallbacks + the fields the Student type does not yet carry.
 * TODO: add `timezone`, `mfaEnabled`, `joinedAt` to the Student type /
 *       LMS API and drop the fallbacks.
 * ------------------------------------------------------------------ */

export type ProfileData = {
  firstName: string;
  lastName: string;
  primaryEmail: string;
  secondaryEmail: string;
  phone: string;
  birthDate: string; // "" → shows MM / DD / YY placeholder
  city: string;
  country: string;
  timezone: string;
  level: string; // "DevOps Student | Intermediate"
  avatarUrl?: string;
  mfaEnabled: boolean;
  joinedAt: string; // "6/22/2025"
  yearsInCha: string; // "1 Year"
  photoPublic: boolean;
  countryPublic: boolean;
};

export const TIMEZONES = [
  "Douala (GMT +1)",
  "Lagos (GMT +1)",
  "Nairobi (GMT +3)",
  "Accra (GMT +0)",
  "Cairo (GMT +2)",
  "Johannesburg (GMT +2)",
];

export const COUNTRIES = [
  "Cameroon", "Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia",
  "Tanzania", "Uganda", "Rwanda", "Senegal", "Côte d'Ivoire",
  "Zimbabwe", "Zambia", "Mozambique", "Angola", "Other",
];

export const mockProfile: ProfileData = {
  firstName: "Chem",
  lastName: "Patrick Edward",
  primaryEmail: "eddie...39@gmail.com",
  secondaryEmail: "a...pat@gmail.com",
  phone: "+237 673194627",
  birthDate: "",
  city: "Douala",
  country: "Cameroon",
  timezone: "Douala (GMT +1)",
  level: "DevOps Student | Intermediate",
  mfaEnabled: false,
  joinedAt: "6/22/2025",
  yearsInCha: "1 Year",
  photoPublic: true,
  countryPublic: true,
};
