import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInSection from './GoogleSignInSection';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { redirectAfterLogin } from '../utils/authRedirect';
import styles from './AuthPage.module.css';

export default function SignInPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const joiningCommunity = from === '/join';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const profile = await signIn({ email, password });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async credential => {
    setError('');
    setSubmitting(true);
    try {
      const profile = await signInWithGoogle({ credential });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/')}>
        ← Back to community home
      </button>

      <div className={styles.card}>
        <p className={styles.kicker}>Account</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.lead}>
          {joiningCommunity
            ? 'Sign in to join the community and take part in discussions.'
            : 'Welcome back. Sign in to participate in discussions and save your profile.'}
        </p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <GoogleSignInSection
          onSuccess={handleGoogleSuccess}
          onError={err => setError(err.message || 'Google sign-in failed.')}
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
    </div>
  );
}
