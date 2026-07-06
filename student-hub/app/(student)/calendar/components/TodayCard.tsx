"use client";

import { useState } from "react";
import { Clock, ExternalLink, X } from "lucide-react";
import AppCard from "@/components/ui/AppCard";
import type { CalendarPageData } from "../data/mock";

/**
 * Dismissible orange "Today" event card at the bottom of the rail.
 */
export default function TodayCard({
  event,
}: {
  event: CalendarPageData["todayEvent"];
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <AppCard variant="brand" className="max-w-[220px] gap-1 rounded-[22px]">
      <div className="flex items-start justify-between">
        <span className="font-display text-lg font-bold">Today</span>
        <button
          aria-label="Dismiss today's event"
          onClick={() => setDismissed(true)}
          className="grid h-5 w-5 place-items-center rounded-full bg-white/25 transition-colors hover:bg-white/40"
        >
          <X size={12} />
        </button>
      </div>

      <div className="mt-1 text-sm font-bold">{event.title}</div>
      <div className="flex items-center gap-1.5 text-xs opacity-90">
        <Clock size={12} /> {event.time}
      </div>
      <a
        href={event.link}
        target="_blank"
        rel="noopener noreferrer"
        className="truncate text-xs underline opacity-90 hover:opacity-100"
      >
        {event.link.replace("https://", "")}
      </a>
      <button className="mt-1 flex items-center gap-1 self-start text-xs font-semibold underline">
        Edit <ExternalLink size={10} />
      </button>
    </AppCard>
  );
}
