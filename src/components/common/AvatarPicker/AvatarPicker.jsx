import React, { useState, useRef } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { PRESET_AVATARS } from '../../../constants/avatars';
import styles from './AvatarPicker.module.css';

export default function AvatarPicker({ onSelectFile, onCancel }) {
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handlePresetSelect = (id) => {
    setSelectedAvatarId(id);
    setError(null);
  };

  const handleConfirm = async () => {
    if (!selectedAvatarId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const avatar = PRESET_AVATARS.find(a => a.id === selectedAvatarId);
      if (!avatar) throw new Error("Avatar not found");

      if (avatar.src.endsWith('.svg')) {
        const file = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 300, 300);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], `${avatar.id}.png`, { type: 'image/png' }));
              } else {
                reject(new Error("Canvas conversion failed"));
              }
            }, 'image/png');
          };
          img.onerror = () => reject(new Error("Failed to load SVG for conversion"));
          img.src = avatar.src;
        });
        await onSelectFile(file);
      } else {
        const response = await fetch(avatar.src);
        if (!response.ok) throw new Error("Failed to load avatar asset");
        const blob = await response.blob();
        const file = new File([blob], `${avatar.id}.png`, { type: 'image/png' });
        await onSelectFile(file);
      }
    } catch (err) {
      console.error(err);
      setError("Could not process the selected avatar. Please try another or upload your own.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await onSelectFile(file);
    }
  };

  return (
    <div className={styles.pickerContainer}>
      <h3 className={styles.heading} id="avatar-picker-heading">Choose an Avatar</h3>
      <p className={styles.description}>
        Select one of our predefined avatars, or upload a custom image.
      </p>

      {error && (
        <div className={styles.errorAlert} role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </div>
      )}

      <div 
        className={styles.grid} 
        role="group" 
        aria-labelledby="avatar-picker-heading"
      >
        {PRESET_AVATARS.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              className={`${styles.avatarBtn} ${isSelected ? styles.selected : ''}`}
              aria-label={`Select ${avatar.name} avatar`}
              aria-pressed={isSelected}
              onClick={() => handlePresetSelect(avatar.id)}
            >
              <img 
                src={avatar.src} 
                alt={avatar.alt} 
                className={styles.avatarImg}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add(styles.imageError);
                }}
              />
              {isSelected && (
                <div className={styles.checkBadge}>
                  <Check size={14} aria-hidden="true" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button 
          type="button" 
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={!selectedAvatarId || isLoading}
        >
          {isLoading ? 'Processing...' : 'Confirm Selection'}
        </button>
        
        <div className={styles.divider}>
          <span>or</span>
        </div>
        
        <button 
          type="button" 
          className={styles.uploadBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload size={16} aria-hidden="true" /> Upload from device
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleFileChange}
          aria-label="Upload custom avatar from device"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
