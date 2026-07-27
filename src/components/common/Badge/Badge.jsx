import React from 'react';

// Maps legacy hex backgrounds to accessible semantic tokens
function getTokensFromBg(bgHex) {
  const map = {
    '#e8f0fb': { bg: 'var(--blue-bg)', text: 'var(--blue-text)' }, // blue
    '#e6f4ee': { bg: 'var(--green-bg)', text: 'var(--green-text)' }, // green
    '#fef3e2': { bg: 'var(--amber-bg)', text: 'var(--amber-text)' }, // amber
    '#fdecea': { bg: 'var(--red-bg)', text: 'var(--red-text)' }, // red
    '#f0edfd': { bg: 'var(--purple-bg)', text: 'var(--purple-text)' }, // purple
    '#f3f2ef': { bg: 'var(--surface-secondary)', text: 'var(--text-primary)' }, // legal/gray
    '#fde8f0': { bg: 'var(--pink-bg)', text: 'var(--pink-text)' } // pink
  };
  return map[bgHex] || { bg: 'var(--surface-secondary)', text: 'var(--text-secondary)' };
}

export default function Badge({ bg, text, children, className = '', as: Component = 'span', ...props }) {
  const tokens = bg ? getTokensFromBg(bg) : { bg: 'var(--surface-secondary)', text: 'var(--text-secondary)' };
  
  return (
    <Component 
      className={className} 
      style={{ background: tokens.bg, color: tokens.text, ...props.style }} 
      {...props}
    >
      {children}
    </Component>
  );
}
