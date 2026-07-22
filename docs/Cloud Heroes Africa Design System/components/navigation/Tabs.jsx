import React from 'react';

/**
 * Tabs — segmented pill control. Active tab is a filled pill inside
 * a soft track. Used for calendar Day/Week/Month, assignment filters,
 * Chats/DMs, etc.
 */
export function Tabs({
  items = [],           // [{ id, label }]
  value,
  onChange,
  activeTone = 'dark',  // dark | blue | white
  size = 'md',          // sm | md
  style = {},
  ...rest
}) {
  const H = size === 'sm' ? 32 : 40;
  const fs = size === 'sm' ? 13 : 15;
  const active = {
    dark:  { bg: 'var(--cha-eclipse)', color: 'var(--cha-white)' },
    blue:  { bg: 'var(--cha-blue-500)', color: 'var(--cha-white)' },
    white: { bg: 'var(--cha-white)', color: 'var(--cha-ink)' },
  }[activeTone] || {};
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 2,
        padding: 4, background: 'var(--cha-zinc-50)', borderRadius: 999,
        ...style,
      }}
      {...rest}
    >
      {items.map(it => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange && onChange(it.id)}
            style={{
              height: H, padding: '0 18px', border: 'none', borderRadius: 999,
              background: on ? active.bg : 'transparent',
              color: on ? active.color : 'var(--cha-zinc-500)',
              boxShadow: on && activeTone === 'white' ? 'var(--shadow-sm)' : 'none',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: fs,
              cursor: 'pointer', transition: 'background 130ms ease, color 130ms ease',
              whiteSpace: 'nowrap',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
