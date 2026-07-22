import React from 'react';

/** AxisY — vertical tick labels down the left of a chart plot. */
export function AxisY({ ticks = [], height = 120, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, fontSize: 10, color: 'var(--cha-zinc-400)', fontFamily: 'var(--font-body)', ...style }} {...rest}>
      {ticks.map((t, i) => <span key={i}>{t}</span>)}
    </div>
  );
}
