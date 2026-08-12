import React, { useState, useRef, useEffect, useId } from 'react';
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
  const closeTimeoutRef = useRef(null);
  const wrapperRef = useRef(null);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    if (disabled || !content) return;
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
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
    closeTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isVisible) {
      e.stopPropagation();
      handleMouseLeave();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        e.stopPropagation();
        handleMouseLeave();
      }
    };

    if (isVisible) {
      // Use capture phase to intercept the Escape key before it reaches Modals or other containers
      document.addEventListener('keydown', handleGlobalKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [isVisible]);

  const child = React.isValidElement(children) ? React.Children.only(children) : null;
  const childProps = child ? {
    'aria-describedby': (isVisible && content && !child.props['aria-label']) ? tooltipId : undefined,
  } : {};

  return (
    <div 
      ref={wrapperRef}
      className={`${styles.tooltipWrapper} ${fullWidth ? styles.fullWidth : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {child ? React.cloneElement(child, childProps) : children}
      {isVisible && createPortal(
        <div 
          id={tooltipId}
          className={`${styles.tooltipBox} ${styles[position]}`} 
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
          <div className={styles.tooltipArrow} />
        </div>,
        document.body
      )}
    </div>
  );
}
