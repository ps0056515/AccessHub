import { createContext, useContext, useState, useCallback } from 'react';
import Modal from 'components/common/Modal/Modal';

const ConfirmContext = createContext();

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolveCallback, setResolveCallback] = useState(null);

  const confirm = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolveCallback(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveCallback) resolveCallback(false);
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
      <button 
        onClick={handleCancel} 
        style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text)', fontSize: '14px', fontWeight: 500 }}
      >
        Cancel
      </button>
      <button 
        onClick={handleConfirm} 
        style={{ padding: '8px 16px', background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--red-text)', fontSize: '14px', fontWeight: 500 }}
      >
        Confirm
      </button>
    </div>
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {isOpen && (
        <Modal title="Confirm Action" onClose={handleCancel} footer={footer} width="400px">
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)' }}>{message}</p>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}
