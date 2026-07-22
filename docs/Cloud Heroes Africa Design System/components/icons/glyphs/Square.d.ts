import * as React from 'react';
export interface SquareProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Square(props: SquareProps): JSX.Element;
