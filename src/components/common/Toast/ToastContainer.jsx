import React from 'react';
import styles from './Toast.module.css';

export default function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${
            toast.type === 'error' ? styles.toastError : styles.toastSuccess
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
        >
          <span className={styles.toastIcon} aria-hidden="true">
            {toast.type === 'error' ? '❌' : '✔'}
          </span>
          <div className={styles.toastContent}>{toast.message}</div>
          <button
            type="button"
            className={styles.toastCloseBtn}
            onClick={() => {
              removeToast(toast.id);
              setTimeout(() => {
                // If focus dropped to body, send it to main-content
                if (document.activeElement === document.body) {
                  document.getElementById('main-content')?.focus();
                }
              }, 0);
            }}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
