"use client";

import { useState } from "react";
import { CalendarDate } from "@internationalized/date";
import { Plus } from "lucide-react";
import AppButton from "@/components/ui/AppButton";
import type { CalendarPageData } from "../data/mock";
import CategoriesCard from "./CategoriesCard";
import CreateEventModal from "./CreateEventModal";
import MiniMonth from "./MiniMonth";
import SchedulePanel from "./SchedulePanel";
import TodayCard from "./TodayCard";

/**
 * Client shell for the calendar page — owns the selected date (shared
 * by the mini month and the day strip) and the Create Event modal.
 */
export default function CalendarClient({ data }: { data: CalendarPageData }) {
  const [date, setDate] = useState(
    () =>
      new CalendarDate(data.initial.year, data.initial.month, data.initial.day),
  );
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[290px_minmax(0,1fr)]">
      {/* Left rail */}
      <div className="flex flex-col gap-5">
        <h1 className="font-display text-[36px] font-extrabold leading-none">
          Calendar
        </h1>

        <div className="flex items-center gap-2.5">
          <AppButton
            variant="accent"
            size="sm"
            onPress={() => setCreateOpen(true)}
          >
            <Plus size={15} /> Create Event
          </AppButton>
          <AppButton
            size="sm"
            isDisabled
            className="bg-cha-faint text-white hover:bg-cha-faint"
          >
            <Plus size={15} /> Invite
          </AppButton>
        </div>

        <MiniMonth value={date} onChange={setDate} eventDays={data.eventDays} />
        <CategoriesCard categories={data.categories} />
        <TodayCard event={data.todayEvent} />
      </div>

      {/* Scheduler */}
      <SchedulePanel
        data={data}
        date={date}
        onDateChange={setDate}
        onCreate={() => setCreateOpen(true)}
      />

      <CreateEventModal isOpen={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
