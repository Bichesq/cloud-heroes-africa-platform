"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import type { LpSection } from "@/types";

/* Left learning rail (mockup left panel): unit title, then sections with
 * their items and completion dots. Collapsing it is the focus mode the
 * design evaluation kept from the minimized-sidebar mockup; the toggle uses
 * the Student Hub line-with-arrow icon, not a hamburger (2026-07-16). */

type Props = {
  unitTitle: string;
  sections: LpSection[];
  selectedItemId: string;
  completed: Set<string>;
  kcUnlocked: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onSelect: (itemId: string) => void;
  programId: string;
};

const ITEM_TYPE_LABEL: Record<string, string> = {
  reading: "Reading",
  knowledge_check: "Assessment",
};

export default function SectionRail({
  unitTitle,
  sections,
  selectedItemId,
  completed,
  kcUnlocked,
  collapsed,
  onToggleCollapsed,
  onSelect,
}: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    // Open the section containing the selected item.
    const containing = sections.find((s) =>
      s.items.some((i) => i.id === selectedItemId)
    );
    return new Set(containing ? [containing.id] : sections.slice(0, 1).map((s) => s.id));
  });

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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

      <nav className="flex-1 px-3 pb-6">
        {[...sections]
          .sort((a, b) => a.order - b.order)
          .map((section) => {
            const open = openSections.has(section.id);
            const items = [...section.items].sort((a, b) => a.order - b.order);
            return (
              <div key={section.id} className="mt-2">
                <button
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cha-surface-2"
                >
                  {open ? (
                    <ChevronUp size={16} className="mt-1 shrink-0 text-cha-ocean" />
                  ) : (
                    <ChevronDown size={16} className="mt-1 shrink-0 text-cha-ocean" />
                  )}
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-cha-ocean">
                      Section {section.order}
                    </span>
                    <span className="block text-sm font-semibold leading-snug text-cha-ink">
                      {section.title}
                    </span>
                  </span>
                </button>

                {open && (
                  <ul className="mt-1 flex flex-col gap-0.5 pl-4">
                    {items.map((item) => {
                      const isKc = item.type === "knowledge_check";
                      const locked = isKc && !kcUnlocked && !completed.has(item.id);
                      const active = item.id === selectedItemId;
                      const done = completed.has(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => !locked && onSelect(item.id)}
                            disabled={locked}
                            aria-current={active ? "true" : undefined}
                            title={
                              locked
                                ? "Finish the unit content to unlock this Knowledge Check"
                                : undefined
                            }
                            className={`flex w-full items-start gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
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
                                {item.title}
                              </span>
                              <span className="block text-[11px] text-cha-faint">
                                {ITEM_TYPE_LABEL[item.type] ?? item.type} ·{" "}
                                {item.durationMin}mins
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
      </nav>
    </aside>
  );
}
