import * as React from 'react';
export interface LinesProps extends React.SVGProps<SVGSVGElement> {
  series?: number[][];
  width?: number;
  height?: number;
  colors?: string[];
}
export declare function Lines(props: LinesProps): JSX.Element;
