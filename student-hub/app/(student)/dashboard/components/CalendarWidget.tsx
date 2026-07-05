"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";
import type { mockCalendar } from "../data/mock";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PERIODS = ["Upcoming Today", "Tomorrow", "Next Week"];
const RANGES = ["Today", "Week", "Month"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = { calendar: typeof mockCalendar };

export default function CalendarWidget({ calendar }: Props) {
  const startIndex = MONTHS.indexOf(calendar.monthLabel);
  const [monthIndex, setMonthIndex] = useState(startIndex < 0 ? 5 : startIndex);
  const [period, setPeriod] = useState(0);
  const [range, setRange] = useState(2); // Month

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
            <span className="font-display text-lg font-bold">
              {MONTHS[monthIndex]}
            </span>
            <span className="text-lg text-cha-faint">{calendar.year}</span>
            <ChevronDown size={15} className="text-cha-faint" />
          </div>
          <div className="flex items-center gap-1">
            <NavBtn
              onClick={() => setMonthIndex((m) => (m + 11) % 12)}
              label="Previous month"
            >
              <ChevronLeft size={15} />
            </NavBtn>
            <NavBtn
              onClick={() => setMonthIndex((m) => (m + 1) % 12)}
              label="Next month"
            >
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
          {calendar.days.map((cell, i) => (
            <button
              key={i}
              className={`relative grid h-9 w-9 place-items-center rounded-full text-sm transition-colors ${
                cell.selected
                  ? "bg-cha-orange font-medium text-white"
                  : cell.muted
                    ? "text-cha-faint"
                    : "text-cha-ink hover:bg-cha-surface-2"
              }`}
            >
              {cell.day}
              {cell.event && !cell.selected && (
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
            {calendar.time}
          </span>
        </div>

        {/* Period chips */}
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p, i) => {
            const on = period === i;
            return (
              <button
                key={p}
                onClick={() => setPeriod(i)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  on
                    ? "bg-cha-orange text-white"
                    : "bg-cha-surface-2 text-cha-muted hover:bg-cha-border"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Live event */}
        <div className="flex items-center justify-between rounded-2xl bg-cha-orange p-3.5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full border-2 border-white/55">
              <Radio size={13} />
            </span>
            <div>
              <div className="text-sm font-bold">{calendar.event.title}</div>
              <div className="text-xs opacity-90">{calendar.event.time}</div>
            </div>
          </div>
          {calendar.event.live && (
            <span className="rounded-full bg-cha-eclipse px-3.5 py-1.5 text-xs font-semibold">
              Live
            </span>
          )}
        </div>

        {/* Range tabs */}
        <div className="flex items-center gap-0.5 self-start rounded-full bg-cha-surface-2 p-1">
          {RANGES.map((r, i) => {
            const on = range === i;
            return (
              <button
                key={r}
                onClick={() => setRange(i)}
                className={`rounded-full px-[18px] py-1.5 text-[13px] font-semibold transition-colors ${
                  on ? "bg-cha-eclipse text-white dark:bg-cha-blue" : "text-cha-muted"
                }`}
              >
                {r}
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
