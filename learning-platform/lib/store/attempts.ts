import { randomUUID } from "crypto";
import type { KcAttempt } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-kc-attempts.json";

export async function getAttempts(
  studentId: string,
  kcId: string
): Promise<KcAttempt[]> {
  const all = await readStore<KcAttempt>(FILE);
  return all
    .filter((a) => a.studentId === studentId && a.kcId === kcId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function recordAttempt(params: {
  studentId: string;
  kcId: string;
  answers: Record<string, string | null>;
  score: number;
  passed: boolean;
}): Promise<KcAttempt> {
  const all = await readStore<KcAttempt>(FILE);
  const attemptNo =
    all.filter((a) => a.studentId === params.studentId && a.kcId === params.kcId)
      .length + 1;
  const attempt: KcAttempt = {
    id: randomUUID(),
    attemptNo,
    createdAt: new Date().toISOString(),
    ...params,
  };
  all.push(attempt);
  await writeStore(FILE, all);
  return attempt;
}
