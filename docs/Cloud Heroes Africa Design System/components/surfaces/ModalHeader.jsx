import React from 'react';
import { CloseButton } from '../core/CloseButton.jsx';

/** ModalHeader — dialog/popover title bar with a close button
 *  (the "Create Event" popover header). */
export function ModalHeader({ title, subtitle, onClose, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, ...style }} {...rest}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: 1.15 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: 'var(--cha-zinc-500)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {onClose !== undefined && <CloseButton size={28} onClick={onClose} />}
    </div>
  );
}
