import { promises as fs } from "fs";
import path from "path";
import type { LearningEvent } from "@/types";

/* Read-only JSON-file store for the shared events calendar (seed/admin
 * content — students don't create events in this POC). */

const FILE = path.join(process.cwd(), "data", "events.json");

export async function getEvents(): Promise<LearningEvent[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as LearningEvent[];
  } catch {
    return [];
  }
}
