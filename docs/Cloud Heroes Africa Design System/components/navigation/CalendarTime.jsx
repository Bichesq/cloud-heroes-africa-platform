import React from 'react';

/** CalendarTime — the left time gutter for a day/week grid. */
export function CalendarTime({ hours = ['8 AM','9 AM','10 AM','11 AM','12 PM'], rowHeight = 78, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }} {...rest}>
      {hours.map((h, i) => (
        <div key={i} style={{ height: rowHeight, fontSize: 13, fontWeight: 600, color: 'var(--cha-zinc-500)', fontFamily: 'var(--font-body)' }}>{h}</div>
      ))}
    </div>
  );
}
