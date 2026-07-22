import * as React from 'react';
/** Dialog/popover title bar with a close button. */
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
}
export declare function ModalHeader(props: ModalHeaderProps): JSX.Element;
