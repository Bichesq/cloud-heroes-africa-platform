import React from 'react';
import { Tab } from './Tab.jsx';

/** TabsElement — a segmented row built from Tab pills inside a soft track. */
export function TabsElement({ items = [], value, onChange, activeTone = 'dark', size = 'md', style = {}, ...rest }) {
  return (
    <div role="tablist" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: 4, background: 'var(--cha-zinc-50)', borderRadius: 999, ...style }} {...rest}>
      {items.map(it => (
        <Tab key={it.id} active={it.id === value} activeTone={activeTone} size={size} onClick={() => onChange && onChange(it.id)}>{it.label}</Tab>
      ))}
    </div>
  );
}
