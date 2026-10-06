import type { LpAuthoringAuditAction, Prisma } from "@prisma/client";

/* Authoring audit trail (plan §7; decision-log open item 23). Always called
 * with the transaction client of the change it records, so the entry and the
 * change commit or roll back together. Append-only: nothing updates or
 * deletes these rows. */

type Tx = Prisma.TransactionClient;

export function recordAudit(
  tx: Tx,
  entry: {
    programId: string;
    actorAuthorId: string;
    action: LpAuthoringAuditAction;
    subjectAuthorId?: string | null;
    details?: Prisma.InputJsonObject;
  },
) {
  return tx.lpAuthoringAuditEntry.create({
    data: {
      programId: entry.programId,
      actorAuthorId: entry.actorAuthorId,
      action: entry.action,
      subjectAuthorId: entry.subjectAuthorId ?? null,
      details: entry.details ?? {},
    },
    select: { id: true },
  });
}
