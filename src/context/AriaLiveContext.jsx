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
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  
  const politeTimeoutRef = useRef(null);
  const assertiveTimeoutRef = useRef(null);

  const announce = useCallback((msg, priority = 'polite') => {
    const setMsg = priority === 'assertive' ? setAssertiveMessage : setPoliteMessage;
    const timeoutRef = priority === 'assertive' ? assertiveTimeoutRef : politeTimeoutRef;
    
    setMsg('');
    // Slight delay ensures screen reader registers a change if the same message is announced twice
    setTimeout(() => {
      setMsg(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setMsg(''), 3000);
    }, 50);
  }, []);

  const hiddenStyle = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };

  return (
    <AriaLiveContext.Provider value={{ announce }}>
      {children}
      <div aria-live="polite" aria-atomic="true" style={hiddenStyle}>
        {politeMessage}
      </div>
      <div aria-live="assertive" aria-atomic="true" style={hiddenStyle}>
        {assertiveMessage}
      </div>
    </AriaLiveContext.Provider>
  );
}
