import React from 'react';

/**
 * Avatar — circular user image with optional ring & status dot.
 * The profile hero uses a thick blue ring; nav uses a plain circle.
 */
const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 96, '2xl': 160 };

export function Avatar({
  src,
  name = '',
  size = 'md',
  ring = false,
  ringColor = 'var(--cha-blue-500)',
  status = null, // 'online' | 'busy' | null
  style = {},
  ...rest
}) {
  const dim = typeof size === 'number' ? size : (SIZES[size] || 40);
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }} {...rest}>
      <span
        style={{
          display: 'block',
          width: dim,
          height: dim,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--cha-zinc-100)',
          border: ring ? `${Math.max(2, dim * 0.06)}px solid ${ringColor}` : '2px solid var(--cha-white)',
          boxShadow: ring ? 'none' : '0 0 0 1px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: dim * 0.4,
          color: 'var(--cha-zinc-500)',
        }}
      >
        {src
          ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials}
      </span>
      {status && (
        <span style={{
          position: 'absolute', right: 0, bottom: 0,
          width: dim * 0.28, height: dim * 0.28,
          borderRadius: '50%',
          background: status === 'busy' ? 'var(--cha-warning)' : 'var(--cha-success)',
          border: '2px solid var(--cha-white)',
        }} />
      )}
    </span>
  );
}
