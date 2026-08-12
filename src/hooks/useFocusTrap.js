import { useEffect } from 'react';

/**
 * A hook that traps focus within a specific DOM element when active.
 * Useful for accessible modals, dialogs, and dropdown menus.
 * 
 * @param {React.RefObject} ref - Ref to the container element
 * @param {boolean} isActive - Whether the focus trap should be active
 */
export default function useFocusTrap(ref, isActive) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => {
        return (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) &&
               !el.closest('[aria-hidden="true"]');
      });
      
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on the first element or outside, wrap to the last element
        if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on the last element or outside, wrap to the first element
        if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, ref]);
}
