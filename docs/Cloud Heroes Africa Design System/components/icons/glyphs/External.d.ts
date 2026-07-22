import * as React from 'react';
export interface ExternalProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function External(props: ExternalProps): JSX.Element;
