import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import styles from './AuthPage.module.css';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const data = await authApi.forgotPassword({ email });
      setMessage(data.message || 'Check your email for reset instructions.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Could not process your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/sign-in')}>
        ← Back to sign in
      </button>

      <div className={styles.card}>
        <p className={styles.kicker}>Account</p>
        <h1 className={styles.title}>Forgot password</h1>
        <p className={styles.lead}>
          Enter the email for your account. We&apos;ll send a link to reset your password if one
          exists.
        </p>

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
            <label className={styles.label} htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <p className={styles.footer}>
          Remember your password?{' '}
          <Link className={styles.link} to="/sign-in">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
