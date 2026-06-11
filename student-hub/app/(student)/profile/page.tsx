import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm/page";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/invite");

  const existing = await getStudent(session.user.email);

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Complete your profile</h1>
      <p className="text-sm text-gray-500 mb-8">
        Signed in as {session.user.given_name} {session.user.family_name} ·{" "}
        {session.user.email}
      </p>
      <ProfileForm
        defaultValues={{
          given_name: session.user.given_name,
          family_name: session.user.family_name,
          email: session.user.email,
          ...existing,
        }}
      />
    </div>
  );
}