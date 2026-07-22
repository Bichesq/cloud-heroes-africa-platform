import * as React from 'react';
/** Wraps a scroll region and fades its edges with a gradient. */
export interface ScrollShadowProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
  size?: number;
  color?: string;
}
export declare function ScrollShadow(props: ScrollShadowProps): JSX.Element;
