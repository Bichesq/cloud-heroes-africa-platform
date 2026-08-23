import type { Escalation } from "@/types";
import { prisma } from "@/lib/prisma";

/** Records that a team member should follow up — second KC failure
 * (2026-05-21 working assumption) or repeated standalone-assessment
 * failure (2026-08-11, §6). The actual notification channel is an open
 * decision — this store is the extension point. */
export async function recordEscalation(params: {
  studentId: string;
  kind: Escalation["kind"];
  refId: string;
  payload: Escalation["payload"];
}): Promise<Escalation> {
  const row = await prisma.lpEscalation.create({
    data: {
      studentId: params.studentId,
      kind: params.kind,
      refId: params.refId,
      payload: params.payload,
    },
  });
  return {
    id: row.id,
    studentId: row.studentId,
    kind: row.kind as Escalation["kind"],
    refId: row.refId,
    payload: row.payload as Escalation["payload"],
    acknowledged: row.acknowledged,
    createdAt: row.createdAt.toISOString(),
  };
}
