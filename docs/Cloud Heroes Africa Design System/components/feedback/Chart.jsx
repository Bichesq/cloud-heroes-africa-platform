import React from 'react';

/**
 * Chart — lightweight data viz used on the dashboard/profile
 * (Activity Overview spark line, Monthly Streak bars). Not a full
 * charting lib: bars, a smoothed line, and a trend sparkline.
 */
const TONES = {
  orange: 'var(--color-primary)',
  ocean: 'var(--cha-ocean-500)',
  blue: 'var(--cha-blue-500)',
  muted: 'var(--cha-zinc-150)',
};

function polyline(data, w, h, pad = 4) {
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const span = max - min || 1;
  return data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export function Chart({
  type = 'bar',          // bar | line | trend
  data = [],
  labels = [],
  tone = 'orange',
  highlight = -1,        // index to emphasize (bars)
  width = 260,
  height = 120,
  style = {},
  ...rest
}) {
  const color = TONES[tone] || tone;
  if (type === 'bar') {
    const max = Math.max(...data, 1);
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height, ...style }} {...rest}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', height: `${(v / max) * 100}%`, minHeight: 4,
              background: i === highlight ? color : 'var(--cha-zinc-150)', borderRadius: 6, transition: 'height 400ms cubic-bezier(0.22,1,0.36,1)' }} />
            {labels[i] && <span style={{ fontSize: 10, color: 'var(--cha-zinc-400)' }}>{labels[i]}</span>}
          </div>
        ))}
      </div>
    );
  }
  // line / trend
  const pts = polyline(data, width, height, type === 'trend' ? 2 : 6);
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={style} {...rest}>
      {type === 'line' && (
        <polygon points={`${pts} ${width - 6},${height} 6,${height}`} fill={color} opacity="0.08" />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth={type === 'trend' ? 2 : 2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
