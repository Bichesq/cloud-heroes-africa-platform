import React from 'react';

/** TagList — a wrapping row of Tags/Chips with consistent gaps. */
export function TagList({ children, gap = 8, wrap = true, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap', ...style }} {...rest}>
      {children}
    </div>
  );
}
