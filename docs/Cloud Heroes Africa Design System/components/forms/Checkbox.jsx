import React from 'react';

/** Checkbox — rounded square control. Checked = near-black fill. */
export function Checkbox({ checked = false, onChange, size = 20, disabled = false, label = null, style = {}, ...rest }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: size, height: size, flex: 'none',
          borderRadius: 6,
          background: checked ? 'var(--cha-eclipse)' : 'var(--cha-white)',
          border: checked ? 'none' : '1.5px solid var(--cha-zinc-200)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 120ms ease, border 120ms ease',
        }}
        {...rest}
      >
        {checked && (
          <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8.5l3 3 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  );
}
