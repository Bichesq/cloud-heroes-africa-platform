import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/students";
import TopBar from "./components/TopBar";

/* Authenticated learner shell: full-height column with the 88px LP top nav
 * (canvas-colored) above a white scrolling main area — the mockups always
 * show that color break at the top-bar edge. Unlike Student Hub there is no
 * persistent app sidebar — the unit view brings its own learning rail. */
export default async function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.email) redirect("/SignIn");

  const student = await getStudent(session.user.email);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        givenName={student?.displayName || session.user.given_name || ""}
        familyName={student?.displayName ? "" : session.user.family_name || ""}
        email={session.user.email}
        avatarUrl={student?.avatarUrl ?? session.user.image ?? undefined}
      />
      <main className="flex-1 overflow-auto bg-cha-surface">{children}</main>
    </div>
  );
}
