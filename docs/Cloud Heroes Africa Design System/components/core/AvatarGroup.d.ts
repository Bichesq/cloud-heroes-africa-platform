import * as React from 'react';
/** Overlapping avatar stack with a +N overflow bubble. */
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  people?: { src?: string; name?: string }[];
  max?: number;
  extra?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | number;
}
export declare function AvatarGroup(props: AvatarGroupProps): JSX.Element;
