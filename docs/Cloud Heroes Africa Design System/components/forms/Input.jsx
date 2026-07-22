import React from 'react';

/**
 * Input — text field with optional leading/trailing adornments.
 * Radius 12, soft white fill, subtle shadow; focus ring in blue.
 * The global search uses shape="pill".
 */
const SIZES = {
  sm: { height: 36, fontSize: 14, padH: 12 },
  md: { height: 44, fontSize: 15, padH: 14 },
  lg: { height: 52, fontSize: 16, padH: 16 },
};

export function Input({
  size = 'md',
  shape = 'rounded', // rounded | pill
  leading = null,
  trailing = null,
  disabled = false,
  style = {},
  containerStyle = {},
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const [focus, setFocus] = React.useState(false);
  const radius = shape === 'pill' ? 999 : 12;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: s.height,
        padding: `0 ${s.padH}px`,
        background: disabled ? 'var(--cha-zinc-50)' : 'var(--field-background, #fff)',
        border: '1px solid var(--cha-zinc-200)',
        borderRadius: radius,
        boxShadow: focus
          ? '0 0 0 4px rgba(4,133,247,0.15)'
          : '0 1px 2px rgba(0,0,0,0.04)',
        outline: focus ? '1px solid var(--cha-blue-500)' : 'none',
        transition: 'box-shadow 130ms ease, outline 130ms ease',
        opacity: disabled ? 0.6 : 1,
        ...containerStyle,
      }}
    >
      {leading && <span style={{ display: 'flex', color: 'var(--cha-zinc-500)' }}>{leading}</span>}
      <input
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'var(--font-body)', fontSize: s.fontSize, color: 'var(--text-primary)',
          ...style,
        }}
        {...rest}
      />
      {trailing && <span style={{ display: 'flex', color: 'var(--cha-zinc-500)' }}>{trailing}</span>}
    </div>
  );
}
