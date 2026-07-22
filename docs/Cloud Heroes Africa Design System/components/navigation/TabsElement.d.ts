import * as React from 'react';
export interface TabsElementProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: { id: string; label: React.ReactNode }[];
  value?: string;
  onChange?: (id: string) => void;
  activeTone?: 'dark' | 'blue' | 'white';
  size?: 'sm' | 'md';
}
export declare function TabsElement(props: TabsElementProps): JSX.Element;
