import type { UnitCompletion } from "@/types";
import { localNow } from "./calendar-utils";

/* Pure activity-streak math — no I/O, unit-testable. "Activity" is defined
 * as completing a unit (lib/curriculum.ts), day-bucketed in the student's
 * profile timezone. */

export type StreakDay = {
  key: string; // "YYYY-MM-DD", local
  weekday: number; // 0=Sun..6=Sat
  active: boolean;
  isToday: boolean;
  isFuture: boolean;
};

const DAY_MS = 86_400_000;

function localDateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

function activeDateKeys(completions: UnitCompletion[], offsetHours: number): Set<string> {
  return new Set(
    completions.map((c) => localDateKey(localNow(new Date(c.completedAt), offsetHours)))
  );
}

/** Monday–Sunday activity row for the local week containing `now`. */
export function weekActivity(
  completions: UnitCompletion[],
  offsetHours: number,
  now: Date
): StreakDay[] {
  const active = activeDateKeys(completions, offsetHours);
  const localNowDate = localNow(now, offsetHours);
  const todayKey = localDateKey(localNowDate);

  const dow = localNowDate.getUTCDay(); // 0=Sun..6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(
    Date.UTC(
      localNowDate.getUTCFullYear(),
      localNowDate.getUTCMonth(),
      localNowDate.getUTCDate() + mondayOffset
    )
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getTime() + i * DAY_MS);
    const key = localDateKey(d);
    return {
      key,
      weekday: d.getUTCDay(),
      active: active.has(key),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    };
  });
}

/** Consecutive-day streak ending today, with a same-day grace period: if
 * today has no completion yet, the streak still counts through yesterday
 * (today isn't over). Resets to 0 once a full day passes with none. */
export function streakCount(
  completions: UnitCompletion[],
  offsetHours: number,
  now: Date
): number {
  const active = activeDateKeys(completions, offsetHours);
  const localNowDate = localNow(now, offsetHours);

  let cursor = new Date(
    Date.UTC(localNowDate.getUTCFullYear(), localNowDate.getUTCMonth(), localNowDate.getUTCDate())
  );

  if (!active.has(localDateKey(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (!active.has(localDateKey(cursor))) return 0;
  }

  let count = 0;
  while (active.has(localDateKey(cursor))) {
    count++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return count;
}
