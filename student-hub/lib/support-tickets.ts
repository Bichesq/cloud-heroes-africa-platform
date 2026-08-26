import type { SupportTicket as PrismaSupportTicket } from "@prisma/client";
import type {
  SupportTicket,
  TicketContext,
  TicketStatus,
  UnitCompletion,
} from "@/types";
import { getProgram } from "@/lib/curriculum";
import { nextIncompleteUnit } from "@/lib/curriculum-utils";
import { prisma } from "./prisma";

/* Help Desk / Service Desk ticket store. Prisma-backed (model in
 * prisma-shared/platform-core-models.prisma) — replaces the repo-root
 * data/support-tickets.json JSON store per
 * docs/plan/2026-08-23-centralize-shared-data.md. Business rules (which
 * transitions a student may trigger, closure requiring a resolution summary
 * + consent) are enforced in app/api/support/route.ts — this module is a
 * plain CRUD store plus status-log bookkeeping, same as before. */

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

export async function getTickets(studentId: string): Promise<SupportTicket[]> {
  const rows = await prisma.supportTicket.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toSupportTicket);
}

export async function getTicket(
  studentId: string,
  id: string
): Promise<SupportTicket | null> {
  const row = await prisma.supportTicket.findFirst({ where: { studentId, id } });
  return row ? toSupportTicket(row) : null;
}

export async function createTicket(input: {
  /** null for a pre-sign-in Service Desk request — see contactName/contactEmail. */
  studentId: string | null;
  desk: SupportTicket["desk"];
  categoryId: string;
  topic: string;
  description: string;
  preferredChannel: string | null;
  context: TicketContext;
  contactName?: string | null;
  contactEmail?: string | null;
}): Promise<SupportTicket> {
  const now = new Date();
  const row = await prisma.supportTicket.create({
    data: {
      studentId: input.studentId,
      desk: input.desk,
      categoryId: input.categoryId,
      topic: input.topic,
      description: input.description,
      preferredChannel: input.preferredChannel,
      status: "open",
      statusLog: [{ status: "open", at: now.toISOString() }],
      assignedTo: null,
      resolvedBy: null,
      resolutionSummary: null,
      context: input.context as object,
      closedAt: null,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
    },
  });
  return toSupportTicket(row);
}

/** Sets a new status, appending to the chronological status-date log only
 * when the status actually changes. */
export async function setTicketStatus(
  studentId: string,
  id: string,
  status: TicketStatus,
  extra: Partial<Pick<SupportTicket, "resolutionSummary" | "resolvedBy" | "closedAt">> = {}
): Promise<SupportTicket | null> {
  const existing = await prisma.supportTicket.findFirst({ where: { studentId, id } });
  if (!existing) return null;

  const now = new Date().toISOString();
  const existingStatusLog = existing.statusLog as SupportTicket["statusLog"];
  const statusLog =
    existing.status === status
      ? existingStatusLog
      : [...existingStatusLog, { status, at: now }];

  const updated = await prisma.supportTicket.update({
    where: { id: existing.id },
    data: {
      status,
      statusLog: statusLog as object,
      ...(extra.resolutionSummary !== undefined ? { resolutionSummary: extra.resolutionSummary } : {}),
      ...(extra.resolvedBy !== undefined ? { resolvedBy: extra.resolvedBy } : {}),
      ...(extra.closedAt !== undefined ? { closedAt: extra.closedAt ? new Date(extra.closedAt) : null } : {}),
    },
  });
  return toSupportTicket(updated);
}

/** Derives the student/program/module/unit context snapshot for a new
 * ticket automatically, so intake never asks the student to classify their
 * own request (help2.md: "derive or prefill metadata where possible"). Uses
 * the student's next-incomplete-unit as their current position — the same
 * signal the dashboard's "Resume" banner is built from. */
export async function resolveTicketContext(
  activeProgramId: string | undefined,
  completions: UnitCompletion[]
): Promise<TicketContext> {
  if (!activeProgramId) return {};
  const program = await getProgram(activeProgramId);
  if (!program) return {};

  const next = nextIncompleteUnit(program, completions);
  if (!next) return { programId: program.id, programTitle: program.title };

  return {
    programId: program.id,
    programTitle: program.title,
    moduleId: next.moduleId,
    moduleTitle: next.moduleTitle,
    unitId: next.unit.id,
    unitTitle: next.unit.title,
  };
}
