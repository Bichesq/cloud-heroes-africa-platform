import React from 'react';

/** CardHeader — title row for a Card: title, optional subtitle,
 *  and a trailing action slot (e.g. "See all"). */
export function CardHeader({ title, subtitle, action, style = {}, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, ...style }} {...rest}>
      <div>
        {title && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: 1.15 }}>{title}</div>}
        {subtitle && <div style={{ fontSize: 13.5, color: 'var(--cha-zinc-500)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && <div style={{ flex: 'none' }}>{action}</div>}
    </div>
  );
}
