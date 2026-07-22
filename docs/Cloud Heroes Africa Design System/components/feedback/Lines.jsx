import React from 'react';

/** Lines — a smoothed multi-series line overlay for charts. */
export function Lines({ series = [], width = 260, height = 120, colors = ['var(--color-primary)','var(--cha-ocean-500)'], style = {}, ...rest }) {
  const all = series.flat();
  const max = Math.max(...all, 1), min = Math.min(...all, 0), span = (max - min) || 1;
  const path = (data) => data.map((v, i) => {
    const x = 4 + (i / (data.length - 1)) * (width - 8);
    const y = height - 4 - ((v - min) / span) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={style} {...rest}>
      {series.map((s, i) => (
        <polyline key={i} points={path(s)} fill="none" stroke={colors[i % colors.length]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}
