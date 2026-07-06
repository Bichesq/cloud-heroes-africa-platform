import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/* Append-only audit trail for profile/MFA changes, per the requirements'
 * "Audit & Logging" section: student, fields changed, old/new values,
 * timestamp, actor. JSON-file store to match the rest of the POC. */

const FILE = path.join(process.cwd(), "data", "audit-log.json");

export type AuditChange = { field: string; from: unknown; to: unknown };

export type AuditEntry = {
  id: string;
  studentId: string;
  actor: string; // email of who made the change; students self-serve here
  actorRole: "student" | "admin";
  action: string; // "profile.update" | "profile.avatar" | "privacy.toggle" | "mfa.*" | "passkey.*"
  changes: AuditChange[];
  timestamp: string;
};

/** Field-level diff of two records, restricted to the given keys. */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
  fields: (keyof T & string)[]
): AuditChange[] {
  return fields
    .filter((f) => JSON.stringify(before[f]) !== JSON.stringify(after[f]))
    .map((f) => ({ field: f, from: before[f] ?? null, to: after[f] ?? null }));
}

/** Appends an entry. Never throws — an audit failure must not fail the request. */
export async function logAudit(
  entry: Omit<AuditEntry, "id" | "timestamp">
): Promise<void> {
  if (entry.changes.length === 0) return;
  try {
    let log: AuditEntry[] = [];
    try {
      log = JSON.parse(await fs.readFile(FILE, "utf-8"));
    } catch {
      // first entry — file doesn't exist yet
    }
    log.push({ ...entry, id: randomUUID(), timestamp: new Date().toISOString() });
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(log, null, 2));
  } catch (err) {
    console.error("audit log write failed:", err);
  }
}
