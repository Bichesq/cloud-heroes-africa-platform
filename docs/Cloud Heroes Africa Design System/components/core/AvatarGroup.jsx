import React from 'react';
import { Avatar } from './Avatar.jsx';

/**
 * AvatarGroup — overlapping avatars with a "+N" overflow bubble.
 * Seen on live-session cards and "Share progress with peers".
 */
export function AvatarGroup({ people = [], max = 4, size = 'md', extra = 0, style = {}, ...rest }) {
  const dim = typeof size === 'number' ? size : ({ xs: 24, sm: 32, md: 40, lg: 56 }[size] || 40);
  const shown = people.slice(0, max);
  const overflow = extra || Math.max(0, people.length - max);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...style }} {...rest}>
      {shown.map((p, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -dim * 0.3 }}>
          <Avatar src={p.src} name={p.name} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span style={{
          marginLeft: -dim * 0.3,
          width: dim, height: dim, borderRadius: '50%',
          background: 'var(--cha-zinc-100)',
          border: '2px solid var(--cha-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: dim * 0.34,
          color: 'var(--cha-zinc-700)',
        }}>+{overflow}</span>
      )}
    </div>
  );
}
