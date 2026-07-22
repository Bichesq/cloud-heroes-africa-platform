import React from 'react';

/**
 * Chip — filter / category pill (the "All · DevOps · Security" row,
 * course category badges). Selected chips go near-black; category
 * chips can be tinted.
 */
const SIZES = {
  sm: { height: 26, padding: '0 12px', fontSize: 13 },
  md: { height: 34, padding: '0 18px', fontSize: 15 },
  lg: { height: 44, padding: '0 24px', fontSize: 16 },
};

export function Chip({
  children,
  selected = false,
  size = 'md',
  tone = 'default', // default | dark | ocean | orange
  onClick,
  style = {},
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);

  let bg = 'transparent';
  let color = 'var(--cha-ink)';
  if (selected || tone === 'dark') { bg = 'var(--cha-eclipse)'; color = 'var(--cha-white)'; }
  else if (tone === 'ocean') { bg = 'var(--cha-ocean-500)'; color = 'var(--cha-white)'; }
  else if (tone === 'orange') { bg = 'var(--color-primary)'; color = 'var(--cha-white)'; }
  else if (hover) { bg = 'var(--cha-zinc-50)'; }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: s.height,
        padding: s.padding,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: s.fontSize,
        lineHeight: 1,
        color,
        background: bg,
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        transition: 'background 130ms ease, color 130ms ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
