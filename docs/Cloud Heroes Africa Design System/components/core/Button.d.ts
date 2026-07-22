import * as React from 'react';

/**
 * Pill-shaped action button — CHA's primary interaction control.
 * @startingPoint section="Core" subtitle="Orange, accent, dark & ghost buttons" viewport="700x160"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'dark' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  block?: boolean;
  disabled?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
