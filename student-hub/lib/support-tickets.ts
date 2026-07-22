import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  SupportTicket,
  TicketContext,
  TicketStatus,
  UnitCompletion,
} from "@/types";
import { getProgram } from "@/lib/curriculum";
import { nextIncompleteUnit } from "@/lib/curriculum-utils";

/* JSON-file store for Help Desk / Service Desk tickets (mirrors lib/todos.ts).
 * Business rules (which transitions a student may trigger, closure requiring
 * a resolution summary + consent) are enforced in app/api/support/route.ts —
 * this module is a plain CRUD store plus status-log bookkeeping. */

/* Shared across app surfaces — Learning Platform files tickets into the same
 * store (repo-root data/), so Help Desk sees one queue. */
const SHARED_DIR =
  process.env.SHARED_DATA_DIR ?? path.resolve(process.cwd(), "..", "data");
const FILE = path.join(SHARED_DIR, "support-tickets.json");

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

export async function getTickets(studentId: string): Promise<SupportTicket[]> {
  const all = await readAll();
  return all
    .filter((t) => t.studentId === studentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTicket(
  studentId: string,
  id: string
): Promise<SupportTicket | null> {
  const all = await readAll();
  return all.find((t) => t.studentId === studentId && t.id === id) ?? null;
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
  const all = await readAll();
  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: randomUUID(),
    studentId: input.studentId,
    desk: input.desk,
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
    contactName: input.contactName ?? null,
    contactEmail: input.contactEmail ?? null,
    createdAt: now,
    updatedAt: now,
  };
  all.push(ticket);
  await writeAll(all);
  return ticket;
}

/** Sets a new status, appending to the chronological status-date log only
 * when the status actually changes. */
export async function setTicketStatus(
  studentId: string,
  id: string,
  status: TicketStatus,
  extra: Partial<Pick<SupportTicket, "resolutionSummary" | "resolvedBy" | "closedAt">> = {}
): Promise<SupportTicket | null> {
  const all = await readAll();
  const idx = all.findIndex((t) => t.studentId === studentId && t.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  const existing = all[idx];
  const statusLog =
    existing.status === status
      ? existing.statusLog
      : [...existing.statusLog, { status, at: now }];

  all[idx] = { ...existing, ...extra, status, statusLog, updatedAt: now };
  await writeAll(all);
  return all[idx];
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
