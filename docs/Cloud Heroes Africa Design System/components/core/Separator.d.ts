import * as React from 'react';
/** Hairline divider. */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  tone?: 'default' | 'strong';
}
export declare function Separator(props: SeparatorProps): JSX.Element;
