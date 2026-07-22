import * as React from 'react';
/** Helper / error text below a form field. */
export interface DescriptionErrorMessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'description' | 'error';
}
export declare function DescriptionErrorMessage(props: DescriptionErrorMessageProps): JSX.Element;
