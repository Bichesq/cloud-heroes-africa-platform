"use client";

import type { HelpCategory } from "@/types";
import { CATEGORY_ICONS } from "@/lib/help-icons";

/**
 * Keyboard-accessible category card. Selecting one is functionally
 * meaningful (not just a color change) — SupportView uses the selection to
 * filter FAQs/search, relabel the escalation CTA per desk, and prefill the
 * open-ticket modal (help2.md gap-closure #4/#8/#9).
 */
export default function CategoryCard({
  category,
  active,
  onSelect,
}: {
  category: HelpCategory;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = CATEGORY_ICONS[category.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${category.label}. ${category.blurb}`}
      className={`flex min-h-[132px] flex-col items-start justify-between rounded-2xl p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cha-blue ${
        active
          ? "bg-cha-orange text-white"
          : "bg-cha-surface text-cha-ink hover:bg-cha-surface-2"
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
          active ? "bg-white/15 text-white" : "bg-cha-eclipse text-white"
        }`}
      >
        {Icon && <Icon size={20} />}
      </span>
      <span className="text-[14.5px] font-bold leading-snug">{category.label}</span>
    </button>
  );
}
