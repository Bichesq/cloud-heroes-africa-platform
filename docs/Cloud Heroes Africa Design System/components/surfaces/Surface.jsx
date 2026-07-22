import React from 'react';

/**
 * Surface — neutral container variants used to nest content
 * (secondary/tertiary panels, dark surfaces). Lighter than Card:
 * no default shadow, tuned fills.
 */
const VARIANTS = {
  primary:   { bg: 'var(--surface-card)' },
  secondary: { bg: 'var(--cha-zinc-75)' },
  tertiary:  { bg: 'var(--cha-zinc-100)' },
  dark:      { bg: 'var(--cha-eclipse)', color: 'var(--cha-white)' },
  quarternary: { bg: 'rgba(255,255,255,0.82)' },
};

export function Surface({ children, variant = 'primary', radius = 20, padding = 16, style = {}, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <div style={{ background: v.bg, color: v.color, borderRadius: radius, padding, ...style }} {...rest}>
      {children}
    </div>
  );
}
