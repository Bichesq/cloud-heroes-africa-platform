import React from 'react';

/** Separator — hairline divider, horizontal or vertical. */
export function Separator({ orientation = 'horizontal', tone = 'default', style = {}, ...rest }) {
  const color = tone === 'strong' ? 'var(--cha-zinc-200)' : 'var(--separator)';
  const isV = orientation === 'vertical';
  return (
    <div
      role="separator"
      style={{
        background: color,
        width: isV ? 1 : '100%',
        height: isV ? '100%' : 1,
        alignSelf: 'stretch',
        flex: 'none',
        ...style,
      }}
      {...rest}
    />
  );
}
