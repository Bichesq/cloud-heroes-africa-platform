import React from 'react';

/** CardFooter — bottom row of a Card. Aligns actions; optional top border. */
export function CardFooter({ children, align = 'end', divider = false, style = {}, ...rest }) {
  const justify = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between' }[align] || 'flex-end';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, justifyContent: justify,
      paddingTop: divider ? 14 : 0, marginTop: divider ? 14 : 0,
      borderTop: divider ? '1px solid var(--separator)' : 'none',
      ...style,
    }} {...rest}>
      {children}
    </div>
  );
}
