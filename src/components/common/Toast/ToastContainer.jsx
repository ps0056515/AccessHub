import React from 'react';
import styles from './Toast.module.css';

export default function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${
            toast.type === 'error' ? styles.toastError : styles.toastSuccess
          }`}
          role="alert"
        >
          <span className={styles.toastIcon} aria-hidden="true">
            {toast.type === 'error' ? '❌' : '✔'}
          </span>
          <div className={styles.toastContent}>{toast.message}</div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
