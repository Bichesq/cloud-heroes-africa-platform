import * as React from 'react';
/** Inline text link. */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'accent';
}
export declare function Link(props: LinkProps): JSX.Element;
