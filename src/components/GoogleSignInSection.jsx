import GoogleSignInButton from './GoogleSignInButton';
import { useGoogleClientId } from '../hooks/useGoogleClientId';
import styles from './AuthPage.module.css';

export default function GoogleSignInSection({
  onSuccess,
  onError,
  text = 'signin_with',
  disabled = false,
}) {
  const { clientId, loading } = useGoogleClientId();

  if (loading) {
    return (
      <div className={styles.googleWrap}>
        <p className={styles.googleStatus}>Loading sign-in options…</p>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className={styles.googleWrap}>
        <p className={styles.googleStatus}>
          Google sign-in is not configured. Add <code>GOOGLE_CLIENT_ID</code> to your <code>.env</code>{' '}
          file and restart the server.
        </p>
      </div>
    );
  }

  return (
    <>
      <GoogleSignInButton
        clientId={clientId}
        onSuccess={onSuccess}
        onError={onError}
        text={text}
        disabled={disabled}
      />
      <div className={styles.divider} aria-hidden="true">
        or continue with email
      </div>
    </>
  );
}
