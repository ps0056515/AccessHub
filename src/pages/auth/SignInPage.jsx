import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import GoogleSignInSection from 'components/auth/GoogleSignInSection';
import { useAuthRedirect } from 'hooks/useAuthRedirect';
import { redirectAfterLogin } from 'utils/authRedirect';
import styles from 'components/auth/AuthPage.module.css';

export default function SignInPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const joiningCommunity = from === '/join';
  const redirectedFromProtected = from !== '/' && from !== '/join';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorToast, setErrorToast] = useState(location.state?.errorToast || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  const showError = (message) => {
    setErrorToast(message);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorToast(null);
    setSubmitting(true);
    try {
      const profile = await signIn({ email, password });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      showError(err.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async credential => {
    setErrorToast(null);
    setSubmitting(true);
    try {
      const profile = await signInWithGoogle({ credential });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      showError(err.message || 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.kicker}>Account</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lead}>
          {joiningCommunity
            ? 'Sign in to join the community and take part in discussions.'
            : redirectedFromProtected
              ? 'Sign in to continue to the page you requested.'
              : 'Welcome back. Sign in to participate in discussions and save your profile.'}
        </p>

        <GoogleSignInSection
          onSuccess={handleGoogleSuccess}
          onError={err => showError(err.message || 'Google sign-in failed.')}
          disabled={submitting}
        />

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signin-email">
              Email
            </label>
            <input
              id="signin-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="signin-password">
                Password
              </label>
              <Link className={styles.linkInline} to="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              id="signin-password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link className={styles.link} to="/sign-up" state={location.state}>
            Join community
          </Link>
        </p>
      </div>

      {errorToast && (
        <div className={styles.toastContainer} aria-live="polite">
          <div className={`${styles.toast} ${styles.toastError}`} role="alert">
            <span className={styles.toastIcon} aria-hidden="true">❌</span>
            <div className={styles.toastContent}>{errorToast}</div>
            <button
              type="button"
              className={styles.toastCloseBtn}
              onClick={() => setErrorToast(null)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
