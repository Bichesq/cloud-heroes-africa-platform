import React from 'react';
import { Indicator } from './Indicator.jsx';

/** Legend — a row of colored dots with labels (chart / calendar keys). */
export function Legend({ items = [], gap = 20, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: 'wrap', ...style }} {...rest}>
      {items.map((it, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--cha-zinc-500)', fontFamily: 'var(--font-body)' }}>
          <Indicator color={it.color} /> {it.label}
        </span>
      ))}
    </div>
  );
}
