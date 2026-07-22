import * as React from 'react';
export interface SwitchControlProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'blue' | 'orange';
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function SwitchControl(props: SwitchControlProps): JSX.Element;
