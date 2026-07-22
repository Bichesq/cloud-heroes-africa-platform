import * as React from 'react';
export interface CirclesDiamondProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function CirclesDiamond(props: CirclesDiamondProps): JSX.Element;
