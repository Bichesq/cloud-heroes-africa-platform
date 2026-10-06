import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loadUnitContext } from "./load-unit";
import UnitScreen from "./UnitScreen";

export const metadata: Metadata = {
  title: "Unit — Cloud Heroes Africa Learning Platform",
};

/* Unit route. A unit broken into Topics (Sept 21 decision) is read one topic
 * per route (`topics/[topicId]`), so its reading view redirects to the first
 * topic; this route then only serves the Knowledge Check views (`?view=<kcId>`).
 * A unit with no Topics still renders its flat reading here, as before. */

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string; unitId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const [{ programId, unitId }, { view: requestedView }] = await Promise.all([
    params,
    searchParams,
  ]);

  const ctx = await loadUnitContext(programId, unitId);

  const kcView =
    requestedView && ctx.kcs.some((k) => k.kc.id === requestedView)
      ? requestedView
      : null;

  const firstTopic = ctx.unit.topics[0];
  if (!kcView && firstTopic) {
    redirect(`/programs/${ctx.program.id}/units/${ctx.unit.id}/topics/${firstTopic.id}`);
  }

  return <UnitScreen ctx={ctx} topicId={null} initialView={kcView ?? "content"} />;
}
