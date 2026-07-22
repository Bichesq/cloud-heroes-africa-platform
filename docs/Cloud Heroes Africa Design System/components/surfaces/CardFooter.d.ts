import * as React from 'react';
/** Bottom action row of a Card. */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end' | 'between';
  divider?: boolean;
}
export declare function CardFooter(props: CardFooterProps): JSX.Element;
