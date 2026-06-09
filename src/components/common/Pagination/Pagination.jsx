import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Tooltip from '../Tooltip/Tooltip';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.container} aria-label="Pagination">
      <Tooltip content="Previous page">
        <button 
          className={styles.button} 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
      </Tooltip>
      
      <span className={styles.info}>
        Page {currentPage} of {totalPages}
      </span>
      
      <Tooltip content="Next page">
        <button 
          className={styles.button} 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </Tooltip>
    </nav>
  );
}
