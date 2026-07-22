import * as React from 'react';
/** Form field label with optional required asterisk & hint. */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: React.ReactNode;
}
export declare function Label(props: LabelProps): JSX.Element;
