"use client";

import Link from "next/link";
import { Button, Tooltip } from "@heroui/react";
import {
  CheckCircle2,
  Circle,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { ContentBlock } from "@/types";
import { blocksToScript } from "@/lib/tts/serialize";

/* Left learning rail (Figma "Unit View (Reading …)" left panel): unit title,
 * the unit's Topics (each "Reading · N mins", ticked individually as the
 * student completes it — the Figma rail's per-item tick, plan
 * 2026-09-24-per-topic-unit-progress), then its Knowledge Check(s)
 * ("Assessment · N questions").
 * Collapsing it is the focus mode from the "Minimized Side Bar" frame; the
 * toggle is the line-with-arrow icon, not a hamburger (2026-07-16).
 *
 * The Figma rail also groups items under "Section N" headings — Section is
 * deliberately not a schema level (Program → Module → Unit hierarchy
 * decision), so topics are listed directly under the unit. A unit without
 * Topics shows a single "Unit content" item, as before. */

type RailTopic = { id: string; name: string; href: string; blocks: ContentBlock[] };

type Props = {
  unitTitle: string;
  unitOrder: number;
  durationMin: number;
  topics: RailTopic[];
  activeTopicId: string | null;
  completedTopicIds: Set<string>;
  kcs: { id: string; title: string; questionCount: number }[];
  view: string;
  contentDone: boolean;
  kcUnlocked: boolean;
  passedKcIds: Set<string>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (view: string) => void;
};

/** ~200 wpm reading estimate for a topic, never below 1 minute. */
function readingMinutes(blocks: ContentBlock[]): number {
  const words = blocksToScript(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function UnitRail({
  unitTitle,
  unitOrder,
  durationMin,
  topics,
  activeTopicId,
  completedTopicIds,
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
        <Button
          isIconOnly
          variant="ghost"
          aria-label="Expand learning rail"
          onPress={onToggleCollapsed}
        >
          <PanelLeftOpen size={18} />
        </Button>
      </div>
    );
  }

  // A completed/verified/retake unit shows every topic done, which also
  // covers learners who finished the unit before per-topic tracking existed.
  const isTopicDone = (id: string) => contentDone || completedTopicIds.has(id);
  const doneCount = topics.filter((t) => isTopicDone(t.id)).length;

  return (
    <aside className="cha-card flex w-[320px] shrink-0 flex-col overflow-y-auto rounded-2xl">
      <div className="flex items-start justify-between gap-2 px-6 pb-2 pt-6">
        <h2 className="font-display text-2xl font-extrabold leading-tight">
          <span className="text-cha-orange">Unit {unitOrder}: </span>
          {unitTitle}
        </h2>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Collapse learning rail (focus mode)"
          onPress={onToggleCollapsed}
        >
          <PanelLeftClose size={17} />
        </Button>
      </div>

      {topics.length > 0 && (
        <div className="flex items-center justify-between px-6 pb-2 text-[12px] font-semibold text-cha-faint">
          <span>{topics.length} Topics</span>
          <span>
            {doneCount}/{topics.length} Done
          </span>
        </div>
      )}

      <nav aria-label="Unit contents" className="flex flex-col gap-0.5 px-3 pb-6">
        {topics.length > 0 ? (
          topics.map((t) => (
            <RailItem
              key={t.id}
              label={t.name}
              meta={`Reading · ${readingMinutes(t.blocks)}mins`}
              active={activeTopicId === t.id}
              done={isTopicDone(t.id)}
              locked={false}
              href={t.href}
            />
          ))
        ) : (
          <RailItem
            label="Unit content"
            meta={`Reading · ${durationMin}mins`}
            active={view === "content"}
            done={contentDone}
            locked={false}
            onSelect={() => onSelect("content")}
          />
        )}

        {kcs.map((kc) => {
          const done = passedKcIds.has(kc.id);
          const locked = !kcUnlocked && !done;
          return (
            <RailItem
              key={kc.id}
              label={`Knowledge Check: ${kc.title}`}
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

/* Custom composition: a HeroUI ListBox would own selection state, but these
 * rows are navigation (links / view switches), so they stay plain
 * links/buttons with CHA tokens. */
function RailItem({
  label,
  meta,
  active,
  done,
  locked,
  href,
  onSelect,
}: {
  label: string;
  meta: string;
  active: boolean;
  done: boolean;
  locked: boolean;
  href?: string;
  onSelect?: () => void;
}) {
  const className = `flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left outline-none transition-colors focus-visible:ring-4 focus-visible:ring-cha-blue/15 ${
    active
      ? "bg-cha-orange-soft dark:bg-cha-orange/15"
      : locked
        ? "cursor-not-allowed opacity-55"
        : "hover:bg-cha-surface-2"
  }`;

  const body = (
    <>
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
          className={`block text-[13.5px] leading-snug text-cha-ink ${
            active ? "font-bold" : "font-medium"
          }`}
        >
          {label}
        </span>
        <span className="block text-[11px] text-cha-faint">{meta}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-current={active ? "page" : undefined} className={className}>
        {body}
      </Link>
    );
  }

  const button = (
    <button
      type="button"
      onClick={() => !locked && onSelect?.()}
      disabled={locked}
      aria-current={active ? "true" : undefined}
      className={className}
    >
      {body}
    </button>
  );

  if (!locked) return button;
  return (
    <Tooltip delay={200}>
      <Tooltip.Trigger>{button}</Tooltip.Trigger>
      <Tooltip.Content>Finish the unit content to unlock this Knowledge Check</Tooltip.Content>
    </Tooltip>
  );
}
