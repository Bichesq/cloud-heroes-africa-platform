import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { getCompletions } from "@/lib/curriculum";
import { getTickets, resolveTicketContext } from "@/lib/support-tickets";
import SupportView from "./components/SupportView";

/**
 * Help Desk page — signed-in students only. Learning/content/community
 * help is a feature for students actively taking courses; Service Desk
 * (account/access/technical) lives at its own route, /service-desk, which
 * is also reachable before sign-in. See docs/student-hub/requirements/help2.md
 * for the Help Desk / Service Desk distinction.
 */
export default async function SupportPage() {
  const session = await getSession();
  if (!session) redirect("/");

  const student = await getStudent(session.user.email);
  if (!student) redirect("/");

  const [allTickets, completions] = await Promise.all([
    getTickets(student.id),
    getCompletions(student.id),
  ]);
  const tickets = allTickets.filter((t) => t.desk === "help");
  const context = await resolveTicketContext(student.activeProgramId, completions);

  return <SupportView initialTickets={tickets} context={context} />;
}
