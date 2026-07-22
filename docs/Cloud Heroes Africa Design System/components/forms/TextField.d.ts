import * as React from 'react';
import { InputProps } from './Input';
/** Labeled field: label + Input + helper/error. */
export interface TextFieldProps extends InputProps {
  label?: React.ReactNode;
  helper?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}
export declare function TextField(props: TextFieldProps): JSX.Element;
