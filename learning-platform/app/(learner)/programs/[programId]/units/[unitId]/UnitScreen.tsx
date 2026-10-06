import Breadcrumbs from "@/app/(learner)/components/Breadcrumbs";
import UnitShell from "./components/UnitShell";
import type { UnitContext } from "./load-unit";

/* Server-rendered frame shared by the unit route and its topic sub-routes —
 * breadcrumb row + the client UnitShell. `topicId` null = the unit route
 * (a flat, topic-less reading, or a Knowledge Check view). */

export default function UnitScreen({
  ctx,
  topicId,
  initialView,
}: {
  ctx: UnitContext;
  topicId: string | null;
  initialView: string;
}) {
  const { program, module, unit, studentUnit, note, kcs, assignments, completedTopicIds } = ctx;

  return (
    <div className="flex h-full flex-col">
      <Breadcrumbs moduleTitle={module.title} unitLabel={`Unit ${unit.order}`} />
      <UnitShell
        // Remount per topic so client state starts from the server's view.
        key={topicId ?? "unit"}
        programId={program.id}
        programTitle={program.title}
        moduleId={module.id}
        moduleTitle={module.title}
        unit={{
          id: unit.id,
          title: unit.title,
          order: unit.order,
          description: unit.description,
          heroImage: unit.heroImage,
          durationMin: unit.durationMin,
          tokensAward: unit.tokensAward,
          contentBlocks: unit.contentBlocks,
          topics: unit.topics,
        }}
        topicId={topicId}
        initialCompletedTopicIds={completedTopicIds}
        kcs={kcs}
        initialView={initialView}
        initialUnitStatus={studentUnit?.status ?? null}
        initialNote={note?.body ?? ""}
        assignments={assignments}
      />
    </div>
  );
}
