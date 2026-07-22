import * as React from 'react';
/** Neutral nested container (secondary/tertiary/dark fills). */
export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'dark' | 'quarternary';
  radius?: number | string;
  padding?: number | string;
}
export declare function Surface(props: SurfaceProps): JSX.Element;
