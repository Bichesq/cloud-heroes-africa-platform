import * as React from 'react';
/** Title row for a Card with optional subtitle & trailing action. */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}
export declare function CardHeader(props: CardHeaderProps): JSX.Element;
