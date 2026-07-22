import React from 'react';

/** SwitchControl — the toggle track+knob only (no label). On = blue / orange. */
export function SwitchControl({ checked = false, onChange, size = 'md', tone = 'blue', disabled = false, style = {}, ...rest }) {
  const d = { sm: { w: 36, h: 20 }, md: { w: 46, h: 26 }, lg: { w: 56, h: 32 } }[size] || { w: 46, h: 26 };
  const knob = d.h - 6;
  const on = tone === 'orange' ? 'var(--color-primary)' : 'var(--cha-blue-500)';
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => !disabled && onChange && onChange(!checked)} style={{
      width: d.w, height: d.h, flex: 'none', borderRadius: 999, border: 'none', padding: 0, position: 'relative',
      background: checked ? on : 'var(--cha-zinc-200)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      transition: 'background 160ms ease', ...style,
    }} {...rest}>
      <span style={{ position: 'absolute', top: 3, left: checked ? d.w - knob - 3 : 3, width: knob, height: knob, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 160ms cubic-bezier(0.22,1,0.36,1)' }} />
    </button>
  );
}
