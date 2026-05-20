import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInSection from './GoogleSignInSection';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import { redirectAfterLogin } from '../utils/authRedirect';
import styles from './AuthPage.module.css';

export default function SignUpPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signUp, signInWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const profile = await signUp({ email, password, displayName, country, city });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      setError(err.message || 'Could not create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async credential => {
    setError('');
    setSubmitting(true);
    try {
      const profile = await signInWithGoogle({ credential, country, city });
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
        <p className={styles.kicker}>Community</p>
        <h1 className={styles.title}>Join community</h1>
        <p className={styles.lead}>
          Create your free account to take part in discussions and connect with accessibility
          practitioners.
        </p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <GoogleSignInSection
          onSuccess={handleGoogleSuccess}
          onError={err => setError(err.message || 'Google sign-in failed.')}
          text="signup_with"
          disabled={submitting}
        />

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-name">
              Display name
            </label>
            <input
              id="signup-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
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
            <label className={styles.label} htmlFor="signup-country">
              Country
            </label>
            <input
              id="signup-country"
              className={styles.input}
              type="text"
              autoComplete="country-name"
              required
              placeholder="e.g. United States"
              value={country}
              onChange={e => setCountry(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-city">
              City
            </label>
            <input
              id="signup-city"
              className={styles.input}
              type="text"
              autoComplete="address-level2"
              required
              placeholder="e.g. Chicago"
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={submitting}
            />
            <span className={styles.hint} id="signup-password-hint">
              At least 8 characters
            </span>
          </div>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Joining…' : 'Join community'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link className={styles.link} to="/sign-in" state={location.state}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
