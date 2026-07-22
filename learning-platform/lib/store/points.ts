import { randomUUID } from "crypto";
import type { PointsEntry, PointsSourceType } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-points-ledger.json";

/* Append-only points ledger (decision 2026-07-09) — balance is always the
 * SUM of a student's entries, never a stored counter. */

export async function getPointsEntries(studentId: string): Promise<PointsEntry[]> {
  const all = await readStore<PointsEntry>(FILE);
  return all.filter((e) => e.studentId === studentId);
}

/** Idempotent per (studentId, sourceType, sourceId) — completing the same
 * unit twice never double-awards. */
export async function awardPoints(params: {
  studentId: string;
  sourceType: PointsSourceType;
  sourceId: string;
  points: number;
}): Promise<PointsEntry | null> {
  if (params.points === 0) return null;
  const all = await readStore<PointsEntry>(FILE);
  const dup = all.find(
    (e) =>
      e.studentId === params.studentId &&
      e.sourceType === params.sourceType &&
      e.sourceId === params.sourceId
  );
  if (dup) return null;

  const entry: PointsEntry = {
    id: randomUUID(),
    ...params,
    createdAt: new Date().toISOString(),
  };
  all.push(entry);
  await writeStore(FILE, all);
  return entry;
}
