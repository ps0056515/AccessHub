import styles from './AuthLoading.module.css';

export default function AuthLoading() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-busy="true">
      <p className={styles.text}>Checking your session…</p>
    </div>
  );
}
