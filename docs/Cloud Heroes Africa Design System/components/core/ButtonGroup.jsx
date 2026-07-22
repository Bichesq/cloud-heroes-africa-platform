import React from 'react';

/**
 * ButtonGroup — connected segmented buttons sharing one rounded shell.
 * Used for view switchers and paired actions.
 */
export function ButtonGroup({ items = [], value, onChange, size = 'md', style = {}, ...rest }) {
  const H = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const fs = size === 'sm' ? 13 : 15;
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'var(--cha-white)', border: '1px solid var(--cha-zinc-200)',
        borderRadius: 999, padding: 3, gap: 2, boxShadow: 'var(--shadow-xs)',
        ...style,
      }}
      {...rest}
    >
      {items.map(it => {
        const on = it.id === value;
        return (
          <button
            key={it.id}
            onClick={() => onChange && onChange(it.id)}
            style={{
              height: H, padding: '0 16px', border: 'none', borderRadius: 999,
              background: on ? 'var(--cha-blue-500)' : 'transparent',
              color: on ? 'var(--cha-white)' : 'var(--cha-zinc-700)',
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
