import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

export default function Modal({ title, children, onClose, footer, width= "50%", height }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  const onCloseRef = useRef(onClose);

  // Keep ref updated with the latest onClose function without triggering re-renders
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Store the currently focused element
    previousFocusRef.current = document.activeElement;

    // Use a small timeout to ensure the portal is fully mounted before focusing
    const focusTimeout = setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }, 10);

    const onKey = e => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }
      
      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        
        const focusableElements = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement || document.activeElement === dialogRef.current) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      clearTimeout(focusTimeout);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      
      // Restore focus when modal closes
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  const dialogStyle = {};
  if (width) {
    dialogStyle.width = width;
    dialogStyle.maxWidth = '100%';
  }
  if (height) {
    dialogStyle.height = height;
    dialogStyle.maxHeight = '90vh';
  }

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
      onKeyDown={e => e.key === 'Escape' && onClose?.()}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        style={dialogStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
}
