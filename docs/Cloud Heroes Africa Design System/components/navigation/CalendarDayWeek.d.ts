import * as React from 'react';
export interface CalendarDayWeekProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  day: React.ReactNode;
  weekday: React.ReactNode;
  active?: boolean;
}
export declare function CalendarDayWeek(props: CalendarDayWeekProps): JSX.Element;
