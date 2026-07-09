import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.strictObject({ eventId: z.string().trim().min(1) });

/** Fire-and-forget audit trail for "Join"/"Open" clicks on calendar events,
 * for attendance analytics. Never blocks navigation to the event link. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  const student = await getStudent(session.user.email);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await logAudit({
    studentId: student.id,
    actor: session.user.email,
    actorRole: "student",
    action: "event.join",
    changes: [{ field: "eventId", from: null, to: parsed.data.eventId }],
  });

  return NextResponse.json({ ok: true });
}
