import { promises as fs } from "fs";
import path from "path";
import type { Program, UnitCompletion } from "@/types";

/* JSON-file store for programs (static seed content) and unit completions
 * (student-generated). Isolated here so a future real-LMS integration only
 * needs to replace this file's I/O — lib/curriculum-utils.ts (the pure
 * stats/next-unit logic) and every dashboard consumer stay unchanged. */

const PROGRAMS_FILE = path.join(process.cwd(), "data", "programs.json");
const PROGRESS_FILE = path.join(process.cwd(), "data", "progress.json");

export const DEFAULT_PROGRAM_ID = "cloud-practitioner";

async function readPrograms(): Promise<Program[]> {
  try {
    const raw = await fs.readFile(PROGRAMS_FILE, "utf-8");
    return JSON.parse(raw) as Program[];
  } catch {
    return [];
  }
}

export async function getProgram(programId: string): Promise<Program | null> {
  const programs = await readPrograms();
  return programs.find((p) => p.id === programId) ?? null;
}

async function readAllCompletions(): Promise<UnitCompletion[]> {
  try {
    const raw = await fs.readFile(PROGRESS_FILE, "utf-8");
    return JSON.parse(raw) as UnitCompletion[];
  } catch {
    return [];
  }
}

export async function getCompletions(studentId: string): Promise<UnitCompletion[]> {
  const all = await readAllCompletions();
  return all.filter((c) => c.studentId === studentId);
}

/** Records a unit as complete. Idempotent — completing an already-complete
 * unit is a no-op (returns the existing record). */
export async function markUnitComplete(
  studentId: string,
  unitId: string
): Promise<UnitCompletion> {
  const all = await readAllCompletions();
  const existing = all.find((c) => c.studentId === studentId && c.unitId === unitId);
  if (existing) return existing;

  const entry: UnitCompletion = {
    studentId,
    unitId,
    completedAt: new Date().toISOString(),
  };
  all.push(entry);
  await fs.mkdir(path.dirname(PROGRESS_FILE), { recursive: true });
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(all, null, 2));
  return entry;
}
