import { NextResponse } from "next/server";
import { currentStudent } from "@/lib/current-student";
import { createTicketSchema } from "@/lib/support-schema";
import { createTicket } from "@/lib/support-tickets";

/* POST — file a Help Desk ticket from inside the LP. Writes the SHARED
 * ticket store (repo-root data/support-tickets.json), so it lands in the
 * same queue Student Hub's Help Desk shows. Context arrives explicitly from
 * the unit/assessment screen the student is on. Help Desk tickets always
 * require a session (anonymous intake is Service Desk's, in Student Hub). */
export async function POST(request: Request) {
  const student = await currentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createTicketSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const ticket = await createTicket({
    studentId: student.id,
    categoryId: parsed.data.categoryId,
    topic: parsed.data.topic,
    description: parsed.data.description,
    preferredChannel: parsed.data.preferredChannel ?? null,
    context: parsed.data.context,
  });

  return NextResponse.json(ticket, { status: 201 });
}
