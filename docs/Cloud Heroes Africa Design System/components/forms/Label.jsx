import React from 'react';

/** Label — form field label with optional required asterisk & hint. */
export function Label({ children, required = false, hint = null, htmlFor, style = {}, ...rest }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', ...style }} {...rest}>
      {children}
      {required && <span style={{ color: 'var(--cha-danger)' }}>*</span>}
      {hint && <span style={{ fontWeight: 400, fontSize: 12.5, color: 'var(--cha-zinc-400)' }}>{hint}</span>}
    </label>
  );
}
