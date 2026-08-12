import { useState, useRef, useEffect, useId } from 'react';
import { useAriaLive } from 'context/AriaLiveContext';
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
  const comboboxRef = useRef(null);
  const listboxRef = useRef(null);
  const listboxId = useId();
  const { announce } = useAriaLive();

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
    const isSelected = value.includes(option);
    if (isSelected) {
      onChange(value.filter(v => v !== option));
      announce(`${option} unselected`);
    } else {
      onChange([...value, option]);
      announce(`${option} selected`);
    }
  };

  const handleRemove = (e, option) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== option));
    announce(`${option} removed`);
  };
  
  // Custom scroll into view to avoid standard bugginess
  const scrollToActive = (index) => {
    if (!listboxRef.current) return;
    const listbox = listboxRef.current;
    const optionEls = listbox.querySelectorAll('[role="option"]');
    if (optionEls[index]) {
       const optionEl = optionEls[index];
       const optionTop = optionEl.offsetTop;
       const optionBottom = optionTop + optionEl.offsetHeight;
       const listboxScroll = listbox.scrollTop;
       const listboxHeight = listbox.clientHeight;
       
       if (optionTop < listboxScroll) {
         listbox.scrollTop = optionTop;
       } else if (optionBottom > listboxScroll + listboxHeight) {
         listbox.scrollTop = optionBottom - listboxHeight;
       }
    }
  };

  const handleKeyDown = (e) => {
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
        setTimeout(() => scrollToActive(0), 10);
      } else {
        setActiveIndex(prev => {
          const next = prev < options.length - 1 ? prev + 1 : prev;
          scrollToActive(next);
          return next;
        });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(options.length - 1);
        setTimeout(() => scrollToActive(options.length - 1), 10);
      } else {
        setActiveIndex(prev => {
          const next = prev > 0 ? prev - 1 : 0;
          scrollToActive(next);
          return next;
        });
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (isOpen && options.length > 0) {
        setActiveIndex(0);
        scrollToActive(0);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (isOpen && options.length > 0) {
        setActiveIndex(options.length - 1);
        scrollToActive(options.length - 1);
      }
    }
  };

  const handleContainerKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (comboboxRef.current) {
        comboboxRef.current.focus();
      }
    }
  };

  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className={styles.container} ref={containerRef} onBlur={handleBlur} onKeyDown={handleContainerKeyDown}>
      <div 
        className={styles.inputArea} 
        onClick={() => {
           setIsOpen(!isOpen);
           if (comboboxRef.current) comboboxRef.current.focus();
        }}
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
          <div
            ref={comboboxRef}
            className={styles.comboboxElement}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={activeDescendantId}
            aria-label={ariaLabel || 'Select topics'}
            aria-labelledby={ariaLabelledBy}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          />
        </div>
        <span className={styles.chevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
      </div>

      {isOpen && (
        <div 
          id={listboxId}
          ref={listboxRef}
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
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur on the combobox
                    handleToggle(opt);
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={isSelected} 
                    readOnly
                    tabIndex={-1}
                    className={styles.checkbox}
                    aria-label={`Select ${opt}`}
                    aria-hidden="true"
                  />
                  <span className={styles.optionText}>
                    {opt}
                    {isSelected && <span className="sr-only"> (Selected)</span>}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
