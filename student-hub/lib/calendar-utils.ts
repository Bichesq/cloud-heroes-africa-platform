import type { LearningEvent } from "@/types";

/* Pure calendar math — no I/O, unit-testable. Events are stored in UTC;
 * everything here converts to the student's fixed-offset profile timezone
 * for display, grid generation, and live/upcoming detection. */

export type CalendarDayCell = {
  day: number | null; // null = hidden cell (used by the "today" range)
  iso: string; // "YYYY-MM-DD", local
  muted: boolean; // outside the displayed reference month
  event: boolean;
  today: boolean;
};

export type CalendarRange = "today" | "week" | "month";
export type CalendarPeriod = "today" | "tomorrow" | "next-week";

/** A Date whose UTC getters read like the student's local wall-clock time.
 * Only use for reading calendar fields (year/month/date/hours) — it is not
 * a real instant, so don't use it for elapsed-time math. */
export function localNow(now: Date, offsetHours: number): Date {
  return new Date(now.getTime() + offsetHours * 3_600_000);
}

function localDateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate()
  ).padStart(2, "0")}`;
}

function eventLocalDateKey(event: LearningEvent, offsetHours: number): string {
  return localDateKey(localNow(new Date(event.start), offsetHours));
}

export function isLive(event: LearningEvent, now: Date): boolean {
  const t = now.getTime();
  return t >= new Date(event.start).getTime() && t <= new Date(event.end).getTime();
}

/** Real UTC instant for local midnight of (localNowDate + dayOffset days). */
function localMidnightUtc(localNowDate: Date, offsetHours: number, dayOffset: number): Date {
  const shiftedMidnight = Date.UTC(
    localNowDate.getUTCFullYear(),
    localNowDate.getUTCMonth(),
    localNowDate.getUTCDate() + dayOffset
  );
  return new Date(shiftedMidnight - offsetHours * 3_600_000);
}

export function periodRange(
  period: CalendarPeriod,
  localNowDate: Date,
  offsetHours: number
): { start: Date; end: Date } {
  if (period === "today") {
    return {
      start: localMidnightUtc(localNowDate, offsetHours, 0),
      end: localMidnightUtc(localNowDate, offsetHours, 1),
    };
  }
  if (period === "tomorrow") {
    return {
      start: localMidnightUtc(localNowDate, offsetHours, 1),
      end: localMidnightUtc(localNowDate, offsetHours, 2),
    };
  }
  return {
    start: localMidnightUtc(localNowDate, offsetHours, 0),
    end: localMidnightUtc(localNowDate, offsetHours, 7),
  };
}

/** The event to show in the live/next-event card for a given filter chip:
 * whichever matching event is live right now, else the soonest upcoming
 * one in range, else null. */
export function pickEventForPeriod(
  events: LearningEvent[],
  period: CalendarPeriod,
  localNowDate: Date,
  offsetHours: number,
  now: Date
): LearningEvent | null {
  const { start, end } = periodRange(period, localNowDate, offsetHours);
  const inRange = events.filter((e) => {
    const s = new Date(e.start).getTime();
    return s >= start.getTime() && s < end.getTime();
  });

  const live = inRange.find((e) => isLive(e, now));
  if (live) return live;

  const upcoming = inRange
    .filter((e) => new Date(e.start).getTime() >= now.getTime())
    .sort((a, b) => a.start.localeCompare(b.start));
  return upcoming[0] ?? null;
}

/** Month/week/today grid cells, weekday-aligned (Sun–Sat columns).
 * `refYear`/`refMonth` (0–11) are local calendar values driving month nav. */
export function buildCalendarCells(
  range: CalendarRange,
  refYear: number,
  refMonth: number,
  events: LearningEvent[],
  offsetHours: number,
  localNowDate: Date
): CalendarDayCell[] {
  const todayKey = localDateKey(localNowDate);
  const eventKeys = new Set(events.map((e) => eventLocalDateKey(e, offsetHours)));

  const cellFor = (localDate: Date, muted: boolean, showDay: boolean): CalendarDayCell => {
    const iso = localDateKey(localDate);
    return {
      day: showDay ? localDate.getUTCDate() : null,
      iso,
      muted,
      event: eventKeys.has(iso),
      today: iso === todayKey,
    };
  };

  if (range === "month") {
    const firstOfMonth = new Date(Date.UTC(refYear, refMonth, 1));
    const leadDays = firstOfMonth.getUTCDay(); // 0 (Sun) – 6
    const daysInMonth = new Date(Date.UTC(refYear, refMonth + 1, 0)).getUTCDate();
    const totalCells = Math.ceil((leadDays + daysInMonth) / 7) * 7;

    const cells: CalendarDayCell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = new Date(Date.UTC(refYear, refMonth, 1 - leadDays + i));
      cells.push(cellFor(d, d.getUTCMonth() !== refMonth, true));
    }
    return cells;
  }

  // week / today: current local week, Sun–Sat, anchored on localNowDate
  const weekStart = new Date(
    Date.UTC(
      localNowDate.getUTCFullYear(),
      localNowDate.getUTCMonth(),
      localNowDate.getUTCDate() - localNowDate.getUTCDay()
    )
  );

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + i));
    const isToday = localDateKey(d) === todayKey;
    if (range === "today") {
      return cellFor(d, d.getUTCMonth() !== refMonth, isToday);
    }
    return cellFor(d, d.getUTCMonth() !== refMonth, true);
  });
}

/** "2:45 PM (GMT+1)" — local clock display for the time chip. */
export function formatLocalClock(localNowDate: Date, offsetHours: number): string {
  let hours = localNowDate.getUTCHours();
  const minutes = localNowDate.getUTCMinutes();
  const suffix = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const gmt = offsetHours >= 0 ? `GMT+${offsetHours}` : `GMT${offsetHours}`;
  return `${hours}:${String(minutes).padStart(2, "0")} ${suffix} (${gmt})`;
}

/** "2:00 - 3:30 PM" — local time range for an event card. */
export function formatEventTimeRange(event: LearningEvent, offsetHours: number): string {
  const start = localNow(new Date(event.start), offsetHours);
  const end = localNow(new Date(event.end), offsetHours);
  const fmt = (d: Date, withSuffix: boolean) => {
    let h = d.getUTCHours();
    const m = d.getUTCMinutes();
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")}${withSuffix ? ` ${suffix}` : ""}`;
  };
  const sameSuffix = (start.getUTCHours() >= 12) === (end.getUTCHours() >= 12);
  return `${fmt(start, !sameSuffix)} - ${fmt(end, true)}`;
}
