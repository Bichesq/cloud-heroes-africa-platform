import * as React from 'react';
/** Pill toggle switch. */
export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'blue' | 'orange';
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Switch(props: SwitchProps): JSX.Element;
