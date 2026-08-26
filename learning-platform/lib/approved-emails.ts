import type { ApprovedEmail as PrismaApprovedEmail } from "@prisma/client";
import type { ApprovedEmail } from "@/types";
import { prisma } from "./prisma";

/* Read-only view of the admin-managed approved-email list shared with
 * Student Hub. Prisma-backed (model in
 * prisma-shared/platform-core-models.prisma) — replaces the repo-root
 * data/approved-emails.json JSON store per
 * docs/plan/2026-08-23-centralize-shared-data.md. LP never mutates it —
 * approvals/revocations are Administration's (today, student-hub's) job. */

function toApprovedEmail(row: PrismaApprovedEmail): ApprovedEmail {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    source: row.source,
    notes: row.notes,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export async function findApprovedEmail(
  email: string
): Promise<ApprovedEmail | null> {
  const row = await prisma.approvedEmail.findFirst({
    where: { email: email.toLowerCase(), status: "approved" },
  });
  return row ? toApprovedEmail(row) : null;
}
