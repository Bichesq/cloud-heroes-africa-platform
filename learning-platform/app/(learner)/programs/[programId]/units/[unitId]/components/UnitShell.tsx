"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ContentBlock,
  KnowledgeCheck,
  StudentUnitStatus,
  TicketContext,
  UnitTopic,
} from "@/types";
import UnitRail from "./UnitRail";
import ReadingView from "./ReadingView";
import KnowledgeCheckRunner from "./KnowledgeCheckRunner";
import RightPanel from "./RightPanel";
import ProgressFooter from "./ProgressFooter";
import { unitProgressPct } from "@/lib/topic-progress";

/* Unit view orchestrator — the canonical reading/TTS-first lesson screen.
 * Layout (Figma "Unit View (Reading - Learning Material)" frames): left
 * learning rail (collapsible = focus mode) · center content · right panel
 * with the secondary tabs (Notes / Assignments / Help).
 *
 * 2026-09-23 (plan step 3): the right panel's "Lesson Script" tab is gone —
 * it re-rendered the same reading already shown in the center (Sept 21
 * decision). And a Unit's reading can now be split into Topics, each its own
 * route (`units/[unitId]/topics/[topicId]`) with Previous/Next between them;
 * a unit without Topics is still one flat reading on the unit route. Knowledge
 * Check views always live on the unit route (`?view=<kcId>`). */

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
  topics: UnitTopic[];
};

type KcEntry = { kc: KnowledgeCheck; state: KcClientState };

type Props = {
  programId: string;
  programTitle: string;
  moduleId: string;
  moduleTitle: string;
  unit: UnitMeta;
  /** Set on a topic route; null on the unit route. */
  topicId: string | null;
  /** Topics this student has completed (pressed Next on), from the server. */
  initialCompletedTopicIds: string[];
  kcs: KcEntry[];
  initialView: string;
  initialUnitStatus: StudentUnitStatus | null;
  initialNote: string;
  assignments: { id: string; title: string; description: string }[];
};

/** Blocks shown for one topic. Blocks not tagged with a navigable topic
 * (untagged, or tagged with a tag-only topic) lead the first topic so no
 * authored content is ever unreachable. */
function blocksForTopic(unit: UnitMeta, topicIndex: number): ContentBlock[] {
  const topic = unit.topics[topicIndex];
  if (!topic) return unit.contentBlocks;
  const navigable = new Set(unit.topics.map((t) => t.id));
  return unit.contentBlocks.filter((b) =>
    b.topicId === topic.id ||
    (topicIndex === 0 && (b.topicId === null || !navigable.has(b.topicId)))
  );
}

export default function UnitShell({
  programId,
  programTitle,
  moduleId,
  moduleTitle,
  unit,
  topicId,
  initialCompletedTopicIds,
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
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(
    () => new Set(initialCompletedTopicIds)
  );

  const unitHref = `/programs/${programId}/units/${unit.id}`;
  const topicHref = useCallback(
    (id: string) => `${unitHref}/topics/${id}`,
    [unitHref]
  );

  const topicIndex = topicId ? unit.topics.findIndex((t) => t.id === topicId) : -1;
  const topic = topicIndex >= 0 ? unit.topics[topicIndex] : null;
  const isLastTopic = unit.topics.length === 0 || topicIndex === unit.topics.length - 1;
  const readingBlocks = useMemo(
    () => blocksForTopic(unit, Math.max(topicIndex, 0)),
    [unit, topicIndex]
  );

  // Content is done once the unit has left "in_progress"/never-started — a
  // Retake still means the reading itself was finished, only the KC wasn't.
  const contentDone =
    unitStatus === "completed" || unitStatus === "verified" || unitStatus === "retake";
  const kcUnlocked = contentDone;

  // Per-topic progress (plan 2026-09-24-per-topic-unit-progress): each
  // completed topic fills an equal slice of the reading share (90% when the
  // unit has a KC); only a passed KC takes the bar to 100%.
  const completedCount = unit.topics.filter((t) => completedTopicIds.has(t.id)).length;
  const passedKcs = kcs.filter((k) => kcStates[k.kc.id]?.passed).length;
  const progressPct = unitProgressPct({
    topicCount: unit.topics.length,
    completedTopicCount: completedCount,
    contentDone,
    kcCount: kcs.length,
    passedKcCount: passedKcs,
  });

  const helpContext: TicketContext = {
    programId,
    programTitle,
    moduleId,
    moduleTitle,
    unitId: unit.id,
    unitTitle: unit.title,
  };

  const selectView = useCallback(
    (next: string) => {
      if (next === "content") {
        // A topic-split unit's reading lives on its topic routes.
        const first = unit.topics[0];
        if (first && !topicId) return router.push(topicHref(first.id));
        if (topicId) {
          setView("content");
          return;
        }
      } else if (topicId) {
        // KC views live on the unit route.
        return router.push(`${unitHref}?view=${next}`);
      }
      setView(next);
      // Keep the URL shareable/reload-safe without a server round-trip.
      window.history.replaceState(null, "", `?view=${next}`);
    },
    [router, topicHref, topicId, unit.topics, unitHref]
  );

  /** Next on the last topic (or a topic-less reading) — completing the
   * reading is the act of advancing. Request shape unchanged from before. */
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

  /** Next on a topic: record it as completed (the server completes the unit
   * once every topic is done), then move on. Topic-less units keep using
   * completeAndAdvance / POST /api/progress. */
  async function goNext() {
    if (!topic) return void completeAndAdvance();
    if (advancing) return;

    setAdvancing(true);
    let status = unitStatus;
    let done = completedTopicIds;
    try {
      const res = await fetch("/api/progress/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: unit.id, topicId: topic.id }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          completedTopicIds: string[];
          unitStatus: StudentUnitStatus | null;
        };
        done = new Set(data.completedTopicIds);
        status = data.unitStatus;
        setCompletedTopicIds(done);
        setUnitStatus(status);
      }
    } finally {
      setAdvancing(false);
    }

    if (!isLastTopic) return router.push(topicHref(unit.topics[topicIndex + 1].id));

    const readingDone = status === "completed" || status === "verified" || status === "retake";
    if (!readingDone) {
      // Topics were skipped — send the learner to the first unfinished one
      // rather than to a still-locked Knowledge Check.
      const firstOpen = unit.topics.find((t) => !done.has(t.id));
      if (firstOpen) return router.push(topicHref(firstOpen.id));
    }
    if (kcs[0]) selectView(kcs[0].kc.id);
    else router.push(`/programs/${programId}`);
  }

  const prevHref = topicIndex > 0 ? topicHref(unit.topics[topicIndex - 1].id) : null;
  const nextLabel = !isLastTopic
    ? "Next"
    : kcs.length > 0
      ? "Knowledge Check"
      : "Finish unit";

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
        unitOrder={unit.order}
        durationMin={unit.durationMin}
        topics={unit.topics.map((t, i) => ({
          id: t.id,
          name: t.name,
          href: topicHref(t.id),
          blocks: blocksForTopic(unit, i),
        }))}
        activeTopicId={view === "content" ? topicId : null}
        completedTopicIds={completedTopicIds}
        kcs={kcs.map((k) => ({ id: k.kc.id, title: k.kc.title, questionCount: k.kc.questionsPerAttempt }))}
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
        {/* The card itself doesn't scroll — its content area does — so the
            progress bar pinned in the bottom-right corner (Figma "Unit View
            (Reading - Learning Material)" ProgressBar) is visible at all times. */}
        <div className="cha-card flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl">
          <div className="min-h-0 flex-1 overflow-y-auto">
          {view === "content" ? (
            <ReadingView
              key={topicId ?? "unit"}
              unit={unit}
              topic={topic}
              topicNumber={topicIndex + 1}
              topicCount={unit.topics.length}
              blocks={readingBlocks}
              isCompleted={contentDone}
              advancing={advancing}
              prevHref={prevHref}
              nextLabel={nextLabel}
              onNext={() => void goNext()}
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
          </div>

          <ProgressFooter progressPct={progressPct} unitStatus={unitStatus} />
        </div>

        <RightPanel
          unitId={unit.id}
          initialNote={initialNote}
          assignments={assignments}
          helpContext={helpContext}
        />
      </div>
    </div>
  );
}
