"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import AppCard from "@/components/ui/AppCard";
import type { EventCategory } from "../data/mock";

/**
 * Event-category filter card. Each row is a toggle: the leading radio
 * dot fills CHA blue when the category is visible, and the small
 * colored dot uses the category's status token.
 */
export default function CategoriesCard({
  categories,
}: {
  categories: EventCategory[];
}) {
  const [active, setActive] = useState<Set<string>>(
    () => new Set(categories.slice(0, 1).map((c) => c.id)),
  );

  const toggle = (id: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AppCard variant="sunken" className="gap-3.5">
      <span className="flex items-center gap-1.5 self-start rounded-full bg-cha-surface px-3 py-1.5 text-xs font-semibold text-cha-ink shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <Settings2 size={13} /> Categories
      </span>

      <div className="flex flex-col gap-2.5">
        {categories.map((cat) => {
          const on = active.has(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              aria-pressed={on}
              className="flex items-center gap-2.5 text-left text-[13px] font-medium text-cha-ink"
            >
              <span
                className={`h-4 w-4 rounded-full border transition-colors ${
                  on
                    ? "border-cha-blue bg-cha-blue"
                    : "border-cha-border bg-cha-surface"
                }`}
              />
              <span className={`h-2 w-2 rounded-full ${cat.dotClass}`} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </AppCard>
  );
}
