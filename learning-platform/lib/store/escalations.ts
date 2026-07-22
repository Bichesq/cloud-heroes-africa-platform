import { randomUUID } from "crypto";
import type { Escalation } from "@/types";
import { readStore, writeStore } from "./json-store";

const FILE = "lp-escalations.json";

/** Records that a team member should follow up (2026-05-21 working
 * assumption: second KC failure). The actual notification channel is an
 * open decision — this store is the extension point. */
export async function recordEscalation(params: {
  studentId: string;
  kind: Escalation["kind"];
  refId: string;
  payload: Escalation["payload"];
}): Promise<Escalation> {
  const all = await readStore<Escalation>(FILE);
  const escalation: Escalation = {
    id: randomUUID(),
    acknowledged: false,
    createdAt: new Date().toISOString(),
    ...params,
  };
  all.push(escalation);
  await writeStore(FILE, all);
  return escalation;
}
