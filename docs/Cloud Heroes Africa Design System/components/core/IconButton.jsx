import React from 'react';

/** IconButton — square/circular button holding a single icon.
 *  Used for theme toggles, close, nav bell, ellipsis menus. */
const SIZES = { sm: 32, md: 40, lg: 44 };

export function IconButton({
  children,
  size = 'md',
  variant = 'ghost', // ghost | soft | dark | white
  shape = 'circle',  // circle | square
  disabled = false,
  style = {},
  ...rest
}) {
  const dim = SIZES[size] || 40;
  const [hover, setHover] = React.useState(false);
  const V = {
    ghost: { bg: hover ? 'var(--cha-zinc-50)' : 'transparent', color: 'var(--cha-ink)' },
    soft:  { bg: hover ? 'var(--cha-zinc-150)' : 'var(--cha-zinc-100)', color: 'var(--cha-ink)' },
    dark:  { bg: hover ? 'var(--cha-zinc-800)' : 'var(--cha-eclipse)', color: 'var(--cha-white)' },
    white: { bg: 'var(--cha-white)', color: 'var(--cha-ink)' },
  }[variant] || {};
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: dim, height: dim,
        borderRadius: shape === 'circle' ? '50%' : 12,
        background: V.bg, color: V.color,
        border: variant === 'white' ? '1px solid var(--cha-zinc-200)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 130ms ease',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
