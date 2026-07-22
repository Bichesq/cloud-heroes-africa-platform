import React from 'react';

/**
 * ProgressBar — rounded pill track with a colored fill and inline %.
 * Learning-progress rows use orange, ocean and orange fills.
 */
const TONES = {
  orange: 'linear-gradient(90deg, var(--cha-orange-400), var(--color-primary))',
  ocean:  'linear-gradient(90deg, var(--cha-ocean-400), var(--cha-ocean-600))',
  blue:   'var(--cha-blue-500)',
  dark:   'var(--cha-eclipse)',
};

export function ProgressBar({
  value = 0,
  tone = 'orange',
  height = 34,
  showValue = true,
  track = 'var(--cha-zinc-100)',
  style = {},
  ...rest
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill = TONES[tone] || TONES.orange;
  const filled = pct >= 20;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        background: track,
        borderRadius: 999,
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <div style={{
        position: 'absolute', inset: 0, width: `${pct}%`,
        background: fill, borderRadius: 999,
        transition: 'width 400ms cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: filled ? 14 : 0,
      }}>
        {showValue && filled && (
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: height * 0.42, color: 'var(--cha-white)' }}>{pct}%</span>
        )}
      </div>
      {showValue && !filled && (
        <span style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: height * 0.42, color: 'var(--cha-ink)',
        }}>{pct}%</span>
      )}
    </div>
  );
}
