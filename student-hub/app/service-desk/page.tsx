import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { getCompletions } from "@/lib/curriculum";
import { getTickets, resolveTicketContext } from "@/lib/support-tickets";
import Sidebar from "@/app/(student)/components/Sidebar";
import TopBar from "@/app/(student)/components/TopBar";
import ServiceDeskPageClient from "./components/ServiceDeskPageClient";
import PublicShell from "./components/PublicShell";
import PublicServiceDeskForm from "./components/PublicServiceDeskForm";

export const metadata: Metadata = {
  title: "Service Desk — Cloud Heroes Africa",
  description: "Account, login, and technical support — no sign-in required.",
};

/**
 * Service Desk (account/access/technical support) — reachable both before
 * and after sign-in, unlike Help Desk which requires a session. A student
 * locked out of their account needs somewhere to go; the anonymous branch
 * asks for a name + email instead of deriving identity from a session.
 */
export default async function ServiceDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const session = await getSession();
  const student = session?.user?.email ? await getStudent(session.user.email) : null;

  if (!session || !student) {
    return (
      <PublicShell>
        <PublicServiceDeskForm initialCategoryId={category ?? null} />
      </PublicShell>
    );
  }

  const { given_name, family_name, email, image } = session.user;
  const fullName = [given_name, family_name].filter(Boolean).join(" ");
  const avatarUrl = student.avatarUrl ?? image ?? undefined;
  const track = student.track || "CHA Student";

  const [allTickets, completions] = await Promise.all([
    getTickets(student.id),
    getCompletions(student.id),
  ]);
  const tickets = allTickets.filter((t) => t.desk === "service");
  const context = await resolveTicketContext(student.activeProgramId, completions);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-cha-canvas text-cha-ink">
      <TopBar givenName={given_name} familyName={family_name} email={email} avatarUrl={avatarUrl} />
      <div className="flex min-h-0 flex-1">
        <Sidebar name={fullName || "Student"} track={track} avatarUrl={avatarUrl} />
        <main className="min-w-0 flex-1 overflow-auto px-8 pb-12 pt-6">
          <ServiceDeskPageClient
            initialTickets={tickets}
            context={context}
            initialCategoryId={category ?? null}
          />
        </main>
      </div>
    </div>
  );
}
