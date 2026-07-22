import { promises as fs } from "fs";
import path from "path";
import { localDataPath } from "@/lib/shared-data";

/* Minimal JSON-file persistence for LP-owned aggregates (learning-platform/
 * data/*.json). Each store module wraps these with typed, domain-named
 * functions — swapping to Postgres (docs/learning-platform/schema.sql)
 * replaces only these modules. */

export async function readStore<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(localDataPath(file), "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function writeStore<T>(file: string, records: T[]): Promise<void> {
  const target = localDataPath(file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, JSON.stringify(records, null, 2));
}
