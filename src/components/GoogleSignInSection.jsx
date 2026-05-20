import GoogleSignInButton from './GoogleSignInButton';
import { useGoogleClientId } from '../hooks/useGoogleClientId';
import styles from './AuthPage.module.css';

export default function GoogleSignInSection({
  onSuccess,
  onError,
  text = 'signin_with',
  disabled = false,
}) {
  const { clientId, loading, apiUnreachable } = useGoogleClientId();

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
          {apiUnreachable ? (
            <>
              Cannot reach the API at <code>/api/auth/config</code>. Start the backend with{' '}
              <code>npm run server</code> or <code>npm run dev</code>, then refresh.
            </>
          ) : (
            <>
              Google sign-in is not configured on the server. Set <code>GOOGLE_CLIENT_ID</code> in{' '}
              <code>.env</code> and restart the API. For dev you can also set{' '}
              <code>REACT_APP_GOOGLE_CLIENT_ID</code> (same value) and restart <code>npm start</code>.
            </>
          )}
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
