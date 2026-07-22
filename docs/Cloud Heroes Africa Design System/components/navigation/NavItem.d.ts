import * as React from 'react';
/** Sidebar navigation row with active pill, badge & chevron. */
export interface NavItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  active?: boolean;
  activeTone?: 'orange' | 'dark' | 'soft';
  badge?: React.ReactNode;
  chevron?: boolean;
}
export declare function NavItem(props: NavItemProps): JSX.Element;
