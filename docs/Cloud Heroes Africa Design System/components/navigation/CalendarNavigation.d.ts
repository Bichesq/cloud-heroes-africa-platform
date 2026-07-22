import * as React from 'react';
/** Prev / Today / Next date navigation cluster. */
export interface CalendarNavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
}
export declare function CalendarNavigation(props: CalendarNavigationProps): JSX.Element;
