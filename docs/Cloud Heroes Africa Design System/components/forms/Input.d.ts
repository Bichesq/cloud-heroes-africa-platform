import * as React from 'react';
/** Text field with optional leading/trailing adornments. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
