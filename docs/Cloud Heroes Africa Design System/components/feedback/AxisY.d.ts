import * as React from 'react';
export interface AxisYProps extends React.HTMLAttributes<HTMLDivElement> {
  ticks?: React.ReactNode[];
  height?: number;
}
export declare function AxisY(props: AxisYProps): JSX.Element;
