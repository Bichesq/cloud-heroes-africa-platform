import * as React from 'react';
/** Wrapping row of Tags/Chips. */
export interface TagListProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: number;
  wrap?: boolean;
}
export declare function TagList(props: TagListProps): JSX.Element;
