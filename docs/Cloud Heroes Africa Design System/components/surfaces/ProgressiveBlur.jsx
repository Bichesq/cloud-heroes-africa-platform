import React from 'react';

/**
 * ProgressiveBlur — a stack of increasing backdrop-blur bands that fade
 * one edge of content to frosted (e.g. behind a sticky footer/header).
 */
export function ProgressiveBlur({
  side = 'bottom', // top | bottom
  height = 80,
  color = 'light', // light | dark
  style = {},
  ...rest
}) {
  const tint = color === 'dark' ? '6,6,7' : '255,255,255';
  const dir = side === 'bottom' ? 'to top' : 'to bottom';
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, [side]: 0, height, pointerEvents: 'none',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      maskImage: `linear-gradient(${dir}, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)`,
      WebkitMaskImage: `linear-gradient(${dir}, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)`,
      background: `linear-gradient(${dir}, rgba(${tint},0.8), rgba(${tint},0))`,
      ...style,
    }} {...rest} />
  );
}
