import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Tooltip from '../Tooltip/Tooltip';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.container} aria-label="Pagination">
      <Tooltip content={`Previous page (Page ${currentPage - 1})`}>
        <button 
          type="button"
          className={styles.button} 
          aria-disabled={currentPage === 1}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          aria-label={`Previous page, page ${currentPage - 1}`}
        >
          <ChevronLeft aria-hidden="true" size={16} />
        </button>
      </Tooltip>
      
      <span className={styles.info} aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      
      <Tooltip content={`Next page (Page ${currentPage + 1})`}>
        <button 
          type="button"
          className={styles.button} 
          aria-disabled={currentPage === totalPages}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          aria-label={`Next page, page ${currentPage + 1}`}
        >
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      </Tooltip>
    </nav>
  );
}
