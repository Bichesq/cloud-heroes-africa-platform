import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { redirect } from "next/navigation";
import ProfileClient from "./components/ProfileClient";
import { mockProfile, type ProfileData } from "./data/mock";

/**
 * Profile page — redesigned to the Cloud Heroes Africa "My Profile" mock.
 * Server component: resolves the session + student, then hands a fully
 * merged ProfileData object to the client view that owns the editable
 * form state.
 *
 * Preserved integration points (unchanged from the original page):
 *   - getSession() / redirect("/invite")
 *   - getStudent(session.user.email)
 *   - the form POSTs to /api/profile (see ProfileClient)
 */
export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/invite");

  const student = await getStudent(session.user.email);

  // Merge real student data over the mock fallbacks. Fields the Student
  // type does not yet carry (timezone, mfaEnabled, joinedAt) fall back
  // to the mock — see TODO in data/mock.ts.
  const data: ProfileData = {
    ...mockProfile,
    firstName: session.user.given_name ?? mockProfile.firstName,
    lastName: session.user.family_name ?? mockProfile.lastName,
    primaryEmail: session.user.email ?? mockProfile.primaryEmail,
    secondaryEmail: student?.alternateEmail ?? mockProfile.secondaryEmail,
    phone: student?.phone ?? mockProfile.phone,
    birthDate: student?.birthDate ?? mockProfile.birthDate,
    city: student?.city ?? mockProfile.city,
    country: student?.country ?? mockProfile.country,
    avatarUrl: student?.avatarUrl,
  };

  return <ProfileClient data={data} />;
}
