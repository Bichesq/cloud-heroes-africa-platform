import * as React from 'react';
/**
 * Primary surface panel with soft shadow & generous rounding.
 * @startingPoint section="Surfaces" subtitle="White, dark & colored feature cards" viewport="700x220"
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'sunken' | 'dark' | 'orange' | 'ocean' | 'accent';
  padding?: number | string;
  radius?: number | string;
}
export declare function Card(props: CardProps): JSX.Element;
