import React from 'react';

/**
 * CHA Button — pill-shaped action control.
 * Variants pull from the platform's real usage: orange primary CTAs,
 * blue accent, near-black "dark", soft gray secondary, ghost, danger.
 */
const SIZES = {
  sm: { height: 32, padding: '0 14px', fontSize: 14, gap: 6, radius: 999 },
  md: { height: 40, padding: '0 18px', fontSize: 15, gap: 8, radius: 999 },
  lg: { height: 48, padding: '0 26px', fontSize: 16, gap: 10, radius: 999 },
};

const VARIANTS = {
  primary:   { bg: 'var(--color-primary)', color: 'var(--cha-white)', border: 'transparent', hover: 'var(--cha-orange-500)' },
  accent:    { bg: 'var(--cha-blue-500)', color: 'var(--cha-white)', border: 'transparent', hover: 'var(--cha-blue-400)' },
  dark:      { bg: 'var(--cha-eclipse)', color: 'var(--cha-white)', border: 'transparent', hover: 'var(--cha-zinc-800)' },
  secondary: { bg: 'var(--cha-zinc-100)', color: 'var(--cha-ink)', border: 'transparent', hover: 'var(--cha-zinc-150)' },
  ghost:     { bg: 'transparent', color: 'var(--cha-ink)', border: 'transparent', hover: 'var(--cha-zinc-50)' },
  outline:   { bg: 'var(--cha-white)', color: 'var(--cha-ink)', border: 'var(--cha-zinc-200)', hover: 'var(--cha-zinc-50)' },
  danger:    { bg: 'var(--cha-danger)', color: 'var(--cha-white)', border: 'transparent', hover: 'rgb(255,85,81)' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  block = false,
  disabled = false,
  style = {},
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: block ? 'flex' : 'inline-flex',
        width: block ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1,
        color: v.color,
        background: disabled ? 'var(--cha-zinc-100)' : (hover ? v.hover : v.bg),
        border: `1px solid ${v.border}`,
        borderRadius: s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'background 140ms ease, transform 100ms ease',
        transform: hover && !disabled ? 'translateY(-1px)' : 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
