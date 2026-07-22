import React from 'react';

/**
 * ScrollShadow — wraps a scrollable region and fades its edges with a
 * gradient (matching the surface behind it). Purely cosmetic overlay.
 */
export function ScrollShadow({
  children,
  orientation = 'vertical', // vertical | horizontal
  size = 32,
  color = 'var(--surface-card)',
  style = {},
  ...rest
}) {
  const v = orientation === 'vertical';
  const grad = (dir) => `linear-gradient(${dir}, ${color}, ${color.replace(/rgb\(([^)]+)\)/, 'rgba($1,0)')})`;
  return (
    <div style={{ position: 'relative', ...style }} {...rest}>
      <div style={{ position: 'absolute', top: 0, left: 0, [v ? 'right' : 'bottom']: 0, [v ? 'height' : 'width']: size,
        background: `linear-gradient(${v ? 'to bottom' : 'to right'}, ${color}, transparent)`, pointerEvents: 'none', zIndex: 2, borderRadius: 'inherit' }} />
      <div style={{ overflow: v ? 'auto hidden' : 'hidden auto', ...(v ? { overflowY: 'auto' } : { overflowX: 'auto' }) }}>
        {children}
      </div>
      <div style={{ position: 'absolute', bottom: 0, [v ? 'left' : 'top']: 0, right: 0, [v ? 'height' : 'width']: size,
        background: `linear-gradient(${v ? 'to top' : 'to left'}, ${color}, transparent)`, pointerEvents: 'none', zIndex: 2, borderRadius: 'inherit' }} />
    </div>
  );
}
