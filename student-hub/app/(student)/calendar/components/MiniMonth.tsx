"use client";

import { Calendar } from "@heroui/react";
import type { CalendarDate } from "@internationalized/date";

type Props = {
  value: CalendarDate;
  onChange: (date: CalendarDate) => void;
  /** Day-of-month numbers that show the small event dot. */
  eventDays: number[];
};

/**
 * Mini month calendar in the left rail — HeroUI v3 Calendar. The
 * selected-day circle inherits CHA orange automatically because
 * globals.css maps HeroUI's --accent token to --color-cha-orange.
 */
export default function MiniMonth({ value, onChange, eventDays }: Props) {
  return (
    <Calendar
      aria-label="Calendar"
      className="cha-card w-full max-w-none rounded-[22px] p-5"
      value={value}
      onChange={(date) => date && onChange(date as CalendarDate)}
    >
      <Calendar.Header className="mb-1">
        <Calendar.Heading className="font-display text-[15px] font-bold" />
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid weekdayStyle="short" className="w-full">
        <Calendar.GridHeader>
          {(day) => (
            <Calendar.HeaderCell className="text-xs font-semibold text-cha-muted">
              {day}
            </Calendar.HeaderCell>
          )}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => (
            <Calendar.Cell className="text-[13px]" date={date}>
              {({ formattedDate, isSelected, isOutsideMonth }) => (
                <>
                  {formattedDate}
                  {!isOutsideMonth &&
                    !isSelected &&
                    eventDays.includes(date.day) && (
                      <Calendar.CellIndicator className="bg-cha-muted" />
                    )}
                </>
              )}
            </Calendar.Cell>
          )}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}
