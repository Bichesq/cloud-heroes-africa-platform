import * as React from 'react';
export interface ChartPieProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function ChartPie(props: ChartPieProps): JSX.Element;
