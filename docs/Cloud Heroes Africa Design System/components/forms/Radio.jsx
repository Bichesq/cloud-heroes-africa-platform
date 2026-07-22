import React from 'react';

/** Radio — circular single-select control. Selected = blue ring + dot. */
export function Radio({ checked = false, onChange, size = 20, disabled = false, label = null, name, style = {}, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        onClick={() => !disabled && onChange && onChange(true)}
        style={{
          width: size, height: size, flex: 'none', borderRadius: '50%',
          background: 'var(--cha-white)',
          border: checked ? `${size * 0.28}px solid var(--cha-blue-500)` : '1.5px solid var(--cha-zinc-200)',
          boxSizing: 'border-box',
          transition: 'border 120ms ease',
        }}
        {...rest}
      />
      {label && <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  );
}
