import * as React from 'react';
export interface CalendarTimeProps extends React.HTMLAttributes<HTMLDivElement> {
  hours?: React.ReactNode[];
  rowHeight?: number;
}
export declare function CalendarTime(props: CalendarTimeProps): JSX.Element;
