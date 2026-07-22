import * as React from 'react';
export interface CalendarTimeValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'muted' | 'default';
}
export declare function CalendarTimeValue(props: CalendarTimeValueProps): JSX.Element;
