import { useState, useMemo } from 'react';
import { useFormik } from 'formik';
import { signUpInitialValues, signUpValidationSchema } from './typesAndValidations';
import { Country, City } from 'country-state-city';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import GoogleSignInSection from 'components/auth/GoogleSignInSection';
import { useAuthRedirect } from 'hooks/useAuthRedirect';
import { redirectAfterLogin } from 'utils/authRedirect';
import { useToast } from 'context/ToastContext';
import styles from 'components/auth/AuthPage.module.css';

export default function SignUpPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signUp, signInWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [submittingGoogle, setSubmittingGoogle] = useState(false);

  const countries = useMemo(() => Country.getAllCountries(), []);

  const formik = useFormik({
    initialValues: signUpInitialValues,
    validationSchema: signUpValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const countryName = values.countryCode;
        const profile = await signUp({ 
          email: values.email, 
          password: values.password, 
          displayName: values.displayName, 
          country: countryName, 
          city: values.city, 
          company: values.company 
        });
        redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
      } catch (err) {
        addToast(err.message || 'Could not create account.', 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const countryObj = useMemo(() => countries.find(c => c.name === formik.values.countryCode), [countries, formik.values.countryCode]);
  const cities = useMemo(() => countryObj ? City.getCitiesOfCountry(countryObj.isoCode) : [], [countryObj]);

  const handleCountryChange = (e) => {
    formik.handleChange(e);
    formik.setFieldValue('city', '');
  };

  const handleGoogleSuccess = async credential => {
    setSubmittingGoogle(true);
    try {
      const countryName = formik.values.countryCode;
      const profile = await signInWithGoogle({ 
        credential, 
        country: countryName, 
        city: formik.values.city, 
        company: formik.values.company 
      });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      addToast(err.message || 'Google sign-in failed.', 'error');
    } finally {
      setSubmittingGoogle(false);
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

        <GoogleSignInSection
          onSuccess={handleGoogleSuccess}
          onError={err => addToast(err.message || 'Google sign-in failed.', 'error')}
          text="signup_with"
          disabled={formik.isSubmitting || submittingGoogle}
        />

        <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-name">
              Display name<span className="required-asterisk"> *</span>
            </label>
            <input
              id="signup-name"
              name="displayName"
              className={`${styles.input} ${formik.touched.displayName && formik.errors.displayName ? styles.inputError : ''}`}
              type="text"
              autoComplete="name"
              value={formik.values.displayName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
            />
            {formik.touched.displayName && formik.errors.displayName && (
              <div className={styles.errorText}>{formik.errors.displayName}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              Email<span className="required-asterisk"> *</span>
            </label>
            <input
              id="signup-email"
              name="email"
              className={`${styles.input} ${formik.touched.email && formik.errors.email ? styles.inputError : ''}`}
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={async (e) => {
                formik.handleBlur(e);
                const email = e.target.value;
                if (email && !formik.errors.email) {
                  try {
                    const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
                    if (res.ok) {
                      const data = await res.json();
                      if (data.exists) {
                        formik.setFieldError('email', 'An account with this email already exists.');
                      }
                    }
                  } catch (err) {
                    console.error('Email check failed', err);
                  }
                }
              }}
              disabled={formik.isSubmitting || submittingGoogle}
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.errorText}>{formik.errors.email}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-company">
              Company
            </label>
            <input
              id="signup-company"
              name="company"
              className={`${styles.input} ${formik.touched.company && formik.errors.company ? styles.inputError : ''}`}
              type="text"
              autoComplete="organization"
              placeholder="e.g. company name"
              value={formik.values.company}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
            />
            {formik.touched.company && formik.errors.company && (
              <div className={styles.errorText}>{formik.errors.company}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-country">
              Country<span className="required-asterisk"> *</span>
            </label>
            <input
              list="signup-country-list"
              id="signup-country"
              name="countryCode"
              placeholder="Search or select a country"
              className={`${styles.input} ${formik.touched.countryCode && formik.errors.countryCode ? styles.inputError : ''}`}
              value={formik.values.countryCode}
              onChange={handleCountryChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
            />
            <datalist id="signup-country-list">
              {countries.map(c => (
                <option key={c.isoCode} value={c.name} />
              ))}
            </datalist>
            {formik.touched.countryCode && formik.errors.countryCode && (
              <div className={styles.errorText}>{formik.errors.countryCode}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-city">
              City<span className="required-asterisk"> *</span>
            </label>
            <input
              list="signup-city-list"
              id="signup-city"
              name="city"
              placeholder={cities.length === 0 && formik.values.countryCode ? 'No cities available' : 'Search or select a city'}
              className={`${styles.input} ${formik.touched.city && formik.errors.city ? styles.inputError : ''}`}
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle || !formik.values.countryCode || cities.length === 0}
            />
            <datalist id="signup-city-list">
              {cities.map((c, i) => (
                <option key={`${c.name}-${i}`} value={c.name} />
              ))}
            </datalist>
            {formik.touched.city && formik.errors.city && (
              <div className={styles.errorText}>{formik.errors.city}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password<span className="required-asterisk"> *</span>
            </label>
            <input
              id="signup-password"
              name="password"
              className={`${styles.input} ${formik.touched.password && formik.errors.password ? styles.inputError : ''}`}
              type="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className={styles.errorText}>{formik.errors.password}</div>
            ) : (
              <span className={styles.hint} id="signup-password-hint">
                At least 8 characters
              </span>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={formik.isSubmitting || submittingGoogle || !formik.isValid || !formik.dirty}>
            {formik.isSubmitting ? 'Joining…' : 'Join community'}
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
