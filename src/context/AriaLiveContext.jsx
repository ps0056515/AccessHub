import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AriaLiveContext = createContext(null);

export function useAriaLive() {
  const context = useContext(AriaLiveContext);
  if (!context) {
    throw new Error('useAriaLive must be used within an AriaLiveProvider');
  }
  return context;
}

export function AriaLiveProvider({ children }) {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef(null);

  const announce = useCallback((msg) => {
    setMessage('');
    // Slight delay ensures screen reader registers a change if the same message is announced twice
    setTimeout(() => {
      setMessage(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMessage(''), 3000);
    }, 50);
  }, []);

  return (
    <AriaLiveContext.Provider value={{ announce }}>
      {children}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {message}
      </div>
    </AriaLiveContext.Provider>
  );
}
