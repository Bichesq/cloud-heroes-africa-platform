import * as React from 'react';
/** Circular user image with optional ring & status dot. */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  ring?: boolean;
  ringColor?: string;
  status?: 'online' | 'busy' | null;
}
export declare function Avatar(props: AvatarProps): JSX.Element;
