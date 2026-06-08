import { useState, useMemo } from 'react';
import { Country, City } from 'country-state-city';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import GoogleSignInSection from 'components/auth/GoogleSignInSection';
import { useAuthRedirect } from 'hooks/useAuthRedirect';
import { redirectAfterLogin } from 'utils/authRedirect';
import styles from 'components/auth/AuthPage.module.css';

export default function SignUpPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signUp, signInWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const countries = useMemo(() => Country.getAllCountries(), []);
  const cities = useMemo(() => countryCode ? City.getCitiesOfCountry(countryCode) : [], [countryCode]);

  const handleCountryChange = (e) => {
    const code = e.target.value;
    setCountryCode(code);
    const selectedCountry = countries.find(c => c.isoCode === code);
    setCountry(selectedCountry ? selectedCountry.name : '');
    setCity('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const profile = await signUp({ email, password, displayName, country, city, company });
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
      const profile = await signInWithGoogle({ credential, country, city, company });
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
            <label className={styles.label} htmlFor="signup-company">
              Company (optional)
            </label>
            <input
              id="signup-company"
              className={styles.input}
              type="text"
              autoComplete="organization"
              placeholder="e.g. Acme Corp"
              value={company}
              onChange={e => setCompany(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-country">
              Country
            </label>
            <select
              id="signup-country"
              className={styles.input}
              required
              value={countryCode}
              onChange={handleCountryChange}
              disabled={submitting}
            >
              <option value="">Select a country</option>
              {countries.map(c => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-city">
              City
            </label>
            <select
              id="signup-city"
              className={styles.input}
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              disabled={submitting || !countryCode || cities.length === 0}
            >
              <option value="">{cities.length === 0 && countryCode ? 'No cities available' : 'Select a city'}</option>
              {cities.map((c, i) => (
                <option key={`${c.name}-${i}`} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
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
