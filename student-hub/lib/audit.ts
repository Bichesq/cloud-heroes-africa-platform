import { prisma } from "./prisma";

/* Append-only audit trail for profile/MFA changes, per the requirements'
 * "Audit & Logging" section: student, fields changed, old/new values,
 * timestamp, actor. Prisma-backed (model in
 * prisma-shared/platform-core-models.prisma) — replaces the repo-root
 * data/audit-log.json JSON store per
 * docs/plan/2026-08-23-centralize-shared-data.md. */

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
    await prisma.auditEntry.create({
      data: {
        studentId: entry.studentId,
        actor: entry.actor,
        actorRole: entry.actorRole,
        action: entry.action,
        changes: entry.changes as object,
      },
    });
  } catch (err) {
    console.error("audit log write failed:", err);
  }
}
