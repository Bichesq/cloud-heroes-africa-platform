"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentBlock, KnowledgeCheck, StudentUnitStatus, TicketContext } from "@/types";
import UnitRail from "./UnitRail";
import ReadingView from "./ReadingView";
import KnowledgeCheckRunner from "./KnowledgeCheckRunner";
import RightPanel from "./RightPanel";
import ProgressFooter from "./ProgressFooter";

/* Unit view orchestrator — the canonical reading/TTS-first lesson screen.
 * Layout (mockup "Unit View (Reading - Learning Material)"): left learning
 * rail (collapsible = focus mode) · center content · right panel with the
 * secondary tabs (Lesson Script / Notes / Assignments / Help) that keep
 * non-essential material out of the main area (decision 2026-07-09).
 *
 * (2026-08-11: Section/Item are gone — a Unit is one flat reading (its own
 * contentBlocks) followed by zero or more Knowledge Checks, so the rail's
 * "views" collapse from a section/item tree down to just those two kinds.) */

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
  heroImage?: string;
  durationMin: number;
  tokensAward: number;
  contentBlocks: ContentBlock[];
};

type KcEntry = { kc: KnowledgeCheck; state: KcClientState };

type Props = {
  programId: string;
  programTitle: string;
  moduleId: string;
  moduleTitle: string;
  unit: UnitMeta;
  kcs: KcEntry[];
  initialView: string;
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
  kcs,
  initialView,
  initialUnitStatus,
  initialNote,
  assignments,
}: Props) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [unitStatus, setUnitStatus] = useState<StudentUnitStatus | null>(
    initialUnitStatus
  );
  const [kcStates, setKcStates] = useState<Record<string, KcClientState>>(() =>
    Object.fromEntries(kcs.map((k) => [k.kc.id, k.state]))
  );
  const [railCollapsed, setRailCollapsed] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  // Content is done once the unit has left "in_progress"/never-started — a
  // Retake still means the reading itself was finished, only the KC wasn't.
  const contentDone =
    unitStatus === "completed" || unitStatus === "verified" || unitStatus === "retake";
  const kcUnlocked = contentDone;

  const totalSteps = 1 + kcs.length;
  const doneSteps =
    (contentDone ? 1 : 0) + kcs.filter((k) => kcStates[k.kc.id]?.passed).length;
  const progressPct = Math.round((doneSteps / totalSteps) * 100);

  const helpContext: TicketContext = {
    programId,
    programTitle,
    moduleId,
    moduleTitle,
    unitId: unit.id,
    unitTitle: unit.title,
  };

  const selectView = useCallback((next: string) => {
    setView(next);
    // Keep the URL shareable/reload-safe without a server round-trip.
    window.history.replaceState(null, "", `?view=${next}`);
  }, []);

  /** "Go to Next" — completing the reading is the act of advancing. */
  async function completeAndAdvance() {
    if (advancing) return;

    if (!contentDone) {
      setAdvancing(true);
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unitId: unit.id }),
        });
        if (res.ok) {
          const data = (await res.json()) as { unitStatus: StudentUnitStatus };
          setUnitStatus(data.unitStatus);
        }
      } finally {
        setAdvancing(false);
      }
    }

    if (kcs[0]) selectView(kcs[0].kc.id);
    else router.push(`/programs/${programId}`);
  }

  /** Called by the KC runner after the attempts API records a result. */
  const onKcResult = useCallback(
    (kcId: string, passed: boolean, newStatus: StudentUnitStatus) => {
      setUnitStatus(newStatus);
      setKcStates((prev) => {
        const previous = prev[kcId];
        return {
          ...prev,
          [kcId]: {
            attemptCount: previous.attemptCount + 1,
            failRun: passed ? 0 : previous.failRun + 1,
            passed: previous.passed || passed,
          },
        };
      });
    },
    []
  );

  const currentKc = useMemo(
    () => kcs.find((k) => k.kc.id === view) ?? null,
    [kcs, view]
  );

  return (
    <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4 pt-4">
      <UnitRail
        unitTitle={unit.title}
        durationMin={unit.durationMin}
        kcs={kcs.map((k) => ({ id: k.kc.id, title: k.kc.title, questionCount: k.kc.questions.length }))}
        view={view}
        contentDone={contentDone}
        kcUnlocked={kcUnlocked}
        passedKcIds={new Set(kcs.filter((k) => kcStates[k.kc.id]?.passed).map((k) => k.kc.id))}
        collapsed={railCollapsed}
        onToggleCollapsed={() => setRailCollapsed((c) => !c)}
        onSelect={selectView}
      />

      {/* Center + right panel share one scrolling card row */}
      <div className="flex min-w-0 flex-1 gap-4">
        <div className="cha-card flex min-w-0 flex-1 flex-col overflow-y-auto rounded-2xl">
          {view === "content" ? (
            <ReadingView
              unit={unit}
              isCompleted={contentDone}
              hasKc={kcs.length > 0}
              advancing={advancing}
              onAdvance={completeAndAdvance}
            />
          ) : currentKc ? (
            <KnowledgeCheckRunner
              key={currentKc.kc.id}
              kc={currentKc.kc}
              initialState={kcStates[currentKc.kc.id]}
              unlocked={kcUnlocked}
              helpContext={helpContext}
              onResult={onKcResult}
              onExit={() => router.push(`/programs/${programId}`)}
            />
          ) : (
            <div className="p-10 text-cha-muted">This view isn&apos;t available.</div>
          )}

          <ProgressFooter progressPct={progressPct} unitStatus={unitStatus} />
        </div>

        <RightPanel
          unitTitle={unit.title}
          contentBlocks={unit.contentBlocks}
          unitId={unit.id}
          initialNote={initialNote}
          assignments={assignments}
          helpContext={helpContext}
        />
      </div>
    </div>
  );
}
