import React from 'react';

/**
 * Card — the primary surface. Default is a white panel on a soft
 * shadow with generous rounding. Colored variants power feature
 * cards (blue module, orange "Resume where you left off", etc.).
 */
const VARIANTS = {
  default: { bg: 'var(--surface-card)', color: 'var(--text-primary)', shadow: 'var(--shadow-card)', border: 'none' },
  outline: { bg: 'var(--surface-card)', color: 'var(--text-primary)', shadow: 'none', border: '1px solid var(--cha-zinc-200)' },
  sunken:  { bg: 'var(--cha-zinc-50)', color: 'var(--text-primary)', shadow: 'none', border: '1px solid var(--cha-zinc-150)' },
  dark:    { bg: 'var(--cha-eclipse)', color: 'var(--cha-white)', shadow: 'var(--shadow-md)', border: 'none' },
  orange:  { bg: 'var(--color-primary)', color: 'var(--cha-white)', shadow: 'var(--shadow-md)', border: 'none' },
  ocean:   { bg: 'var(--cha-ocean-500)', color: 'var(--cha-white)', shadow: 'var(--shadow-md)', border: 'none' },
  accent:  { bg: 'var(--cha-blue-500)', color: 'var(--cha-white)', shadow: 'var(--shadow-md)', border: 'none' },
};

export function Card({
  children,
  variant = 'default',
  padding = 24,
  radius = 24,
  style = {},
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <div
      style={{
        background: v.bg,
        color: v.color,
        borderRadius: radius,
        boxShadow: v.shadow,
        border: v.border,
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
