import * as React from 'react';
export interface CheckboxControlProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function CheckboxControl(props: CheckboxControlProps): JSX.Element;
