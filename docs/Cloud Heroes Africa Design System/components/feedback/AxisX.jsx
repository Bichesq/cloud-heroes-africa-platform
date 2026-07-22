import React from 'react';

/** AxisX — horizontal tick labels beneath a chart plot. */
export function AxisX({ ticks = [], style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--cha-zinc-400)', fontFamily: 'var(--font-body)', ...style }} {...rest}>
      {ticks.map((t, i) => <span key={i}>{t}</span>)}
    </div>
  );
}
