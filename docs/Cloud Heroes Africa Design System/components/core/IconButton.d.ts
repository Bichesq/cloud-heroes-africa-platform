import * as React from 'react';
/** Square/circular single-icon button. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'soft' | 'dark' | 'white';
  shape?: 'circle' | 'square';
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
