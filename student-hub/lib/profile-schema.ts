import { z } from "zod";
import { COUNTRIES, TIMEZONES } from "./profile-options";
import { ageFromIso, mdyToIso } from "./profile-utils";

/* Shared validation for the profile form (inline errors) and
 * POST /api/profile (reject invalid payloads). Field names are the form's;
 * the API route maps them onto the Student record. */

const name = z
  .string()
  .trim()
  .min(1, "Required")
  .max(60, "Too long")
  .regex(/^[\p{L}][\p{L}\p{M}' -]*$/u, "Letters, spaces, hyphens and apostrophes only");

const birthDate = z
  .string()
  .trim()
  .refine((v) => mdyToIso(v) !== null, "Enter a valid date as MM/DD/YY")
  .refine((v) => {
    const iso = mdyToIso(v);
    if (!iso) return true; // previous refine already reports the format error
    const age = ageFromIso(iso);
    return age >= 10 && age <= 80;
  }, "Age must be between 10 and 80");

export const profileFormSchema = z.object({
  firstName: name,
  lastName: name,
  displayName: z
    .string()
    .trim()
    .max(60, "Keep it under 60 characters"),
  timezone: z
    .string()
    .refine((v) => TIMEZONES.includes(v), "Select a timezone from the list"),
  secondaryEmail: z
    .literal("")
    .or(z.email("Enter a valid email address")),
  country: z
    .string()
    .refine((v) => COUNTRIES.includes(v), "Select a country from the list"),
  phone: z
    .string()
    .trim()
    .regex(/^\+\d{1,3}[\d\s-]{6,14}$/, "Use international format, e.g. +237 673 194 627"),
  birthDate,
  photoPublic: z.boolean(),
  countryPublic: z.boolean(),
});

/** Partial + strict: toggle confirmations post a single flag; unknown keys are rejected. */
export const profileUpdateSchema = z.strictObject(profileFormSchema.shape).partial();

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

/** field → first error message, for inline display. */
export function fieldErrors(
  result: z.ZodSafeParseResult<unknown>
): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}
