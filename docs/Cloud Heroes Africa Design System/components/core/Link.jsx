import React from 'react';

/** Link — inline text link. Default is ink with an underline on hover;
 *  accent variant is electric blue (Forgot email?, Learn more). */
export function Link({ children, href = '#', variant = 'default', style = {}, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const color = variant === 'accent' ? 'var(--cha-blue-500)' : 'var(--cha-ink)';
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color,
        fontFamily: 'var(--font-body)',
        fontWeight: variant === 'accent' ? 600 : 500,
        textDecoration: hover ? 'underline' : 'none',
        textUnderlineOffset: 3,
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
