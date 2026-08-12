import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from 'components/common/Toast/ToastContainer';
import { useAriaLive } from './AriaLiveContext';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { announce } = useAriaLive();

  const addToast = useCallback((message, optionsOrType = 'success') => {
    // Backwards compatibility for options object vs type string
    const isObj = typeof optionsOrType === 'object' && optionsOrType !== null;
    const type = isObj ? (optionsOrType.type || 'success') : optionsOrType;
    const shouldAnnounce = isObj ? (optionsOrType.announce !== false) : true;
    
    // Extract string text safely from non-string messages
    let textToAnnounce = '';
    if (typeof message === 'string') {
      textToAnnounce = message;
    } else if (message?.props?.children) {
      if (typeof message.props.children === 'string') {
        textToAnnounce = message.props.children;
      } else if (Array.isArray(message.props.children)) {
        textToAnnounce = message.props.children.filter(c => typeof c === 'string').join(' ');
      }
    }
    
    // Announce with strict priority mapping
    if (shouldAnnounce && textToAnnounce) {
      const priority = type === 'error' ? 'assertive' : 'polite';
      announce(textToAnnounce, priority);
    }

    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, [announce]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
