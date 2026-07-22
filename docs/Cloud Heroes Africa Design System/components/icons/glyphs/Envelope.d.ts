import * as React from 'react';
export interface EnvelopeProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Envelope(props: EnvelopeProps): JSX.Element;
