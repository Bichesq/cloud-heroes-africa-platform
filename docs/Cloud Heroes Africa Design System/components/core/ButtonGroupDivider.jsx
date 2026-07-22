import React from 'react';

/** ButtonGroupDivider — thin vertical rule between grouped buttons. */
export function ButtonGroupDivider({ inset = 6, color = 'var(--cha-zinc-200)', style = {}, ...rest }) {
  return <div aria-hidden style={{ width: 1, alignSelf: 'stretch', margin: `${inset}px 0`, background: color, flex: 'none', ...style }} {...rest} />;
}
