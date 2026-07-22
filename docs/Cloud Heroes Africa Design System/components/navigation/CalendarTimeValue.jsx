import React from 'react';

/** CalendarTimeValue — a compact time-range label used inside event blocks. */
export function CalendarTimeValue({ children, tone = 'muted', style = {}, ...rest }) {
  const color = tone === 'muted' ? 'rgba(0,0,0,0.6)' : 'var(--cha-ink)';
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color, ...style }} {...rest}>{children}</span>
  );
}
