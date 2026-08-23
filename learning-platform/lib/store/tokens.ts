import type { TokenEntry, TokenSourceType } from "@/types";
import { prisma } from "@/lib/prisma";

/* Append-only token ledger (decision 2026-07-09; renamed points→tokens per
 * §1, 2026-08-11) — balance is always the SUM of a student's entries,
 * never a stored counter. Renamed from lib/store/points.ts. */

function toTokenEntry(row: {
  id: string;
  studentId: string;
  sourceType: string;
  sourceId: string;
  tokens: number;
  createdAt: Date;
}): TokenEntry {
  return {
    id: row.id,
    studentId: row.studentId,
    sourceType: row.sourceType as TokenSourceType,
    sourceId: row.sourceId,
    tokens: row.tokens,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getTokenEntries(studentId: string): Promise<TokenEntry[]> {
  const rows = await prisma.lpTokenLedger.findMany({ where: { studentId } });
  return rows.map(toTokenEntry);
}

/** Idempotent per (studentId, sourceType, sourceId) — completing the same
 * unit twice never double-awards. Relies on the DB unique constraint rather
 * than a find-then-insert race. */
export async function awardTokens(params: {
  studentId: string;
  sourceType: TokenSourceType;
  sourceId: string;
  tokens: number;
}): Promise<TokenEntry | null> {
  if (params.tokens === 0) return null;
  try {
    const row = await prisma.lpTokenLedger.create({ data: params });
    return toTokenEntry(row);
  } catch (err) {
    if (isUniqueConstraintViolation(err)) return null;
    throw err;
  }
}

function isUniqueConstraintViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}
