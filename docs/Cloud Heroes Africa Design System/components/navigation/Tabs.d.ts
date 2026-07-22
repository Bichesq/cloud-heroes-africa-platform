import * as React from 'react';
/** Segmented pill tab control. */
export interface TabItem { id: string; label: React.ReactNode; }
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: TabItem[];
  value?: string;
  onChange?: (id: string) => void;
  activeTone?: 'dark' | 'blue' | 'white';
  size?: 'sm' | 'md';
}
export declare function Tabs(props: TabsProps): JSX.Element;
