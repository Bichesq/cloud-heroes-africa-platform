"use client";

import {
  CheckCircle2,
  Circle,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

/* Left learning rail (mockup left panel): unit title, then the unit's views —
 * its reading content, then its Knowledge Check(s). Collapsing it is the
 * focus mode the design evaluation kept from the minimized-sidebar mockup;
 * the toggle uses the Student Hub line-with-arrow icon, not a hamburger
 * (2026-07-16).
 *
 * (2026-08-11: Section/Item are gone, so there is no more section grouping
 * to expand/collapse — a Unit only ever has one reading view plus its KCs.) */

type Props = {
  unitTitle: string;
  durationMin: number;
  kcs: { id: string; title: string; questionCount: number }[];
  view: string;
  contentDone: boolean;
  kcUnlocked: boolean;
  passedKcIds: Set<string>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (view: string) => void;
};

export default function UnitRail({
  unitTitle,
  durationMin,
  kcs,
  view,
  contentDone,
  kcUnlocked,
  passedKcIds,
  collapsed,
  onToggleCollapsed,
  onSelect,
}: Props) {
  if (collapsed) {
    return (
      <div className="cha-card flex w-[64px] shrink-0 flex-col items-center rounded-2xl py-4">
        <button
          onClick={onToggleCollapsed}
          aria-label="Expand learning rail"
          className="grid h-10 w-10 place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2 hover:text-cha-ink"
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside className="cha-card flex w-[320px] shrink-0 flex-col overflow-y-auto rounded-2xl">
      <div className="flex items-start justify-between gap-2 px-6 pb-2 pt-6">
        <h2 className="font-display text-2xl font-extrabold leading-tight">
          {unitTitle}
        </h2>
        <button
          onClick={onToggleCollapsed}
          aria-label="Collapse learning rail (focus mode)"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2 hover:text-cha-ink"
        >
          <PanelLeftClose size={17} />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 pb-6">
        <RailItem
          label="Unit content"
          meta={`Reading · ${durationMin}mins`}
          active={view === "content"}
          done={contentDone}
          locked={false}
          onSelect={() => onSelect("content")}
        />

        {kcs.map((kc) => {
          const done = passedKcIds.has(kc.id);
          const locked = !kcUnlocked && !done;
          return (
            <RailItem
              key={kc.id}
              label={kc.title}
              meta={`Assessment · ${kc.questionCount} questions`}
              active={view === kc.id}
              done={done}
              locked={locked}
              onSelect={() => onSelect(kc.id)}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function RailItem({
  label,
  meta,
  active,
  done,
  locked,
  onSelect,
}: {
  label: string;
  meta: string;
  active: boolean;
  done: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={() => !locked && onSelect()}
      disabled={locked}
      aria-current={active ? "true" : undefined}
      title={locked ? "Finish the unit content to unlock this Knowledge Check" : undefined}
      className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
        active
          ? "bg-cha-orange-soft dark:bg-cha-orange/15"
          : locked
            ? "cursor-not-allowed opacity-55"
            : "hover:bg-cha-surface-2"
      }`}
    >
      {done ? (
        <CheckCircle2
          size={16}
          className="mt-0.5 shrink-0 fill-cha-orange text-white dark:text-cha-surface"
        />
      ) : locked ? (
        <Lock size={14} className="mt-1 shrink-0 text-cha-faint" />
      ) : (
        <Circle size={15} className="mt-0.5 shrink-0 text-cha-faint" />
      )}
      <span className="min-w-0">
        <span
          className={`block text-[13.5px] leading-snug ${
            active ? "font-bold text-cha-ink" : "font-medium text-cha-ink"
          }`}
        >
          {label}
        </span>
        <span className="block text-[11px] text-cha-faint">{meta}</span>
      </span>
    </button>
  );
}
