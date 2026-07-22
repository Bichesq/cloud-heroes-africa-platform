import * as React from 'react';
export interface CheckProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Check(props: CheckProps): JSX.Element;
