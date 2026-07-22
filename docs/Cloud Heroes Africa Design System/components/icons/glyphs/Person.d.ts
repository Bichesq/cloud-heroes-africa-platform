import * as React from 'react';
export interface PersonProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Person(props: PersonProps): JSX.Element;
