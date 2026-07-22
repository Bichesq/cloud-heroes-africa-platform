import * as React from 'react';
/** Lightweight bar / line / trend chart. */
export interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'bar' | 'line' | 'trend';
  data?: number[];
  labels?: string[];
  tone?: 'orange' | 'ocean' | 'blue' | 'muted' | string;
  highlight?: number;
  width?: number;
  height?: number;
}
export declare function Chart(props: ChartProps): JSX.Element;
