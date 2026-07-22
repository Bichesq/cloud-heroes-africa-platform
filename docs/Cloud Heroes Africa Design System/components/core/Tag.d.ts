import * as React from 'react';
/** Small status label (In Progress / Submitted / grades). */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'orange' | 'ocean' | 'success' | 'warning' | 'danger' | 'dark';
  size?: 'sm' | 'md';
}
export declare function Tag(props: TagProps): JSX.Element;
