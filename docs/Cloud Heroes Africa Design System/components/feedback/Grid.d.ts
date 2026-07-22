import * as React from 'react';
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  color?: string;
}
export declare function Grid(props: GridProps): JSX.Element;
