import React from 'react';

/**
 * CalendarDay — a day cell in the mini month grid (36×36, round).
 * Selected fills the brand orange; today gets an accent ring; a small
 * dot marks days with events; muted for out-of-month days.
 */
export function CalendarDay({
  day,
  selected = false,
  today = false,
  hasEvent = false,
  muted = false,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  let bg = 'transparent', color = muted ? 'var(--cha-zinc-300)' : 'var(--cha-eclipse)';
  if (selected) { bg = 'var(--color-primary)'; color = '#fff'; }
  else if (hover) { bg = 'var(--cha-zinc-50)'; }
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 36, height: 36, borderRadius: 24, border: today && !selected ? '1.5px solid var(--cha-blue-500)' : 'none',
        background: bg, color, cursor: 'pointer', position: 'relative',
        fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14, lineHeight: '20px',
        transition: 'background 120ms ease',
        ...style,
      }}
      {...rest}
    >
      {day}
      {hasEvent && !selected && (
        <span style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: 12, background: 'var(--cha-zinc-500)' }} />
      )}
    </button>
  );
}
