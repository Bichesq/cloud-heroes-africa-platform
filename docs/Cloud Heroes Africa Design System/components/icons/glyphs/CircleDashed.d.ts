import * as React from 'react';
export interface CircleDashedProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function CircleDashed(props: CircleDashedProps): JSX.Element;
