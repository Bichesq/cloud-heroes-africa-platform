import * as React from 'react';
export interface CogProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Cog(props: CogProps): JSX.Element;
