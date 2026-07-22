import * as React from 'react';
export interface XmarkProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Xmark(props: XmarkProps): JSX.Element;
