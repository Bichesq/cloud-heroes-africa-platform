import type { UnitGoal } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-goals.json";

export async function getGoals(studentId: string): Promise<UnitGoal[]> {
  const all = await readStore<UnitGoal>(FILE);
  return all.filter((g) => g.studentId === studentId);
}

/** One goal per (student, unit) — re-setting replaces the target date. */
export async function setGoal(
  studentId: string,
  unitId: string,
  targetDate: string
): Promise<UnitGoal> {
  const all = await readStore<UnitGoal>(FILE);
  const now = new Date().toISOString();
  const idx = all.findIndex(
    (g) => g.studentId === studentId && g.unitId === unitId
  );
  const goal: UnitGoal = { studentId, unitId, targetDate, setAt: now };
  if (idx === -1) all.push(goal);
  else all[idx] = goal;
  await writeStore(FILE, all);
  return goal;
}

export async function removeGoal(
  studentId: string,
  unitId: string
): Promise<void> {
  const all = await readStore<UnitGoal>(FILE);
  await writeStore(
    FILE,
    all.filter((g) => !(g.studentId === studentId && g.unitId === unitId))
  );
}
