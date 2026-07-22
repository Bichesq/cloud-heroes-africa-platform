import * as React from 'react';
export interface LegendProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: { color: string; label: React.ReactNode }[];
  gap?: number;
}
export declare function Legend(props: LegendProps): JSX.Element;
