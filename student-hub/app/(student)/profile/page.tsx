import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { DEFAULT_TIMEZONE } from "@/lib/profile-options";
import { isoToMdy } from "@/lib/profile-utils";
import { redirect } from "next/navigation";
import ProfileClient from "./components/ProfileClient";
import type { ProfileData } from "./types";

/**
 * Profile page — server component. Resolves the session + student record,
 * then hands a fully resolved ProfileData object to the client view that
 * owns the editable form state. Every field comes from the student record
 * (or the Google session for identity basics) — no mock fallbacks.
 */
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/SignIn");

  const student = await getStudent(session.user.email);

  const data: ProfileData = {
    firstName: student?.givenName || session.user.given_name || "",
    lastName: student?.familyName || session.user.family_name || "",
    displayName: student?.displayName ?? "",
    primaryEmail: session.user.email,
    secondaryEmail: student?.alternateEmail ?? "",
    phone: student?.phone ?? "",
    birthDate: student?.birthDate ? isoToMdy(student.birthDate) : "",
    city: student?.city ?? "",
    country: student?.country ?? "",
    timezone: student?.timezone ?? DEFAULT_TIMEZONE,
    level: student?.track ?? "CHA Student",
    avatarUrl: student?.avatarUrl ?? session.user.image ?? undefined,
    dateJoined: student?.createdAt ?? new Date().toISOString(),
    photoPublic: student?.photoPublic ?? true,
    countryPublic: student?.countryPublic ?? true,
    mfaMethods: student?.mfaMethods ?? [],
    passkeys: student?.passkeys ?? [],
  };

  return <ProfileClient data={data} />;
}
