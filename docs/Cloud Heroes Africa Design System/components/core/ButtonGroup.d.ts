import * as React from 'react';
/** Connected segmented buttons in one rounded shell. */
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: { id: string; label: React.ReactNode }[];
  value?: string;
  onChange?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
}
export declare function ButtonGroup(props: ButtonGroupProps): JSX.Element;
