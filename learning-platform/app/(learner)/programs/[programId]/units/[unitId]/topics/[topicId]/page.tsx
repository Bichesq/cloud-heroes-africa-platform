import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadUnitContext } from "../../load-unit";
import UnitScreen from "../../UnitScreen";

export const metadata: Metadata = {
  title: "Topic — Cloud Heroes Africa Learning Platform",
};

/* One Topic of a Unit (Sept 21 Unit → Topic decision; plan 2026-09-23 step 3).
 * Runs the unit's full access gates via loadUnitContext, then only accepts a
 * topicId that belongs to *this* unit — `unit.topics` is loaded through the
 * unit's own relation, so a topic id from another unit/program simply isn't
 * found (SECURITY.md §3: URL ids are attacker-controlled; default deny). */

export default async function TopicPage({
  params,
}: {
  params: Promise<{ programId: string; unitId: string; topicId: string }>;
}) {
  const { programId, unitId, topicId } = await params;

  const ctx = await loadUnitContext(programId, unitId);
  const topic = ctx.unit.topics.find((t) => t.id === topicId);
  if (!topic) notFound();

  return <UnitScreen ctx={ctx} topicId={topic.id} initialView="content" />;
}
