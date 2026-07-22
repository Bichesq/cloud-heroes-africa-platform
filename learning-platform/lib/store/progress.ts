import type { StudentItem, StudentUnit, StudentUnitStatus } from "@/types";
import { readStore, writeStore } from "./json-store";

const ITEMS_FILE = "lp-student-items.json";
const UNITS_FILE = "lp-student-units.json";

/* Per-student learning state: item completions (rail dots / progress %) and
 * the dual-status unit records (completed_at / verified_at). */

export async function getStudentItems(studentId: string): Promise<StudentItem[]> {
  const all = await readStore<StudentItem>(ITEMS_FILE);
  return all.filter((r) => r.studentId === studentId);
}

/** Idempotent — completing an already-complete item is a no-op. */
export async function markItemComplete(
  studentId: string,
  itemId: string
): Promise<StudentItem> {
  const all = await readStore<StudentItem>(ITEMS_FILE);
  const existing = all.find(
    (r) => r.studentId === studentId && r.itemId === itemId
  );
  if (existing) return existing;

  const record: StudentItem = {
    studentId,
    itemId,
    completedAt: new Date().toISOString(),
  };
  all.push(record);
  await writeStore(ITEMS_FILE, all);
  return record;
}

export async function getStudentUnits(studentId: string): Promise<StudentUnit[]> {
  const all = await readStore<StudentUnit>(UNITS_FILE);
  return all.filter((r) => r.studentId === studentId);
}

export async function getStudentUnit(
  studentId: string,
  unitId: string
): Promise<StudentUnit | null> {
  const units = await getStudentUnits(studentId);
  return units.find((u) => u.unitId === unitId) ?? null;
}

/** Upserts the student-unit record. completedAt / verifiedAt are stamped the
 * first time their status is reached and never cleared afterwards — a Retake
 * keeps the original completion timestamp (the content WAS finished). */
export async function setUnitStatus(
  studentId: string,
  unitId: string,
  status: StudentUnitStatus
): Promise<StudentUnit> {
  const all = await readStore<StudentUnit>(UNITS_FILE);
  const now = new Date().toISOString();
  const idx = all.findIndex(
    (r) => r.studentId === studentId && r.unitId === unitId
  );

  if (idx === -1) {
    const record: StudentUnit = {
      studentId,
      unitId,
      status,
      completedAt: status === "completed" || status === "verified" ? now : null,
      verifiedAt: status === "verified" ? now : null,
      updatedAt: now,
    };
    all.push(record);
    await writeStore(UNITS_FILE, all);
    return record;
  }

  const existing = all[idx];
  all[idx] = {
    ...existing,
    status,
    completedAt:
      existing.completedAt ??
      (status === "completed" || status === "verified" ? now : null),
    verifiedAt: existing.verifiedAt ?? (status === "verified" ? now : null),
    updatedAt: now,
  };
  await writeStore(UNITS_FILE, all);
  return all[idx];
}
