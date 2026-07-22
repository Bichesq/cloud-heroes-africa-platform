import React from 'react';

/** Indicator — tiny colored dot for legends & status
 *  (calendar categories, online state). */
const COLORS = {
  ocean: 'var(--cha-ocean-500)',
  blue: 'var(--cha-blue-500)',
  orange: 'var(--color-primary)',
  green: 'var(--cha-success)',
  red: 'var(--cha-danger)',
  black: 'var(--cha-eclipse)',
  white: 'var(--cha-white)',
};

export function Indicator({ color = 'ocean', size = 10, ring = false, style = {}, ...rest }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size, height: size, borderRadius: '50%',
        background: COLORS[color] || color,
        border: ring ? '2px solid var(--cha-white)' : 'none',
        boxShadow: ring ? '0 0 0 1px var(--cha-zinc-200)' : 'none',
        flex: 'none',
        ...style,
      }}
      {...rest}
    />
  );
}
