import type { LearningEvent } from "@/types";
import { prisma } from "./prisma";

/* Shared events calendar (seed/admin content — students don't create events
 * in this POC). Prisma-backed (model in
 * prisma-shared/student-hub-local-models.prisma) — replaces
 * student-hub/data/events.json per
 * docs/plan/2026-08-23-centralize-shared-data.md. */

export async function getEvents(): Promise<LearningEvent[]> {
  const rows = await prisma.event.findMany();
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description,
    start: r.start.toISOString(),
    end: r.end.toISOString(),
    link: r.link,
  }));
}
