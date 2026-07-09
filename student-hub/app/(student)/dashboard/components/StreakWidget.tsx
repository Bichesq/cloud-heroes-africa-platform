"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import type { UnitCompletion } from "@/types";
import { weekActivity, streakCount } from "@/lib/streak";

const LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEK_MS = 7 * 86_400_000;

/**
 * Weekday activity row (filled lightning = a unit was completed that day)
 * + the current consecutive-day streak count. Week nav browses history
 * without changing the streak, which always reflects today.
 */
export default function StreakWidget({
  completions,
  offsetHours,
  now,
}: {
  completions: UnitCompletion[];
  offsetHours: number;
  now: string; // ISO, computed server-side for a deterministic first render
}) {
  const nowDate = useMemo(() => new Date(now), [now]);
  const [weekOffset, setWeekOffset] = useState(0);

  const viewedNow = useMemo(
    () => new Date(nowDate.getTime() + weekOffset * WEEK_MS),
    [nowDate, weekOffset]
  );

  const days = useMemo(
    () => weekActivity(completions, offsetHours, viewedNow),
    [completions, offsetHours, viewedNow]
  );
  const streak = useMemo(
    () => streakCount(completions, offsetHours, nowDate),
    [completions, offsetHours, nowDate]
  );

  return (
    <div className="cha-card flex flex-col gap-4 p-5">
      <h2 className="font-display text-lg font-bold">Activity Streak</h2>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <span className="text-[11px] font-semibold text-cha-faint">{LABELS[i]}</span>
            <div
              className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-colors ${
                d.active
                  ? "border-cha-orange bg-cha-orange text-white"
                  : d.isToday
                    ? "border-cha-ink text-cha-faint"
                    : "border-cha-border text-cha-faint"
              }`}
            >
              <Zap size={15} fill={d.active ? "currentColor" : "none"} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-bold">
          <Zap size={15} className="text-cha-orange" fill="currentColor" />
          {streak} {streak === 1 ? "day" : "days"}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
            className="grid h-7 w-7 place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset === 0}
            aria-label="Next week"
            className="grid h-7 w-7 place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2 disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
