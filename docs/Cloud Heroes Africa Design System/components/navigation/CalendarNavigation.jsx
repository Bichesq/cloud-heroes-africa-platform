import React from 'react';
import { IconButton } from '../core/IconButton.jsx';
import { Icon } from '../icons/Icon.jsx';

/**
 * CalendarNavigation — the ‹ Today › cluster for moving through dates.
 */
export function CalendarNavigation({ label = 'Today', onPrev, onNext, onToday, style = {}, ...rest }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }} {...rest}>
      <IconButton variant="soft" size="sm" onClick={onPrev}><Icon name="chevron-left" size={16} /></IconButton>
      <button type="button" onClick={onToday} style={{
        height: 34, padding: '0 16px', border: 'none', borderRadius: 999, background: 'var(--cha-zinc-100)',
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--cha-ink)', cursor: 'pointer',
      }}>{label}</button>
      <IconButton variant="soft" size="sm" onClick={onNext}><Icon name="chevron-right" size={16} /></IconButton>
    </div>
  );
}
