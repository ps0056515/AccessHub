import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { signInInitialValues, signInValidationSchema } from './typesAndValidations';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import GoogleSignInSection from 'components/auth/GoogleSignInSection';
import { useAuthRedirect } from 'hooks/useAuthRedirect';
import { redirectAfterLogin } from 'utils/authRedirect';
import { useToast } from 'context/ToastContext';
import styles from 'components/auth/AuthPage.module.css';

export default function SignInPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const joiningCommunity = from === '/join';
  const redirectedFromProtected = from !== '/' && from !== '/join';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signIn, signInWithGoogle } = useAuth();
  const { addToast } = useToast();
  const [submittingGoogle, setSubmittingGoogle] = useState(false);

  const formik = useFormik({
    initialValues: signInInitialValues,
    validationSchema: signInValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const profile = await signIn(values);
        redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
      } catch (err) {
        if (err.needsVerification && err.email) {
          addToast(err.message, 'error');
          navigate('/sign-up', { state: { verificationEmail: err.email, from } });
        } else {
          showError(err.message || 'Could not sign in.');
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleSuccess = async credential => {
    setSubmittingGoogle(true);
    try {
      const profile = await signInWithGoogle({ credential });
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      showError(err.message || 'Google sign-in failed.');
    } finally {
      setSubmittingGoogle(false);
    }
  };

  // If we came from another page with an error toast, show it on mount
  useEffect(() => {
    if (location.state?.errorToast) {
      addToast(location.state.errorToast, 'error');
      // Clear the state so it doesn't show again on reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.errorToast, addToast, navigate, location.pathname]);

  const showError = (message) => {
    addToast(message, 'error');
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
          disabled={formik.isSubmitting || submittingGoogle}
        />

        <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signin-email">
              Email<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="signin-email"
              name="email"
              className={`${styles.input} ${formik.touched.email && formik.errors.email ? styles.inputError : ''}`}
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
              required
            />
            {formik.touched.email && formik.errors.email && (
              <div className={styles.errorText}>{formik.errors.email}</div>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="signin-password">
                Password<span className="required-asterisk" aria-hidden="true"> *</span>
              </label>
              <Link className={styles.linkInline} to="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              id="signin-password"
              name="password"
              className={`${styles.input} ${formik.touched.password && formik.errors.password ? styles.inputError : ''}`}
              type="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
              required
            />
            {formik.touched.password && formik.errors.password && (
              <div className={styles.errorText}>{formik.errors.password}</div>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={formik.isSubmitting || submittingGoogle || !formik.isValid || !formik.dirty}>
            {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
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
