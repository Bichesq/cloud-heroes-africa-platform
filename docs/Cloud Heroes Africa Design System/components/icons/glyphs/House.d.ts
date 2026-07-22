import * as React from 'react';
export interface HouseProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function House(props: HouseProps): JSX.Element;
