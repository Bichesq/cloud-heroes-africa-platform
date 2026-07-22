import * as React from 'react';
export interface CalendarDateNavProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
}
export declare function CalendarDateNav(props: CalendarDateNavProps): JSX.Element;
