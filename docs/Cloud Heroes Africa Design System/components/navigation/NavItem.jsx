import React from 'react';

/**
 * NavItem — sidebar navigation row. Active state is a filled pill
 * (orange in the product shell); default is ghost with a hover fill.
 * Optionally shows a leading icon, a trailing chevron or a "New" badge.
 */
export function NavItem({
  children,
  icon = null,
  active = false,
  activeTone = 'orange', // orange | dark | soft
  badge = null,
  chevron = false,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  let bg = 'transparent', color = 'var(--text-primary)';
  if (active) {
    if (activeTone === 'orange') { bg = 'var(--color-primary)'; color = 'var(--cha-white)'; }
    else if (activeTone === 'dark') { bg = 'var(--cha-eclipse)'; color = 'var(--cha-white)'; }
    else { bg = 'var(--cha-zinc-100)'; color = 'var(--text-primary)'; }
  } else if (hover) { bg = 'var(--cha-zinc-50)'; }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        height: 48, padding: '0 16px',
        background: bg, color, border: 'none', borderRadius: 999,
        fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15,
        cursor: 'pointer', transition: 'background 130ms ease, color 130ms ease',
        textAlign: 'left',
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: 'flex', flex: 'none' }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
      {badge && (
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
          background: active ? 'rgba(255,255,255,0.25)' : 'var(--cha-blue-soft)',
          color: active ? 'var(--cha-white)' : 'var(--cha-blue-500)',
        }}>{badge}</span>
      )}
      {chevron && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6 }}>
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
