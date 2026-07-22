import React from 'react';

/** CheckboxControl — the visual checkbox box only (no label). Checked = near-black. */
export function CheckboxControl({ checked = false, onChange, size = 20, disabled = false, style = {}, ...rest }) {
  return (
    <span onClick={() => !disabled && onChange && onChange(!checked)} style={{
      width: size, height: size, flex: 'none', borderRadius: 6, cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? 'var(--cha-eclipse)' : 'var(--cha-white)',
      border: checked ? 'none' : '1.5px solid var(--cha-zinc-200)', opacity: disabled ? 0.5 : 1,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms ease', ...style,
    }} {...rest}>
      {checked && (<svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5l3 3 6-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
    </span>
  );
}
