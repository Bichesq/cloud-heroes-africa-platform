import type { UnitNote } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-notes.json";

/* One free-text note per (student, unit) — deliberately simple for V1
 * (plan §8: notes can be a simple store). */

export async function getNote(
  studentId: string,
  unitId: string
): Promise<UnitNote | null> {
  const all = await readStore<UnitNote>(FILE);
  return (
    all.find((n) => n.studentId === studentId && n.unitId === unitId) ?? null
  );
}

export async function saveNote(
  studentId: string,
  unitId: string,
  body: string
): Promise<UnitNote> {
  const all = await readStore<UnitNote>(FILE);
  const note: UnitNote = {
    studentId,
    unitId,
    body,
    updatedAt: new Date().toISOString(),
  };
  const idx = all.findIndex(
    (n) => n.studentId === studentId && n.unitId === unitId
  );
  if (idx === -1) all.push(note);
  else all[idx] = note;
  await writeStore(FILE, all);
  return note;
}
