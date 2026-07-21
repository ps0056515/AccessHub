import { useState, useRef, useEffect, useId } from 'react';
import styles from './MultiSelectDropdown.module.css';

export default function MultiSelectDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select options...', 
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputAreaRef = useRef(null);
  const listboxId = useId();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  const handleBlur = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget)) {
      setIsOpen(false);
    }
  };

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
    // Prevent interaction if event originated from a pill remove button
    if (e.target !== e.currentTarget) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (activeIndex >= 0 && activeIndex < options.length) {
        handleToggle(options[activeIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(options.length - 1);
      } else {
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0));
      }
    }
  };

  const handleContainerKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (inputAreaRef.current) {
        inputAreaRef.current.focus();
      }
    }
  };

  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className={styles.container} ref={containerRef} onBlur={handleBlur} onKeyDown={handleContainerKeyDown}>
      <div 
        ref={inputAreaRef}
        className={styles.inputArea} 
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={activeDescendantId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
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
        <div 
          id={listboxId}
          className={styles.dropdown} 
          role="listbox" 
          aria-multiselectable="true"
        >
          {options.length === 0 ? (
            <div className={styles.emptyOption} role="option" aria-disabled="true">No options available</div>
          ) : (
            options.map((opt, index) => {
              const isSelected = value.includes(opt);
              const isActive = index === activeIndex;
              return (
                <div 
                  key={opt}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isActive ? styles.activeOption : ''}`}
                  onClick={() => handleToggle(opt)}
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    readOnly
                    tabIndex={-1}
                    className={styles.checkbox}
                  />
                  <span className={styles.optionText}>{opt}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
