import React, { useEffect, useRef } from 'react';
import Modal from '../Modal/Modal';
import AvatarPicker from './AvatarPicker';

export default function AvatarPickerModal({ isOpen, onClose, onSelectFile, returnFocusRef }) {
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
    } else {
      // Focus restoration when modal closes
      if (returnFocusRef && returnFocusRef.current) {
        returnFocusRef.current.focus();
      } else if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
  }, [isOpen, returnFocusRef]);

  if (!isOpen) return null;

  return (
    <Modal 
      title="Update Profile Picture" 
      onClose={onClose}
      width="400px"
    >
      <AvatarPicker 
        onSelectFile={onSelectFile} 
        onCancel={onClose} 
      />
    </Modal>
  );
}
