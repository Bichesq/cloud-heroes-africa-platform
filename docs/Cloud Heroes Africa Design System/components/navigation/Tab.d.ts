import * as React from 'react';
export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  activeTone?: 'dark' | 'blue' | 'white';
  size?: 'sm' | 'md';
}
export declare function Tab(props: TabProps): JSX.Element;
