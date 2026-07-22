import React from 'react';

/** CalendarDayWeek — a wide day cell in the week strip (date + weekday).
 *  Active day fills brand orange. */
export function CalendarDayWeek({ day, weekday, active = false, onClick, style = {}, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
      background: active ? 'var(--color-primary)' : 'var(--cha-zinc-50)', color: active ? '#fff' : 'var(--cha-ink)', ...style,
    }} {...rest}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, lineHeight: 1 }}>{day}</div>
      <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7 }}>{weekday}</div>
    </button>
  );
}
