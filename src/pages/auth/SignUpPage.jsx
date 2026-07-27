import { useState, useMemo, useEffect } from 'react';
import { useFormik } from 'formik';
import { signUpInitialValues, signUpValidationSchema } from './typesAndValidations';
import { Country, City } from 'country-state-city';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import GoogleSignInSection from 'components/auth/GoogleSignInSection';
import { useAuthRedirect } from 'hooks/useAuthRedirect';
import { redirectAfterLogin } from 'utils/authRedirect';
import { useToast } from 'context/ToastContext';
import { Eye, EyeOff } from 'lucide-react';
import styles from 'components/auth/AuthPage.module.css';

export default function SignUpPage({ goToPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { signUp, signInWithGoogle, verifyOtp, resendOtp } = useAuth();
  const { addToast } = useToast();
  const [submittingGoogle, setSubmittingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification state
  const [verificationEmail, setVerificationEmail] = useState(location.state?.verificationEmail || null);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (!verificationEmail) return;
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timerId);
  }, [verificationEmail, timeLeft]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      addToast('Please enter the verification code.', 'error');
      return;
    }
    setVerifying(true);
    try {
      const profile = await verifyOtp({ email: verificationEmail, otp: otp.trim() });
      addToast('Email verified successfully!', 'success');
      redirectAfterLogin(navigate, profile, from, redirectAfterAuth);
    } catch (err) {
      addToast(err.message || 'Invalid or expired code.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    try {
      await resendOtp({ email: verificationEmail });
      setTimeLeft(120);
      addToast('A new code has been sent.', 'success');
    } catch (err) {
      addToast(err.message || 'Could not resend code.', 'error');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const countries = useMemo(() => Country.getAllCountries(), []);

  const formik = useFormik({
    initialValues: signUpInitialValues,
    validationSchema: signUpValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const countryName = values.countryCode;
        const response = await signUp({ 
          email: values.email, 
          password: values.password, 
          displayName: values.displayName, 
          country: countryName, 
          city: values.city, 
          company: values.company,
          designation: values.designation
        });
        if (response.needsVerification) {
          setVerificationEmail(values.email);
          setTimeLeft(120);
          addToast('Verification code sent!', 'success');
        } else {
          // Fallback if no verification needed
          redirectAfterLogin(navigate, response.user, from, redirectAfterAuth);
        }
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
        company: formik.values.company,
        designation: formik.values.designation
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
          {verificationEmail 
            ? `We've sent a 6-digit code to ${verificationEmail}. Please enter it below to verify your account.`
            : 'Create your free account to take part in discussions and connect with accessibility practitioners.'}
        </p>

        {!verificationEmail && (
          <GoogleSignInSection
            onSuccess={handleGoogleSuccess}
            onError={err => addToast(err.message || 'Google sign-in failed.', 'error')}
            text="signup_with"
            disabled={formik.isSubmitting || submittingGoogle}
          />
        )}

        {verificationEmail ? (
          <form className={styles.form} onSubmit={handleVerifyOtp} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="verify-otp">
                Verification Code<span className="required-asterisk" aria-hidden="true"> *</span>
              </label>
              <input
                id="verify-otp"
                name="otp"
                className={styles.input}
                type="text"
                autoComplete="one-time-code"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={verifying}
                required
                aria-required="true"
              />
            </div>
            
            <button type="submit" className={styles.submit} disabled={verifying || !otp.trim()}>
              {verifying ? 'Verifying…' : 'Verify Account'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              Didn't receive the code?{' '}
              {timeLeft > 0 ? (
                <span>Resend in {formatTime(timeLeft)}</span>
              ) : (
                <button 
                  type="button" 
                  className={styles.linkInline} 
                  onClick={handleResendOtp}
                >
                  Resend Code
                </button>
              )}
            </div>
            
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button 
                type="button" 
                className={styles.linkInline} 
                onClick={() => setVerificationEmail(null)}
              >
                Use a different email
              </button>
            </div>
          </form>
        ) : (
          <>
            <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-name">
              Display name<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="signup-name"
              name="displayName"
              className={`${styles.input} ${formik.touched.displayName && formik.errors.displayName ? styles.inputError : ''}`}
              type="text"
              autoComplete="name"
              autoFocus
              value={formik.values.displayName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
              required
              aria-required="true"
              aria-invalid={!!(formik.touched.displayName && formik.errors.displayName)}
              aria-describedby={formik.touched.displayName && formik.errors.displayName ? "signup-name-error" : undefined}
            />
            {formik.touched.displayName && formik.errors.displayName && (
              <div id="signup-name-error" className={styles.errorText} role="alert">{formik.errors.displayName}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              Email<span className="required-asterisk" aria-hidden="true"> *</span>
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
              required
              aria-required="true"
              aria-invalid={!!(formik.touched.email && formik.errors.email)}
              aria-describedby={formik.touched.email && formik.errors.email ? "signup-email-error" : undefined}
            />
            {formik.touched.email && formik.errors.email && (
              <div id="signup-email-error" className={styles.errorText} role="alert">{formik.errors.email}</div>
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
              aria-invalid={!!(formik.touched.company && formik.errors.company)}
              aria-describedby={formik.touched.company && formik.errors.company ? "signup-company-error" : undefined}
            />
            {formik.touched.company && formik.errors.company && (
              <div id="signup-company-error" className={styles.errorText} role="alert">{formik.errors.company}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-designation">
              Designation / Job Title
            </label>
            <input
              id="signup-designation"
              name="designation"
              className={`${styles.input} ${formik.touched.designation && formik.errors.designation ? styles.inputError : ''}`}
              type="text"
              autoComplete="organization-title"
              placeholder="e.g. Accessibility Engineer"
              value={formik.values.designation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
              aria-invalid={!!(formik.touched.designation && formik.errors.designation)}
              aria-describedby={formik.touched.designation && formik.errors.designation ? "signup-designation-error" : undefined}
            />
            {formik.touched.designation && formik.errors.designation && (
              <div id="signup-designation-error" className={styles.errorText} role="alert">{formik.errors.designation}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-country">
              Country<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              list="signup-country-list"
              id="signup-country"
              name="countryCode"
              autoComplete="country-name"
              placeholder="Search or select a country"
              className={`${styles.input} ${formik.touched.countryCode && formik.errors.countryCode ? styles.inputError : ''}`}
              value={formik.values.countryCode}
              onChange={handleCountryChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle}
              required
              aria-required="true"
              aria-invalid={!!(formik.touched.countryCode && formik.errors.countryCode)}
              aria-describedby={formik.touched.countryCode && formik.errors.countryCode ? "signup-country-error" : undefined}
            />
            <datalist id="signup-country-list">
              {countries.map(c => (
                <option key={c.isoCode} value={c.name} />
              ))}
            </datalist>
            {formik.touched.countryCode && formik.errors.countryCode && (
              <div id="signup-country-error" className={styles.errorText} role="alert">{formik.errors.countryCode}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-city">
              City<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              list="signup-city-list"
              id="signup-city"
              name="city"
              autoComplete="address-level2"
              placeholder={cities.length === 0 && formik.values.countryCode ? 'No cities available' : 'Search or select a city'}
              className={`${styles.input} ${formik.touched.city && formik.errors.city ? styles.inputError : ''}`}
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || submittingGoogle || !formik.values.countryCode || cities.length === 0}
              required
              aria-required="true"
              aria-invalid={!!(formik.touched.city && formik.errors.city)}
              aria-describedby={formik.touched.city && formik.errors.city ? "signup-city-error" : undefined}
            />
            <datalist id="signup-city-list">
              {cities.map((c, i) => (
                <option key={`${c.name}-${i}`} value={c.name} />
              ))}
            </datalist>
            {formik.touched.city && formik.errors.city && (
              <div id="signup-city-error" className={styles.errorText} role="alert">{formik.errors.city}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="signup-password"
                name="password"
                className={`${styles.input} ${formik.touched.password && formik.errors.password ? styles.inputError : ''}`}
                style={{ paddingRight: '40px' }}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting || submittingGoogle}
                required
                aria-required="true"
                aria-invalid={!!(formik.touched.password && formik.errors.password)}
                aria-describedby={formik.touched.password && formik.errors.password ? "signup-password-error" : "signup-password-hint"}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div id="signup-password-error" className={styles.errorText} role="alert">{formik.errors.password}</div>
            ) : (
              <span className={styles.hint} id="signup-password-hint">
                At least 8 characters
              </span>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={formik.isSubmitting || submittingGoogle}>
            {formik.isSubmitting ? 'Joining…' : 'Join community'}
          </button>
        </form>

          <p className={styles.footer}>
            Already have an account?{' '}
            <Link className={styles.link} to="/sign-in" state={location.state}>
              Sign in
            </Link>
          </p>
          </>
        )}
      </div>
    </div>
  );
}
