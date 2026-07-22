import * as React from 'react';
/** Filter / category pill. Selected chips go near-black. */
export interface ChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'default' | 'dark' | 'ocean' | 'orange';
}
export declare function Chip(props: ChipProps): JSX.Element;
