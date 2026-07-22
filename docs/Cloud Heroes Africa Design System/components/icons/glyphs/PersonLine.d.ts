import * as React from 'react';
export interface PersonLineProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function PersonLine(props: PersonLineProps): JSX.Element;
