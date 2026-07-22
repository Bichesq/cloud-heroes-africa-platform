import * as React from 'react';
/** Frosted gradient blur band fading one edge of content. */
export interface ProgressiveBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom';
  height?: number;
  color?: 'light' | 'dark';
}
export declare function ProgressiveBlur(props: ProgressiveBlurProps): JSX.Element;
