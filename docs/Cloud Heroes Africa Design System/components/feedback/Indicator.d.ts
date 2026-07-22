import * as React from 'react';
/** Tiny colored status/legend dot. */
export interface IndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'ocean' | 'blue' | 'orange' | 'green' | 'red' | 'black' | 'white' | string;
  size?: number;
  ring?: boolean;
}
export declare function Indicator(props: IndicatorProps): JSX.Element;
