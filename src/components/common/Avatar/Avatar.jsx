import React from 'react';
import { COLOR_MAP } from 'data';
import styles from './Avatar.module.css';

export default function Avatar({ src, initials, color, size = 36, alt = '', className = '' }) {
  const containerStyle = {
    width: size,
    height: size,
    fontSize: size * 0.45,
  };

  const hasAvatar = Boolean(src);
  const themeBg = `var(--${color}-bg, var(--surface-secondary))`;
  const themeText = `var(--${color}-text, var(--text-primary))`;

  if (hasAvatar) {
    return (
      <div 
        className={`${styles.avatarContainer} ${className}`} 
        style={containerStyle}
        aria-hidden={!alt}
      >
        <img src={src} alt={alt} className={styles.avatarImg} />
      </div>
    );
  }

  if (initials) {
    return (
      <div
        className={`${styles.avatarContainer} ${className}`}
        style={{
          ...containerStyle,
          background: themeBg,
          color: themeText,
        }}
        aria-hidden="true"
      >
        <span className={styles.avatarInitials}>{initials}</span>
      </div>
    );
  }

  // Final fallback (SVG silhouette)
  return (
    <div 
      className={`${styles.avatarContainer} ${styles.avatarFallback} ${className}`} 
      style={containerStyle}
      aria-hidden="true"
    >
      <svg 
        width={size * 0.5} 
        height={size * 0.5} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );
}
