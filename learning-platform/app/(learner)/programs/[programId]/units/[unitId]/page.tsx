import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Breadcrumbs from "@/app/(learner)/components/Breadcrumbs";
import { currentStudent } from "@/lib/current-student";
import { getAssessments, getKnowledgeCheck, getProgram } from "@/lib/store/catalog";
import { getStudentItems, getStudentUnit } from "@/lib/store/progress";
import { getPointsEntries } from "@/lib/store/points";
import { getAttempts } from "@/lib/store/attempts";
import { getNote } from "@/lib/store/notes";
import { flattenItems, nextItem, pointsBalance } from "@/lib/lp-utils";
import type { KnowledgeCheck } from "@/types";
import UnitShell, { type KcClientState } from "./components/UnitShell";

export const metadata: Metadata = {
  title: "Unit — Cloud Heroes Africa Learning Platform",
};

export default async function UnitPage({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string; unitId: string }>;
  searchParams: Promise<{ item?: string }>;
}) {
  const [{ programId, unitId }, { item: requestedItemId }] = await Promise.all([
    params,
    searchParams,
  ]);

  const student = await currentStudent();
  if (!student) redirect("/SignIn");

  const program = await getProgram(programId);
  const module = program?.modules.find((m) => m.units.some((u) => u.id === unitId));
  const unit = module?.units.find((u) => u.id === unitId);
  if (!program || !module || !unit) notFound();

  const [studentItems, studentUnit, points, note, assessments] =
    await Promise.all([
      getStudentItems(student.id),
      getStudentUnit(student.id, unitId),
      getPointsEntries(student.id),
      getNote(student.id, unitId),
      getAssessments(),
    ]);

  // Points gate — locked units are never reachable by URL either.
  const balance = pointsBalance(points);
  if (!studentUnit && balance < unit.pointsRequired) {
    redirect(`/programs/${program.id}`);
  }

  const completedItemIds = studentItems.map((i) => i.itemId);

  // Knowledge-check definitions + per-KC attempt state for this unit.
  const kcItems = flattenItems(unit).filter((i) => i.type === "knowledge_check");
  const kcEntries = await Promise.all(
    kcItems.map(async (item) => {
      if (!item.kcId) return null;
      const [kc, attempts] = await Promise.all([
        getKnowledgeCheck(item.kcId),
        getAttempts(student.id, item.kcId),
      ]);
      if (!kc) return null;
      let failRun = 0;
      for (const a of attempts) failRun = a.passed ? 0 : failRun + 1;
      const state: KcClientState = {
        attemptCount: attempts.length,
        failRun,
        passed: attempts.some((a) => a.passed),
      };
      return [item.kcId, { kc, state }] as const;
    })
  );
  const kcMap: Record<string, { kc: KnowledgeCheck; state: KcClientState }> = {};
  for (const entry of kcEntries) if (entry) kcMap[entry[0]] = entry[1];

  // Module-scoped standalone assessments → Assignments tab stub list.
  const assignments = assessments
    .filter(
      (a) =>
        a.kind === "standalone" &&
        ((a.scope === "module" && a.scopeId === module.id) ||
          (a.scope === "unit" && a.scopeId === unit.id) ||
          (a.scope === "program" && a.scopeId === program.id))
    )
    .map((a) => ({ id: a.id, title: a.title, description: a.description }));

  const completedSet = new Set(completedItemIds);
  const initialItemId =
    (requestedItemId &&
      flattenItems(unit).find((i) => i.id === requestedItemId)?.id) ||
    nextItem(unit, completedSet)?.id ||
    flattenItems(unit)[0]?.id;

  if (!initialItemId) notFound(); // authoring error — a unit with no items

  return (
    <div className="flex h-full flex-col">
      <Breadcrumbs moduleTitle={module.title} unitLabel={`Unit ${unit.order}`} />
      <UnitShell
        programId={program.id}
        programTitle={program.title}
        moduleId={module.id}
        moduleTitle={module.title}
        unit={{
          id: unit.id,
          title: unit.title,
          order: unit.order,
          description: unit.description,
          pointsAward: unit.pointsAward,
        }}
        sections={unit.sections}
        kcMap={kcMap}
        initialItemId={initialItemId}
        initialCompleted={completedItemIds}
        initialUnitStatus={studentUnit?.status ?? null}
        initialNote={note?.body ?? ""}
        assignments={assignments}
      />
    </div>
  );
}
