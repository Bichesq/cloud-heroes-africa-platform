import { getSession } from "@/lib/auth";
import { getStudent } from "@/lib/mock-api";
import { getCompletions } from "@/lib/curriculum";
import {
  getTicket,
  getTickets,
  createTicket,
  resolveTicketContext,
  setTicketStatus,
} from "@/lib/support-tickets";
import {
  createTicketSchema,
  createAnonymousTicketSchema,
  ticketActionSchema,
} from "@/lib/support-schema";
import { HELP_CATEGORIES } from "@/lib/help-catalog";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

async function currentStudent() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const student = await getStudent(session.user.email);
  if (!student) return null;
  return { email: session.user.email, student };
}

export async function GET() {
  const ctx = await currentStudent();
  if (!ctx) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const tickets = await getTickets(ctx.student.id);
  return NextResponse.json({ tickets });
}

/** Students submit a short + long description and a category; desk,
 * status, and learning context are derived server-side — no manual
 * taxonomy is required at intake (help2.md).
 *
 * Help Desk always requires a session (learning/content help is a signed-in
 * feature). Service Desk also accepts anonymous submissions — a student
 * locked out of their account has no session to derive identity from, so
 * that path asks for a name + email instead (see /service-desk). */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ctx = await currentStudent();

  if (!ctx) {
    const parsed = createAnonymousTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    const category = HELP_CATEGORIES.find((c) => c.id === parsed.data.categoryId);
    if (!category || category.desk !== "service") {
      return NextResponse.json(
        { error: "Sign in to submit a Help Desk request" },
        { status: 401 }
      );
    }

    // Not tied to a student record — never shown in a signed-in "My
    // Requests" view, and never audited against a student, by design.
    const ticket = await createTicket({
      studentId: null,
      desk: "service",
      categoryId: category.id,
      topic: parsed.data.topic,
      description: parsed.data.description,
      preferredChannel: parsed.data.preferredChannel ?? null,
      context: {},
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
    });
    return NextResponse.json({ ok: true, ticket });
  }

  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const completions = await getCompletions(ctx.student.id);
  const context = await resolveTicketContext(ctx.student.activeProgramId, completions);

  const ticket = await createTicket({
    studentId: ctx.student.id,
    desk: parsed.data.desk,
    categoryId: parsed.data.categoryId,
    topic: parsed.data.topic,
    description: parsed.data.description,
    preferredChannel: parsed.data.preferredChannel ?? null,
    context,
  });

  await logAudit({
    studentId: ctx.student.id,
    actor: ctx.email,
    actorRole: "student",
    action: "support.create",
    changes: [{ field: "topic", from: null, to: ticket.topic }],
  });

  return NextResponse.json({ ok: true, ticket });
}

/** Student-triggered transitions only: cancelling their own open/pending
 * request, or consenting to close one staff have already marked responded
 * with a resolution summary (help2.md closure requirement). Every other
 * status change is a staff/admin action outside this route. */
export async function PATCH(req: NextRequest) {
  const ctx = await currentStudent();
  if (!ctx) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ticketActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  const existing = await getTicket(ctx.student.id, parsed.data.id);
  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (parsed.data.action === "cancel") {
    if (existing.status === "resolved" || existing.status === "cancelled") {
      return NextResponse.json(
        { error: "This request is already closed" },
        { status: 400 }
      );
    }
    const updated = await setTicketStatus(ctx.student.id, existing.id, "cancelled", {
      closedAt: new Date().toISOString(),
    });
    await logAudit({
      studentId: ctx.student.id,
      actor: ctx.email,
      actorRole: "student",
      action: "support.cancel",
      changes: [{ field: "status", from: existing.status, to: "cancelled" }],
    });
    return NextResponse.json({ ok: true, ticket: updated });
  }

  // consent-close
  if (existing.status !== "responded" || !existing.resolutionSummary) {
    return NextResponse.json(
      { error: "This request doesn't have a resolution to confirm yet" },
      { status: 400 }
    );
  }
  const updated = await setTicketStatus(ctx.student.id, existing.id, "resolved", {
    closedAt: new Date().toISOString(),
  });
  await logAudit({
    studentId: ctx.student.id,
    actor: ctx.email,
    actorRole: "student",
    action: "support.consent-close",
    changes: [{ field: "status", from: existing.status, to: "resolved" }],
  });
  return NextResponse.json({ ok: true, ticket: updated });
}
