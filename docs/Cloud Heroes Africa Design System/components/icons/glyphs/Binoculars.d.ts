import * as React from 'react';
export interface BinocularsProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Binoculars(props: BinocularsProps): JSX.Element;
