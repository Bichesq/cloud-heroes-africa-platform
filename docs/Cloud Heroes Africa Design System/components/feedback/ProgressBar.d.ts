import * as React from 'react';
/** Rounded pill progress bar with inline % label. */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  tone?: 'orange' | 'ocean' | 'blue' | 'dark';
  height?: number;
  showValue?: boolean;
  track?: string;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
