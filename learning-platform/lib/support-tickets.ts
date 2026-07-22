import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { SupportTicket, TicketContext } from "@/types";
import { sharedDataPath } from "./shared-data";

/* Trimmed copy of student-hub/lib/support-tickets.ts pointed at the SHARED
 * repo-root store — LP files tickets into the same queue Help Desk reads
 * (requirement §10: LP does not run its own ticketing engine). Only creation
 * lives here; ticket management stays in Student Hub / Help Desk. */

const FILE = sharedDataPath("support-tickets.json");

async function readAll(): Promise<SupportTicket[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as SupportTicket[];
  } catch {
    return [];
  }
}

async function writeAll(tickets: SupportTicket[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(tickets, null, 2));
}

export async function createTicket(input: {
  studentId: string;
  categoryId: string;
  topic: string;
  description: string;
  preferredChannel: string | null;
  context: TicketContext;
}): Promise<SupportTicket> {
  const all = await readAll();
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: randomUUID(),
    studentId: input.studentId,
    desk: "help",
    categoryId: input.categoryId,
    topic: input.topic,
    description: input.description,
    preferredChannel: input.preferredChannel,
    status: "open",
    statusLog: [{ status: "open", at: now }],
    assignedTo: null,
    resolvedBy: null,
    resolutionSummary: null,
    context: input.context,
    closedAt: null,
    contactName: null,
    contactEmail: null,
    createdAt: now,
    updatedAt: now,
  };
  all.push(ticket);
  await writeAll(all);
  return ticket;
}
