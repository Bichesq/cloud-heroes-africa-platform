"use client";

import { Tabs, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import {
  CalendarDate,
  parseDate,
  startOfWeek,
} from "@internationalized/date";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import AppButton from "@/components/ui/AppButton";
import AppCard from "@/components/ui/AppCard";
import type { CalendarPageData, EventTone, ScheduleEvent } from "../data/mock";

const WEEKDAY_ABBR = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const VIEWS = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
] as const;

const TONE: Record<EventTone, { block: string; text: string; strip: string }> =
  {
    amber: {
      block: "bg-cha-warning",
      text: "text-cha-eclipse",
      strip: "bg-black/15 text-white",
    },
    "amber-soft": {
      block: "bg-cha-warning-soft",
      text: "text-cha-eclipse",
      strip: "bg-black/15 text-white",
    },
    ocean: {
      block: "bg-cha-ocean",
      text: "text-white",
      strip: "bg-white/25 text-white",
    },
  };

function formatHour(hour: number) {
  const h = ((hour + 11) % 12) + 1;
  return `${h} ${hour >= 12 ? "PM" : "AM"}`;
}

type Props = {
  data: CalendarPageData;
  date: CalendarDate;
  onDateChange: (date: CalendarDate) => void;
  onCreate: () => void;
};

/**
 * Main scheduler panel: prev/Today/next controls, Day-Week-Month-Year
 * view Tabs, the WAT day-chip strip (ToggleButtonGroup), and the
 * hour-by-hour day grid with event blocks and dashed "+ Add" slots.
 */
export default function SchedulePanel({
  data,
  date,
  onDateChange,
  onCreate,
}: Props) {
  const weekStart = startOfWeek(date, "en-US");
  const week = Array.from({ length: 7 }, (_, i) => weekStart.add({ days: i }));
  const hours = Array.from(
    { length: data.hours.end - data.hours.start + 1 },
    (_, i) => data.hours.start + i,
  );

  return (
    <AppCard padding="lg" className="min-w-0">
      <Tabs defaultSelectedKey="day" className="flex w-full flex-col gap-5">
        {/* Toolbar: date paging + view switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-2xl bg-cha-surface-2 p-1">
            <button
              aria-label="Previous day"
              onClick={() => onDateChange(date.subtract({ days: 1 }))}
              className="grid h-8 w-8 place-items-center rounded-xl text-cha-ink transition-colors hover:bg-cha-surface"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="mx-1 h-4 w-px bg-cha-separator" />
            <button
              onClick={() =>
                onDateChange(
                  new CalendarDate(
                    data.initial.year,
                    data.initial.month,
                    data.initial.day,
                  ),
                )
              }
              className="px-2 text-sm font-semibold"
            >
              Today
            </button>
            <button
              aria-label="Next day"
              onClick={() => onDateChange(date.add({ days: 1 }))}
              className="grid h-8 w-8 place-items-center rounded-xl text-cha-ink transition-colors hover:bg-cha-surface"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Tabs.ListContainer>
            <Tabs.List
              aria-label="Calendar view"
              className="gap-1.5 bg-transparent p-0"
            >
              {VIEWS.map((view) => (
                <Tabs.Tab
                  key={view.id}
                  id={view.id}
                  className="rounded-full bg-cha-surface-2 px-3.5 py-1.5 text-[13px] font-semibold text-cha-muted data-[selected=true]:text-white"
                >
                  <Tabs.Indicator className="rounded-full bg-cha-orange shadow-none" />
                  {view.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </div>

        <Tabs.Panel id="day" className="flex flex-col gap-5 p-0">
          {/* Day strip */}
          <div className="flex items-stretch gap-2">
            <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-cha-surface-2 text-xs font-bold text-cha-muted">
              {data.timezone}
            </span>
            <ToggleButtonGroup
              aria-label="Day of week"
              selectionMode="single"
              disallowEmptySelection
              isDetached
              className="flex flex-1 gap-2"
              selectedKeys={[date.toString()]}
              onSelectionChange={(keys) => {
                const key = [...keys][0];
                if (key) onDateChange(parseDate(String(key)));
              }}
            >
              {week.map((day, i) => (
                <ToggleButton
                  key={day.toString()}
                  id={day.toString()}
                  className="h-12 flex-1 items-center justify-center gap-1 rounded-xl border-0 bg-cha-surface-2 text-cha-ink data-[selected=true]:bg-cha-orange data-[selected=true]:text-white"
                >
                  <span className="text-lg font-bold">{day.day}</span>
                  <span className="text-[9px] font-bold opacity-60">
                    {WEEKDAY_ABBR[i]}
                  </span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </div>

          {/* Hour grid */}
          <div className="flex max-h-[560px] flex-col overflow-y-auto pr-1">
            {hours.map((hour) => {
              const events = data.events.filter((e) => e.hour === hour);
              return (
                <div key={hour} className="flex gap-4">
                  <span className="w-11 shrink-0 pt-2 text-[15px] font-semibold">
                    {formatHour(hour)}
                  </span>
                  <div className="min-h-[76px] flex-1 border-t border-cha-separator/70 py-2">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <EventBlock key={event.id} event={event} />
                      ))
                    ) : (
                      <AppButton
                        variant="ghost"
                        radius="xl"
                        onPress={onCreate}
                        className="h-full min-h-[58px] w-full border border-dashed border-cha-border text-[13px] font-semibold text-cha-blue hover:text-cha-blue"
                      >
                        + Add
                      </AppButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Tabs.Panel>

        {VIEWS.filter((v) => v.id !== "day").map((view) => (
          <Tabs.Panel key={view.id} id={view.id} className="p-0">
            <div className="grid min-h-[300px] place-items-center rounded-2xl border border-dashed border-cha-border text-sm text-cha-muted">
              {view.label} view coming soon
            </div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </AppCard>
  );
}

function EventBlock({ event }: { event: ScheduleEvent }) {
  const tone = TONE[event.tone];
  return (
    <div
      className={`overflow-hidden rounded-lg ${tone.block}`}
      style={{
        marginLeft: `${(event.offset ?? 0) * 100}%`,
        width: event.width,
      }}
    >
      <div className={`px-2 pt-1.5 ${tone.text}`}>
        <div className="flex items-center gap-1 text-[10.5px] font-bold leading-tight">
          <span className="truncate">{event.title}</span>
          {event.video && <Video size={11} className="shrink-0" />}
        </div>
        <div className="text-[9px] opacity-75">{event.time}</div>
      </div>
      <div
        className={`mt-1.5 px-2 py-1 text-[9.5px] font-semibold ${tone.strip}`}
      >
        {event.participants}
      </div>
    </div>
  );
}
