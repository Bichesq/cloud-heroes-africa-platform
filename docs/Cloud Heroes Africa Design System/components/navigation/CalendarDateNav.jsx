import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
import { Icon } from '../icons/Icon.jsx';

/** CalendarDateNav — current period label flanked by prev/next arrows. */
export function CalendarDateNav({ label = 'January 2026', onPrev, onNext, style = {}, ...rest }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...style }} {...rest}>
      <IconButton variant="soft" size="sm" onClick={onPrev}><Icon name="chevron-left" size={16} /></IconButton>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, minWidth: 130, textAlign: 'center' }}>{label}</span>
      <IconButton variant="soft" size="sm" onClick={onNext}><Icon name="chevron-right" size={16} /></IconButton>
    </div>
  );
}
