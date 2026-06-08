import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

export default function Tooltip({ 
  children, 
  content, 
  position = 'top', 
  delay = 200,
  disabled = false,
  fullWidth = false
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;
      
      if (position === 'top') {
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
      } else if (position === 'bottom') {
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
      } else if (position === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
      } else if (position === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
      }
      setCoords({ top, left });
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={wrapperRef}
      className={`${styles.tooltipWrapper} ${fullWidth ? styles.fullWidth : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      {isVisible && createPortal(
        <div 
          className={`${styles.tooltipBox} ${styles[position]}`} 
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
        >
          {content}
          <div className={styles.tooltipArrow} />
        </div>,
        document.body
      )}
    </div>
  );
}
