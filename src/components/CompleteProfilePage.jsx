import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import styles from './AuthPage.module.css';

export default function CompleteProfilePage({ goToPortal }) {
  const navigate = useNavigate();
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { user, updateProfile } = useAuth();
  const [country, setCountry] = useState(user?.country || '');
  const [city, setCity] = useState(user?.city || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await updateProfile({ country, city });
      redirectAfterAuth();
    } catch (err) {
      setError(err.message || 'Could not save your location.');
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
        <p className={styles.kicker}>Profile</p>
        <h1 className={styles.title}>Where are you based?</h1>
        <p className={styles.lead}>
          Help the community connect locally. Add your country and city to complete your profile.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-country">
              Country
            </label>
            <input
              id="profile-country"
              className={styles.input}
              type="text"
              autoComplete="country-name"
              required
              value={country}
              onChange={e => setCountry(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-city">
              City
            </label>
            <input
              id="profile-city"
              className={styles.input}
              type="text"
              autoComplete="address-level2"
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={submitting}
            />
          </div>

          <button type="submit" className={styles.submit} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
