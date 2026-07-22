import React from 'react';

/** Grid — evenly spaced horizontal baselines behind a chart plot. */
export function Grid({ rows = 4, color = 'var(--separator)', style = {}, ...rest }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', ...style }} {...rest}>
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <div key={i} style={{ height: 1, background: color, width: '100%' }} />
      ))}
    </div>
  );
}
