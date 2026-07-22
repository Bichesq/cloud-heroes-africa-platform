import * as React from 'react';
/** Rounded-square checkbox. Checked = near-black fill. */
export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  disabled?: boolean;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
