import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

/**
 * Student shell — redesigned to the Cloud Heroes Africa design.
 * A full-width 88px top bar sits above a row of the 300px sidebar and
 * the scrolling main region. The dashboard page owns its own content +
 * calendar rail grid, so `main` is full-width (no max-w cap).
 */
export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const { given_name, family_name, email, image } = session.user;
  const fullName = [given_name, family_name].filter(Boolean).join(" ");

  const student = await getStudent(email);
  const avatarUrl = student?.avatarUrl ?? image ?? undefined;
  const track = student?.track || "CHA Student";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cha-canvas text-cha-ink">
      <TopBar givenName={given_name} familyName={family_name} email={email} avatarUrl={avatarUrl} />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          name={fullName || "Student"}
          track={track}
          avatarUrl={avatarUrl}
        />
        <main className="min-w-0 flex-1 overflow-auto px-8 pb-12 pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
