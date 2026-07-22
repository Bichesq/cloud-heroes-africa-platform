import * as React from 'react';
export interface MapPinProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function MapPin(props: MapPinProps): JSX.Element;
