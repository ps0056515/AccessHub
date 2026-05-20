import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import styles from './AuthPage.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset link is invalid. Request a new link from the forgot password page.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await authApi.resetPassword({ token, password });
      setMessage(data.message || 'Password updated.');
      setTimeout(() => navigate('/sign-in'), 2000);
    } catch (err) {
      setError(err.message || 'Could not reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid reset link</h1>
          <p className={styles.lead}>
            This link is missing or incomplete. Request a new password reset email.
          </p>
          <p className={styles.footer}>
            <Link className={styles.link} to="/forgot-password">
              Forgot password
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/sign-in')}>
        ← Back to sign in
      </button>

      <div className={styles.card}>
        <p className={styles.kicker}>Account</p>
        <h1 className={styles.title}>Set new password</h1>
        <p className={styles.lead}>Choose a new password for your account.</p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className={styles.success} role="status">
            {message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reset-password">
              New password
            </label>
            <input
              id="reset-password"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={submitting}
            />
            <span className={styles.hint}>At least 8 characters</span>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reset-confirm">
              Confirm password
            </label>
            <input
              id="reset-confirm"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link className={styles.link} to="/forgot-password">
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}
