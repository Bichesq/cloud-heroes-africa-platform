import * as React from 'react';
export interface MenucardProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Menucard(props: MenucardProps): JSX.Element;
