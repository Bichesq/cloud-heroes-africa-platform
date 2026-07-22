import * as React from 'react';
/** Single-select group of Chip filters. */
export interface ChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: { id: string; label: React.ReactNode }[];
  value?: string;
  onChange?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
}
export declare function Chips(props: ChipsProps): JSX.Element;
