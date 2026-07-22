import React from 'react';

/**
 * Chips — a single-select group of Chip filters (the
 * "All · DevOps · Security · Terraform" row). Renders its own chips
 * from `items` and manages the selected pill.
 */
export function Chips({ items = [], value, onChange, size = 'md', style = {}, ...rest }) {
  const H = size === 'sm' ? 26 : size === 'lg' ? 44 : 34;
  const fs = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--cha-zinc-50)', borderRadius: 999, padding: 6, flexWrap: 'wrap', ...style }} {...rest}>
      {items.map(it => {
        const on = it.id === value;
        return (
          <button key={it.id} onClick={() => onChange && onChange(it.id)} style={{
            height: H, padding: `0 ${size === 'sm' ? 14 : 20}px`, border: 'none', borderRadius: 999,
            background: on ? 'var(--cha-eclipse)' : 'transparent',
            color: on ? '#fff' : 'var(--cha-ink)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: fs, cursor: 'pointer',
            transition: 'background 130ms ease, color 130ms ease', whiteSpace: 'nowrap',
          }}>{it.label}</button>
        );
      })}
    </div>
  );
}
