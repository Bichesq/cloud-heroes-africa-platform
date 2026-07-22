import * as React from 'react';
export interface CircleInfoProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function CircleInfo(props: CircleInfoProps): JSX.Element;
