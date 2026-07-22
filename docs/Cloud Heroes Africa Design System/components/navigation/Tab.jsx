import React from 'react';

/** Tab — a single tab pill (the building block of Tabs). */
export function Tab({ children, active = false, activeTone = 'dark', size = 'md', onClick, style = {}, ...rest }) {
  const H = size === 'sm' ? 32 : 40;
  const fs = size === 'sm' ? 13 : 15;
  const on = { dark: { bg: 'var(--cha-eclipse)', color: '#fff' }, blue: { bg: 'var(--cha-blue-500)', color: '#fff' }, white: { bg: '#fff', color: 'var(--cha-ink)' } }[activeTone] || {};
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} style={{
      height: H, padding: '0 18px', border: 'none', borderRadius: 999,
      background: active ? on.bg : 'transparent', color: active ? on.color : 'var(--cha-zinc-500)',
      fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: fs, cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'background 130ms ease, color 130ms ease', ...style,
    }} {...rest}>{children}</button>
  );
}
