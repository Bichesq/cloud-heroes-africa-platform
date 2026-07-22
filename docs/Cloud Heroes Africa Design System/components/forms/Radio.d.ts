import * as React from 'react';
/** Circular single-select radio control. */
export interface RadioProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  disabled?: boolean;
  label?: React.ReactNode;
  name?: string;
  style?: React.CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;
