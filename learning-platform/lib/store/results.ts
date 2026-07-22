import { randomUUID } from "crypto";
import type { AssessmentResult } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-assessment-results.json";

export async function getResults(
  studentId: string,
  assessmentId?: string
): Promise<AssessmentResult[]> {
  const all = await readStore<AssessmentResult>(FILE);
  return all.filter(
    (r) =>
      r.studentId === studentId &&
      (assessmentId === undefined || r.assessmentId === assessmentId)
  );
}

export async function recordResult(params: {
  studentId: string;
  assessmentId: string;
  score: number;
  level: string | null;
  detail?: unknown;
}): Promise<AssessmentResult> {
  const all = await readStore<AssessmentResult>(FILE);
  const result: AssessmentResult = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    ...params,
  };
  all.push(result);
  await writeStore(FILE, all);
  return result;
}
