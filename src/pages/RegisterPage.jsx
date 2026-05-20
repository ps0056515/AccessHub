import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(email, password, displayName.trim() || undefined);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.lead}>Join with email and password. Minimum 8 characters.</p>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              className={styles.input}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-name">
              Display name <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="register-name"
              className={styles.input}
              type="text"
              autoComplete="name"
              maxLength={120}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className={styles.input}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className={styles.footer}>
          Already have an account?{' '}
          <Link className={styles.link} to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </div>
  );
}
