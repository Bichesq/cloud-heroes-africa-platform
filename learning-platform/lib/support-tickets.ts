import type { SupportTicket as PrismaSupportTicket } from "@prisma/client";
import type { SupportTicket, TicketContext } from "@/types";
import { prisma } from "./prisma";

/* Trimmed copy of student-hub/lib/support-tickets.ts pointed at the SHARED
 * `support_tickets` table (Prisma model in
 * prisma-shared/platform-core-models.prisma) — replaces the repo-root
 * data/support-tickets.json JSON store per
 * docs/plan/2026-08-23-centralize-shared-data.md. LP files tickets into the
 * same queue Help Desk reads (requirement §10: LP does not run its own
 * ticketing engine). Only creation lives here; ticket management stays in
 * Student Hub / Help Desk. */

function toSupportTicket(row: PrismaSupportTicket): SupportTicket {
  return {
    id: row.id,
    studentId: row.studentId,
    desk: row.desk,
    categoryId: row.categoryId,
    topic: row.topic,
    description: row.description,
    preferredChannel: row.preferredChannel,
    status: row.status,
    statusLog: row.statusLog as SupportTicket["statusLog"],
    assignedTo: row.assignedTo,
    resolvedBy: row.resolvedBy,
    resolutionSummary: row.resolutionSummary,
    context: row.context as TicketContext,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createTicket(input: {
  studentId: string;
  categoryId: string;
  topic: string;
  description: string;
  preferredChannel: string | null;
  context: TicketContext;
}): Promise<SupportTicket> {
  const row = await prisma.supportTicket.create({
    data: {
      studentId: input.studentId,
      desk: "help",
      categoryId: input.categoryId,
      topic: input.topic,
      description: input.description,
      preferredChannel: input.preferredChannel,
      status: "open",
      statusLog: [{ status: "open", at: new Date().toISOString() }],
      assignedTo: null,
      resolvedBy: null,
      resolutionSummary: null,
      context: input.context as object,
      closedAt: null,
      contactName: null,
      contactEmail: null,
    },
  });
  return toSupportTicket(row);
}
