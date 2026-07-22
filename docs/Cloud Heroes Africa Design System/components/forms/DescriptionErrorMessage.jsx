import React from 'react';

/** DescriptionErrorMessage — helper or error text below a field.
 *  variant="error" turns it danger-red. */
export function DescriptionErrorMessage({ children, variant = 'description', style = {}, ...rest }) {
  const error = variant === 'error';
  return (
    <span style={{
      display: 'block', fontFamily: 'var(--font-body)', fontSize: 12.5, lineHeight: 1.4,
      color: error ? 'var(--cha-danger)' : 'var(--cha-zinc-500)', ...style,
    }} {...rest}>
      {children}
    </span>
  );
}
