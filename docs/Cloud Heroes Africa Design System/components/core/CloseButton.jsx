import React from 'react';

/** CloseButton — circular dismiss control for modals & popovers. */
export function CloseButton({ size = 32, onClick, style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Close"
      style={{
        width: size, height: size, borderRadius: '50%', border: 'none',
        background: hover ? 'var(--cha-zinc-150)' : 'var(--cha-zinc-100)',
        color: 'var(--cha-zinc-700)', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 130ms ease',
        ...style,
      }}
      {...rest}
    >
      <svg width={size * 0.44} height={size * 0.44} viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
