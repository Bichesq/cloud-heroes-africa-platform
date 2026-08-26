/**
 * One-time migration: repo-root data/*.json (4 files) + student-hub/data/*.json
 * (4 files) → Postgres (Prisma), per
 * docs/plan/2026-08-23-centralize-shared-data.md step 3.
 *
 * Run once the `add_shared_and_local_models` migration has been applied:
 *
 *   npm run migrate:shared
 *
 * Safe to re-run: every table is upserted by its known id (or natural key),
 * so re-running after edits converges rather than duplicating rows. It never
 * deletes or modifies the source JSON files — those stay in place until
 * verified end-to-end (plan step 8's final cleanup step deletes them
 * separately, by hand, once that verification has passed).
 *
 * Insert order matches the plan's FK dependency order: approved_emails →
 * students → support_tickets → audit_log → todos → events →
 * sh_mock_programs → sh_unit_completions.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import {
  PrismaClient,
  type ApprovedEmailSource,
  type ApprovedEmailStatus,
  type AuditActorRole,
  type LearningEventType,
  type StudentStatus,
  type SupportDesk,
  type TicketStatus,
  type TodoSource,
} from "@prisma/client";

loadEnv({ path: path.join(process.cwd(), ".env.local") });
loadEnv();

const prisma = new PrismaClient();

const REPO_ROOT_DATA_DIR = path.join(process.cwd(), "..", "data");
const STUDENT_HUB_DATA_DIR = path.join(process.cwd(), "..", "student-hub", "data");

function readJson<T>(dir: string, filename: string): T {
  return JSON.parse(readFileSync(path.join(dir, filename), "utf-8")) as T;
}

// ---------------------------------------------------------------------------
// Source shapes — mirror the *.json files' current on-disk contents (and
// types/index.ts in both apps), kept local to this script per the same
// reasoning as scripts/migrate-to-postgres.ts.
// ---------------------------------------------------------------------------

type SourceApprovedEmail = {
  id: string;
  email: string;
  status: string;
  source: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

type SourceMfaMethod = {
  id: string;
  method: string;
  transport: string;
  identifier: string;
  lastUsed: string | null;
  active: boolean;
  createdAt: string;
};

type SourcePasskey = {
  id: string;
  label: string;
  registeredAt: string;
  lastUsed: string | null;
};

type SourceStudent = {
  id: string;
  approvedEmailId: string;
  email: string;
  givenName: string;
  familyName: string;
  legalName?: string;
  displayName?: string;
  phone?: string;
  alternateEmail?: string;
  birthDate?: string;
  city?: string;
  country?: string;
  timezone?: string;
  track?: string;
  avatarUrl?: string;
  photoPublic?: boolean;
  countryPublic?: boolean;
  mfaMethods?: SourceMfaMethod[];
  passkeys?: SourcePasskey[];
  activeProgramId?: string;
  status?: string;
  lastLogin: string;
  profileCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type SourceTicketStatusEvent = { status: string; at: string };

type SourceSupportTicket = {
  id: string;
  studentId: string | null;
  desk: string;
  categoryId: string;
  topic: string;
  description: string;
  preferredChannel: string | null;
  status: string;
  statusLog: SourceTicketStatusEvent[];
  assignedTo: string | null;
  resolvedBy: string | null;
  resolutionSummary: string | null;
  context: unknown;
  closedAt: string | null;
  contactName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

type SourceAuditChange = { field: string; from: unknown; to: unknown };

type SourceAuditEntry = {
  id: string;
  studentId: string;
  actor: string;
  actorRole: string;
  action: string;
  changes: SourceAuditChange[];
  timestamp: string;
};

type SourceTodo = {
  id: string;
  studentId: string;
  title: string;
  dueDate: string | null;
  link: string | null;
  source: string;
  completedAt: string | null;
  dismissed: { at: string; reason: string } | null;
  createdAt: string;
  updatedAt: string;
};

type SourceLearningEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  start: string;
  end: string;
  link: string | null;
};

type SourceShUnit = { id: string; title: string; type: string; order: number; durationMin: number };
type SourceShModule = {
  id: string;
  title: string;
  order: number;
  description: string;
  units: SourceShUnit[];
};
type SourceShProgram = { id: string; title: string; modules: SourceShModule[] };

type SourceUnitCompletion = { studentId: string; unitId: string; completedAt: string };

// ---------------------------------------------------------------------------
// approved_emails
// ---------------------------------------------------------------------------
// Old string ids (e.g. "ae-001") are dropped for new randomly-generated
// UUIDs per the plan's id-format decision — nothing looks up an
// approved-email row by id today, so this is a safe one-time reassignment.
// The id map is used below to rewrite students.approvedEmailId.

async function migrateApprovedEmails(
  rows: SourceApprovedEmail[]
): Promise<Map<string, string>> {
  const oldToNewId = new Map<string, string>();

  for (const r of rows) {
    const row = await prisma.approvedEmail.upsert({
      where: { email: r.email.toLowerCase() },
      create: {
        email: r.email.toLowerCase(),
        status: r.status as ApprovedEmailStatus,
        source: r.source as ApprovedEmailSource,
        notes: r.notes ?? "",
        createdBy: r.createdBy,
        createdAt: new Date(r.createdAt),
        updatedBy: r.updatedBy,
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
      },
      update: {
        status: r.status as ApprovedEmailStatus,
        source: r.source as ApprovedEmailSource,
        notes: r.notes ?? "",
        updatedBy: r.updatedBy,
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
      },
    });
    oldToNewId.set(r.id, row.id);
  }

  return oldToNewId;
}

// ---------------------------------------------------------------------------
// students
// ---------------------------------------------------------------------------

async function migrateStudents(
  rows: SourceStudent[],
  approvedEmailIdMap: Map<string, string>
) {
  for (const s of rows) {
    const approvedEmailId = approvedEmailIdMap.get(s.approvedEmailId);
    if (!approvedEmailId) {
      console.warn(
        `[students] ${s.email}: no matching approved_emails row for old id ${s.approvedEmailId} — skipping`
      );
      continue;
    }

    await prisma.student.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        approvedEmailId,
        email: s.email.toLowerCase(),
        givenName: s.givenName,
        familyName: s.familyName,
        legalName: s.legalName || null,
        displayName: s.displayName || null,
        phone: s.phone || null,
        alternateEmail: s.alternateEmail || null,
        birthDate: s.birthDate || null,
        city: s.city || null,
        country: s.country || null,
        timezone: s.timezone || null,
        track: s.track || null,
        avatarUrl: s.avatarUrl || null,
        photoPublic: s.photoPublic ?? true,
        countryPublic: s.countryPublic ?? true,
        mfaMethods: (s.mfaMethods ?? []) as object,
        passkeys: (s.passkeys ?? []) as object,
        activeProgramId: s.activeProgramId || null,
        status: (s.status ?? "active") as StudentStatus,
        lastLogin: new Date(s.lastLogin),
        profileCompletedAt: s.profileCompletedAt ? new Date(s.profileCompletedAt) : null,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      },
      update: {
        approvedEmailId,
        givenName: s.givenName,
        familyName: s.familyName,
        legalName: s.legalName || null,
        displayName: s.displayName || null,
        phone: s.phone || null,
        alternateEmail: s.alternateEmail || null,
        birthDate: s.birthDate || null,
        city: s.city || null,
        country: s.country || null,
        timezone: s.timezone || null,
        track: s.track || null,
        avatarUrl: s.avatarUrl || null,
        photoPublic: s.photoPublic ?? true,
        countryPublic: s.countryPublic ?? true,
        mfaMethods: (s.mfaMethods ?? []) as object,
        passkeys: (s.passkeys ?? []) as object,
        activeProgramId: s.activeProgramId || null,
        status: (s.status ?? "active") as StudentStatus,
        lastLogin: new Date(s.lastLogin),
        profileCompletedAt: s.profileCompletedAt ? new Date(s.profileCompletedAt) : null,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// support_tickets
// ---------------------------------------------------------------------------

async function migrateSupportTickets(rows: SourceSupportTicket[]) {
  for (const t of rows) {
    await prisma.supportTicket.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        studentId: t.studentId,
        desk: t.desk as SupportDesk,
        categoryId: t.categoryId,
        topic: t.topic,
        description: t.description,
        preferredChannel: t.preferredChannel,
        status: t.status as TicketStatus,
        statusLog: t.statusLog as object,
        assignedTo: t.assignedTo,
        resolvedBy: t.resolvedBy,
        resolutionSummary: t.resolutionSummary,
        context: (t.context ?? {}) as object,
        closedAt: t.closedAt ? new Date(t.closedAt) : null,
        contactName: t.contactName,
        contactEmail: t.contactEmail,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      },
      update: {
        status: t.status as TicketStatus,
        statusLog: t.statusLog as object,
        assignedTo: t.assignedTo,
        resolvedBy: t.resolvedBy,
        resolutionSummary: t.resolutionSummary,
        closedAt: t.closedAt ? new Date(t.closedAt) : null,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// audit_log — student-hub only (learning-platform has zero current
// references, per docs/shared-schema-audit.md Model 4).
// ---------------------------------------------------------------------------

async function migrateAuditLog(rows: SourceAuditEntry[]) {
  for (const a of rows) {
    await prisma.auditEntry.upsert({
      where: { id: a.id },
      create: {
        id: a.id,
        studentId: a.studentId,
        actor: a.actor,
        actorRole: a.actorRole as AuditActorRole,
        action: a.action,
        changes: a.changes as object,
        timestamp: new Date(a.timestamp),
      },
      update: {},
    });
  }
}

// ---------------------------------------------------------------------------
// todos
// ---------------------------------------------------------------------------

async function migrateTodos(rows: SourceTodo[]) {
  for (const t of rows) {
    await prisma.todo.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        studentId: t.studentId,
        title: t.title,
        dueDate: t.dueDate,
        link: t.link,
        source: t.source as TodoSource,
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
        dismissedAt: t.dismissed ? new Date(t.dismissed.at) : null,
        dismissedReason: t.dismissed?.reason ?? null,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      },
      update: {
        title: t.title,
        dueDate: t.dueDate,
        link: t.link,
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
        dismissedAt: t.dismissed ? new Date(t.dismissed.at) : null,
        dismissedReason: t.dismissed?.reason ?? null,
        updatedAt: new Date(t.updatedAt),
      },
    });
  }
}

// ---------------------------------------------------------------------------
// events — seed content, id-keyed upsert.
// ---------------------------------------------------------------------------

async function migrateEvents(rows: SourceLearningEvent[]) {
  for (const e of rows) {
    await prisma.event.upsert({
      where: { id: e.id },
      create: {
        id: e.id,
        type: e.type as LearningEventType,
        title: e.title,
        description: e.description,
        start: new Date(e.start),
        end: new Date(e.end),
        link: e.link,
      },
      update: {
        type: e.type as LearningEventType,
        title: e.title,
        description: e.description,
        start: new Date(e.start),
        end: new Date(e.end),
        link: e.link,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// sh_mock_programs — whole modules/units tree stored as one Json blob.
// ---------------------------------------------------------------------------

async function migrateMockPrograms(rows: SourceShProgram[]) {
  for (const p of rows) {
    await prisma.shMockProgram.upsert({
      where: { id: p.id },
      create: { id: p.id, title: p.title, modules: p.modules as object },
      update: { title: p.title, modules: p.modules as object },
    });
  }
}

// ---------------------------------------------------------------------------
// sh_unit_completions
// ---------------------------------------------------------------------------

async function migrateUnitCompletions(rows: SourceUnitCompletion[]) {
  for (const c of rows) {
    await prisma.shUnitCompletion.upsert({
      where: { studentId_unitId: { studentId: c.studentId, unitId: c.unitId } },
      create: { studentId: c.studentId, unitId: c.unitId, completedAt: new Date(c.completedAt) },
      update: { completedAt: new Date(c.completedAt) },
    });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const approvedEmails = readJson<SourceApprovedEmail[]>(REPO_ROOT_DATA_DIR, "approved-emails.json");
  const students = readJson<SourceStudent[]>(REPO_ROOT_DATA_DIR, "students.json");
  const supportTickets = readJson<SourceSupportTicket[]>(REPO_ROOT_DATA_DIR, "support-tickets.json");
  const auditLog = readJson<SourceAuditEntry[]>(REPO_ROOT_DATA_DIR, "audit-log.json");

  const todos = readJson<SourceTodo[]>(STUDENT_HUB_DATA_DIR, "todos.json");
  const events = readJson<SourceLearningEvent[]>(STUDENT_HUB_DATA_DIR, "events.json");
  const mockPrograms = readJson<SourceShProgram[]>(STUDENT_HUB_DATA_DIR, "programs.json");
  const unitCompletions = readJson<SourceUnitCompletion[]>(STUDENT_HUB_DATA_DIR, "progress.json");

  console.log("== Shared-data → Postgres migration ==\n");

  const approvedEmailIdMap = await migrateApprovedEmails(approvedEmails);
  await migrateStudents(students, approvedEmailIdMap);
  await migrateSupportTickets(supportTickets);
  await migrateAuditLog(auditLog);
  await migrateTodos(todos);
  await migrateEvents(events);
  await migrateMockPrograms(mockPrograms);
  await migrateUnitCompletions(unitCompletions);

  console.log("== Summary ==");
  console.log(`approved_emails:      ${approvedEmails.length}`);
  console.log(`students:             ${students.length}`);
  console.log(`support_tickets:      ${supportTickets.length}`);
  console.log(`audit_log:            ${auditLog.length}`);
  console.log(`todos:                ${todos.length}`);
  console.log(`events:               ${events.length}`);
  console.log(`sh_mock_programs:     ${mockPrograms.length}`);
  console.log(`sh_unit_completions:  ${unitCompletions.length}`);

  const counts = await prisma.$transaction([
    prisma.approvedEmail.count(),
    prisma.student.count(),
    prisma.supportTicket.count(),
    prisma.auditEntry.count(),
    prisma.todo.count(),
    prisma.event.count(),
    prisma.shMockProgram.count(),
    prisma.shUnitCompletion.count(),
  ]);
  console.log("\n== Row counts now in Postgres ==");
  console.log(`approved_emails:      ${counts[0]}`);
  console.log(`students:             ${counts[1]}`);
  console.log(`support_tickets:      ${counts[2]}`);
  console.log(`audit_log:            ${counts[3]}`);
  console.log(`todos:                ${counts[4]}`);
  console.log(`events:               ${counts[5]}`);
  console.log(`sh_mock_programs:     ${counts[6]}`);
  console.log(`sh_unit_completions:  ${counts[7]}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
