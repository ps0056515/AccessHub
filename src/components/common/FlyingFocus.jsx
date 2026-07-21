import React, { useEffect, useState, useRef } from 'react';

export default function FlyingFocus() {
  const [focusStyle, setFocusStyle] = useState({
    opacity: 0,
    width: 0,
    height: 0,
    transform: 'translate(0px, 0px)',
    borderRadius: '6px'
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const keyDownTimeRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleKeyDown = (e) => {
      if (['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keyDownTimeRef.current = Date.now();
      }
    };

    const handleFocus = (e) => {
      const target = e.target;
      if (!target || target === document || target === window) return;
      
      const isKeyboard = Date.now() - keyDownTimeRef.current < 500;
      
      if (!isKeyboard) {
        setIsVisible(false);
        return;
      }

      setIsVisible(true);
      updatePosition(target);
    };

    const updatePosition = (target) => {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      
      const padding = 2;
      const computedStyle = getComputedStyle(target);
      
      setFocusStyle({
        opacity: 1,
        width: rect.width + (padding * 2),
        height: rect.height + (padding * 2),
        transform: `translate(${rect.left + scrollX - padding}px, ${rect.top + scrollY - padding}px)`,
        borderRadius: computedStyle.borderRadius === '0px' ? '6px' : computedStyle.borderRadius
      });
    };

    const handleBlur = () => {
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          setIsVisible(false);
        }
      }, 0);
    };

    const handleMouseDown = () => {
      setIsVisible(false);
    };

    const handleScroll = () => {
      if (isVisible && document.activeElement) {
        updatePosition(document.activeElement);
      }
    };

    const handleResize = () => {
      if (isVisible && document.activeElement) {
        updatePosition(document.activeElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    document.body.classList.add('has-flying-focus');

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.body.classList.remove('has-flying-focus');
    };
  }, [isVisible]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        border: '2px solid var(--focus-border-color)',
        boxShadow: '0 0 0 2px var(--bg), 0 0 10px var(--focus-ring-color)',
        opacity: isVisible ? 1 : 0,
        width: `${focusStyle.width}px`,
        height: `${focusStyle.height}px`,
        transform: focusStyle.transform,
        borderRadius: focusStyle.borderRadius,
        transition: 'transform 0.35s cubic-bezier(0.2, 0, 0, 1), width 0.1s cubic-bezier(0.2, 0, 0, 1), height 0.1s cubic-bezier(0.2, 0, 0, 1), opacity 0.1s ease',
      }}
    />
  );
}
