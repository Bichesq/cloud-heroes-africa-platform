import * as React from 'react';
export interface QrCodeProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function QrCode(props: QrCodeProps): JSX.Element;
