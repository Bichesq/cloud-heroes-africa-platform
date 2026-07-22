import * as React from 'react';
/** A day cell in the mini month grid (36×36, round). */
export interface CalendarDayProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  day: React.ReactNode;
  selected?: boolean;
  today?: boolean;
  hasEvent?: boolean;
  muted?: boolean;
}
export declare function CalendarDay(props: CalendarDayProps): JSX.Element;
