import * as React from 'react';
export interface FolderProps extends React.SVGProps<SVGSVGElement> {
  /** px size (width & height). Default 20. */
  size?: number | string;
}
export declare function Folder(props: FolderProps): JSX.Element;
