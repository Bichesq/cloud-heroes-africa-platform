import * as React from 'react';
export interface StarProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Star(props: StarProps): JSX.Element;
