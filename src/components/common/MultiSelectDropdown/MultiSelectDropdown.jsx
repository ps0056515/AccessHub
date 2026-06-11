import { useState, useRef, useEffect } from 'react';
import styles from './MultiSelectDropdown.module.css';

export default function MultiSelectDropdown({ options, value, onChange, placeholder = 'Select options...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (option) => {
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleRemove = (e, option) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== option));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div 
        className={styles.inputArea} 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className={styles.pillsContainer}>
          {value.length === 0 && <span className={styles.placeholder}>{placeholder}</span>}
          {value.map(tag => (
            <span key={tag} className={styles.pill}>
              {tag}
              <button 
                type="button" 
                className={styles.removeBtn} 
                onClick={(e) => handleRemove(e, tag)}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <span className={styles.chevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.length === 0 ? (
            <div className={styles.emptyOption}>No options available</div>
          ) : (
            options.map(opt => (
              <label key={opt} className={styles.option}>
                <input 
                  type="checkbox" 
                  checked={value.includes(opt)} 
                  onChange={() => handleToggle(opt)} 
                  className={styles.checkbox}
                />
                <span className={styles.optionText}>{opt}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
