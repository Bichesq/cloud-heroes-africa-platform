"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { KnowledgeCheck, LpItem, LpSection, StudentUnitStatus, TicketContext } from "@/types";
import SectionRail from "./SectionRail";
import ReadingView from "./ReadingView";
import KnowledgeCheckRunner from "./KnowledgeCheckRunner";
import RightPanel from "./RightPanel";
import ProgressFooter from "./ProgressFooter";

/* Unit view orchestrator — the canonical reading/TTS-first lesson screen.
 * Layout (mockup "Unit View (Reading - Learning Material)"): left learning
 * rail (collapsible = focus mode) · center content · right panel with the
 * secondary tabs (Lesson Script / Notes / Assignments / Help) that keep
 * non-essential material out of the main area (decision 2026-07-09). */

export type KcClientState = {
  attemptCount: number;
  /** Consecutive fails since the last pass — 2 triggers escalation. */
  failRun: number;
  passed: boolean;
};

export type UnitMeta = {
  id: string;
  title: string;
  order: number;
  description: string;
  pointsAward: number;
};

type Props = {
  programId: string;
  programTitle: string;
  moduleId: string;
  moduleTitle: string;
  unit: UnitMeta;
  sections: LpSection[];
  kcMap: Record<string, { kc: KnowledgeCheck; state: KcClientState }>;
  initialItemId: string;
  initialCompleted: string[];
  initialUnitStatus: StudentUnitStatus | null;
  initialNote: string;
  assignments: { id: string; title: string; description: string }[];
};

export default function UnitShell({
  programId,
  programTitle,
  moduleId,
  moduleTitle,
  unit,
  sections,
  kcMap,
  initialItemId,
  initialCompleted,
  initialUnitStatus,
  initialNote,
  assignments,
}: Props) {
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState(initialItemId);
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(initialCompleted)
  );
  const [unitStatus, setUnitStatus] = useState<StudentUnitStatus | null>(
    initialUnitStatus
  );
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const orderedItems = useMemo(
    () =>
      [...sections]
        .sort((a, b) => a.order - b.order)
        .flatMap((s) =>
          [...s.items]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({ item, section: s }))
        ),
    [sections]
  );

  const current =
    orderedItems.find(({ item }) => item.id === selectedItemId) ?? orderedItems[0];
  const currentIndex = orderedItems.findIndex(
    ({ item }) => item.id === current.item.id
  );
  const nextEntry = orderedItems[currentIndex + 1] ?? null;

  const readingIds = orderedItems
    .filter(({ item }) => item.type === "reading")
    .map(({ item }) => item.id);
  const kcUnlocked = readingIds.every((id) => completed.has(id));

  const progressPct = Math.round(
    (orderedItems.filter(({ item }) => completed.has(item.id)).length /
      orderedItems.length) *
      100
  );

  const helpContext: TicketContext = {
    programId,
    programTitle,
    moduleId,
    moduleTitle,
    unitId: unit.id,
    unitTitle: unit.title,
  };

  const selectItem = useCallback(
    (itemId: string) => {
      setSelectedItemId(itemId);
      // Keep the URL shareable/reload-safe without a server round-trip.
      window.history.replaceState(null, "", `?item=${itemId}`);
    },
    []
  );

  /** "Go to Next Item" — completing a reading is the act of advancing. */
  async function completeAndAdvance() {
    if (advancing) return;
    const item = current.item;

    if (item.type === "reading" && !completed.has(item.id)) {
      setAdvancing(true);
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: item.id }),
        });
        if (res.ok) {
          const data = (await res.json()) as { unitStatus: StudentUnitStatus };
          setCompleted((prev) => new Set(prev).add(item.id));
          setUnitStatus(data.unitStatus);
        }
      } finally {
        setAdvancing(false);
      }
    }

    if (nextEntry) selectItem(nextEntry.item.id);
    else router.push(`/programs/${programId}`);
  }

  /** Called by the KC runner after the attempts API records a result. */
  const onKcResult = useCallback(
    (kcItemId: string, passed: boolean, newStatus: StudentUnitStatus) => {
      setUnitStatus(newStatus);
      if (passed) setCompleted((prev) => new Set(prev).add(kcItemId));
    },
    []
  );

  const currentKc =
    current.item.type === "knowledge_check" && current.item.kcId
      ? kcMap[current.item.kcId]
      : null;

  return (
    <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4 pt-4">
      <SectionRail
        unitTitle={unit.title}
        sections={sections}
        selectedItemId={current.item.id}
        completed={completed}
        kcUnlocked={kcUnlocked}
        collapsed={railCollapsed}
        onToggleCollapsed={() => setRailCollapsed((c) => !c)}
        onSelect={selectItem}
        programId={programId}
      />

      {/* Center + right panel share one scrolling card row */}
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="cha-card flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl">
          {current.item.type === "reading" ? (
            <ReadingView
              unit={unit}
              sectionTitle={current.section.title}
              sectionNumber={current.section.order}
              item={current.item}
              isCompleted={completed.has(current.item.id)}
              isLast={!nextEntry}
              advancing={advancing}
              onAdvance={completeAndAdvance}
            />
          ) : currentKc ? (
            <KnowledgeCheckRunner
              key={current.item.id}
              kcItemId={current.item.id}
              kc={currentKc.kc}
              initialState={currentKc.state}
              unlocked={kcUnlocked}
              unitStatus={unitStatus}
              helpContext={helpContext}
              onResult={onKcResult}
              onExit={() => router.push(`/programs/${programId}`)}
            />
          ) : (
            <div className="p-10 text-cha-muted">
              This item type isn&apos;t available yet.
            </div>
          )}

          <ProgressFooter progressPct={progressPct} unitStatus={unitStatus} />
        </div>

        <RightPanel
          currentItem={current.item as LpItem}
          unitId={unit.id}
          initialNote={initialNote}
          assignments={assignments}
          helpContext={helpContext}
        />
      </div>
    </div>
  );
}
