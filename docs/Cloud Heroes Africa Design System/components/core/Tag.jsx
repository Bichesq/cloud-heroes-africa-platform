import React from 'react';

/**
 * Tag — small status label used in tables & lists
 * (In Progress / Submitted / Not Started / grades).
 */
const TONES = {
  neutral: { bg: 'var(--cha-zinc-100)', color: 'var(--cha-zinc-700)' },
  orange:  { bg: 'var(--color-primary)', color: 'var(--cha-white)' },
  ocean:   { bg: 'var(--cha-ocean-500)', color: 'var(--cha-white)' },
  success: { bg: 'var(--cha-success-soft)', color: 'rgb(43,119,68)' },
  warning: { bg: 'var(--cha-warning-soft)', color: 'rgb(133,95,44)' },
  danger:  { bg: 'var(--cha-danger-soft)', color: 'rgb(164,53,50)' },
  dark:    { bg: 'var(--cha-eclipse)', color: 'var(--cha-white)' },
};
const SIZES = {
  sm: { height: 20, padding: '0 8px', fontSize: 11 },
  md: { height: 26, padding: '0 12px', fontSize: 12 },
};

export function Tag({ children, tone = 'neutral', size = 'md', style = {}, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  const s = SIZES[size] || SIZES.md;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: s.height,
        padding: s.padding,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1,
        color: t.color,
        background: t.bg,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
