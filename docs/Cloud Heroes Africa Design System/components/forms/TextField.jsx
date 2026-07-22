import React from 'react';
import { Input } from './Input.jsx';

/**
 * TextField — labeled field: label + Input + helper/error text.
 * Wraps the Input primitive.
 */
export function TextField({ label, helper, error, required = false, style = {}, ...inputProps }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
          {label}{required && <span style={{ color: 'var(--cha-danger)' }}> *</span>}
        </span>
      )}
      <Input
        {...inputProps}
        containerStyle={error ? { borderColor: 'var(--cha-danger)', boxShadow: '0 0 0 4px rgba(255,56,60,0.12)' } : undefined}
      />
      {(error || helper) && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: error ? 'var(--cha-danger)' : 'var(--cha-zinc-500)' }}>
          {error || helper}
        </span>
      )}
    </label>
  );
}
