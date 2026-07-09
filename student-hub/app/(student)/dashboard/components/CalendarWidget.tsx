"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";
import type { LearningEvent } from "@/types";
import {
  buildCalendarCells,
  formatEventTimeRange,
  formatLocalClock,
  isLive,
  localNow,
  pickEventForPeriod,
  type CalendarPeriod,
  type CalendarRange,
} from "@/lib/calendar-utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS: { id: CalendarPeriod; label: string }[] = [
  { id: "today", label: "Upcoming Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "next-week", label: "Next Week" },
];
const RANGES: { id: CalendarRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarWidget({
  events,
  offsetHours,
  now,
}: {
  events: LearningEvent[];
  offsetHours: number;
  now: string; // ISO, computed server-side for a deterministic first render
}) {
  const nowDate = useMemo(() => new Date(now), [now]);
  const localNowDate = useMemo(() => localNow(nowDate, offsetHours), [nowDate, offsetHours]);

  const [refYear, setRefYear] = useState(localNowDate.getUTCFullYear());
  const [refMonth, setRefMonth] = useState(localNowDate.getUTCMonth());
  const [period, setPeriod] = useState<CalendarPeriod>("today");
  const [range, setRange] = useState<CalendarRange>("month");

  const cells = useMemo(
    () => buildCalendarCells(range, refYear, refMonth, events, offsetHours, localNowDate),
    [range, refYear, refMonth, events, offsetHours, localNowDate]
  );

  const cardEvent = useMemo(
    () => pickEventForPeriod(events, period, localNowDate, offsetHours, nowDate),
    [events, period, localNowDate, offsetHours, nowDate]
  );

  function changeMonth(delta: number) {
    let m = refMonth + delta;
    let y = refYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setRefMonth(m);
    setRefYear(y);
  }

  function joinEvent(eventId: string) {
    fetch("/api/events/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    }).catch(() => {});
  }

  return (
    <div>
      {/* Rail header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          className="grid h-[34px] w-[34px] place-items-center rounded-full bg-cha-surface text-cha-ink shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors hover:bg-cha-surface-2"
          aria-label="Toggle calendar panel"
        >
          <ChevronRight size={18} />
        </button>
        <h2 className="font-display text-[26px] font-bold">Calendar</h2>
        <div className="flex-1" />
        <Link
          href="/calendar"
          className="flex items-center gap-0.5 text-[13px] font-semibold text-cha-blue"
        >
          See full view <ChevronRight size={14} />
        </Link>
      </div>

      <div className="cha-card flex flex-col gap-3.5 rounded-[22px] p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-lg font-bold">{MONTHS[refMonth]}</span>
            <span className="text-lg text-cha-faint">{refYear}</span>
            <ChevronDown size={15} className="text-cha-faint" />
          </div>
          <div className="flex items-center gap-1">
            <NavBtn onClick={() => changeMonth(-1)} label="Previous month">
              <ChevronLeft size={15} />
            </NavBtn>
            <NavBtn onClick={() => changeMonth(1)} label="Next month">
              <ChevronRight size={15} />
            </NavBtn>
          </div>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-cha-faint">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 justify-items-center gap-0.5">
          {cells.map((cell, i) => (
            <button
              key={`${cell.iso}-${i}`}
              disabled={cell.day === null}
              className={`relative grid h-9 w-9 place-items-center rounded-full text-sm transition-colors ${
                cell.day === null
                  ? "invisible"
                  : cell.today
                    ? "bg-cha-orange font-medium text-white"
                    : cell.muted
                      ? "text-cha-faint"
                      : "text-cha-ink hover:bg-cha-surface-2"
              }`}
            >
              {cell.day}
              {cell.event && !cell.today && (
                <span className="absolute bottom-1.5 h-[3px] w-[3px] rounded-full bg-cha-muted" />
              )}
            </button>
          ))}
        </div>

        <div className="h-px bg-cha-separator" />

        {/* Time */}
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-bold">Time</span>
          <span className="rounded-full bg-cha-surface-2 px-3.5 py-1.5 text-[13px] font-semibold text-cha-muted">
            {formatLocalClock(localNowDate, offsetHours)}
          </span>
        </div>

        {/* Period chips */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => {
            const on = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  on
                    ? "bg-cha-orange text-white"
                    : "bg-cha-surface-2 text-cha-muted hover:bg-cha-border"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Live / next event */}
        {cardEvent ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-cha-orange p-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border-2 border-white/55">
                <Radio size={13} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{cardEvent.title}</div>
                <div className="text-xs opacity-90">
                  {formatEventTimeRange(cardEvent, offsetHours)}
                </div>
              </div>
            </div>
            {isLive(cardEvent, nowDate) ? (
              <span className="shrink-0 rounded-full bg-cha-eclipse px-3.5 py-1.5 text-xs font-semibold">
                Live
              </span>
            ) : cardEvent.link ? (
              <a
                href={cardEvent.link}
                target="_blank"
                rel="noreferrer"
                onClick={() => joinEvent(cardEvent.id)}
                className="shrink-0 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-semibold transition hover:bg-white/30"
              >
                Open
              </a>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-cha-border p-3.5 text-center text-[13px] text-cha-muted">
            No events in this period.
          </div>
        )}

        {/* Range tabs */}
        <div className="flex items-center gap-0.5 self-start rounded-full bg-cha-surface-2 p-1">
          {RANGES.map((r) => {
            const on = range === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`rounded-full px-[18px] py-1.5 text-[13px] font-semibold transition-colors ${
                  on ? "bg-cha-eclipse text-white dark:bg-cha-blue" : "text-cha-muted"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-[30px] w-[30px] place-items-center rounded-full text-cha-muted transition-colors hover:bg-cha-surface-2"
    >
      {children}
    </button>
  );
}
