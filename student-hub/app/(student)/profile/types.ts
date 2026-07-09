import type { MfaMethod, Passkey } from "@/types";

/** Everything the profile view needs, resolved server-side from the real
 * student record + session (no mock fallbacks). */
export type ProfileData = {
  firstName: string;
  lastName: string;
  displayName: string; // preferred name shown in the dashboard greeting
  primaryEmail: string;
  secondaryEmail: string;
  phone: string;
  birthDate: string; // display format MM/DD/YY, "" when unset
  city: string;
  country: string;
  timezone: string;
  level: string; // role/track, e.g. "DevOps Student | Intermediate"
  avatarUrl?: string;
  dateJoined: string; // ISO 8601
  photoPublic: boolean;
  countryPublic: boolean;
  mfaMethods: MfaMethod[];
  passkeys: Passkey[];
};
