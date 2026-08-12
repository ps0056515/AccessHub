import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Country, City } from 'country-state-city';
import { useAuth } from 'context/AuthContext';
import { useAuthRedirect } from 'hooks/useAuthRedirect';
import { completeProfileInitialValues, completeProfileValidationSchema } from './typesAndValidations';
import styles from 'components/auth/AuthPage.module.css';

export default function CompleteProfilePage({ goToPortal }) {
  const navigate = useNavigate();
  const redirectAfterAuth = useAuthRedirect(goToPortal);
  const { user, updateProfile } = useAuth();

  const countries = useMemo(() => Country.getAllCountries(), []);

  const formik = useFormik({
    initialValues: {
      company: user?.company || completeProfileInitialValues.company,
      designation: user?.designation || completeProfileInitialValues.designation,
      country: user?.country || completeProfileInitialValues.country,
      city: user?.city || completeProfileInitialValues.city,
    },
    enableReinitialize: true,
    validationSchema: completeProfileValidationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await updateProfile({
          country: values.country,
          city: values.city,
          company: values.company,
          designation: values.designation,
        });
        redirectAfterAuth();
      } catch (err) {
        setFieldError('submit', err.message || 'Could not save your profile.');
      } finally {
        setSubmitting(false);
      }
    },
  });


  const countryObj = useMemo(() => countries.find(c => c.name === formik.values.country), [countries, formik.values.country]);
  const cities = useMemo(() => countryObj ? City.getCitiesOfCountry(countryObj.isoCode) : [], [countryObj]);

  const handleCountryChange = (e) => {
    formik.handleChange(e);
    formik.setFieldValue('city', '');
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/')}>
        <span aria-hidden="true">← </span>Back to community home
      </button>

      <div className={styles.card}>
        <p className={styles.kicker}>Profile</p>
        <h1 className={styles.title}>Where are you based?</h1>
        <p className={styles.lead}>
          Help the community connect locally. Add your country and city to complete your profile.
        </p>

        <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
          {formik.errors.submit && (
            <div className={styles.error} role="alert">
              {formik.errors.submit}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-company">
              Company
            </label>
            <input
              id="profile-company"
              name="company"
              className={`${styles.input} ${formik.touched.company && formik.errors.company ? styles.inputError : ''}`}
              type="text"
              autoComplete="organization"
              autoFocus
              placeholder="e.g. Acme Corp"
              value={formik.values.company}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              aria-invalid={!!(formik.touched.company && formik.errors.company)}
              aria-describedby={formik.touched.company && formik.errors.company ? "profile-company-error" : undefined}
            />
            {formik.touched.company && formik.errors.company && (
              <div id="profile-company-error" className={styles.errorText} role="alert">{formik.errors.company}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-designation">
              Designation / Job Title
            </label>
            <input
              id="profile-designation"
              name="designation"
              className={`${styles.input} ${formik.touched.designation && formik.errors.designation ? styles.inputError : ''}`}
              type="text"
              autoComplete="organization-title"
              placeholder="e.g. Accessibility Engineer"
              value={formik.values.designation}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              aria-invalid={!!(formik.touched.designation && formik.errors.designation)}
              aria-describedby={formik.touched.designation && formik.errors.designation ? "profile-designation-error" : undefined}
            />
            {formik.touched.designation && formik.errors.designation && (
              <div id="profile-designation-error" className={styles.errorText} role="alert">{formik.errors.designation}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-country">
              Country<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              list="profile-country-list"
              id="profile-country"
              name="country"
              autoComplete="country-name"
              placeholder="Search or select a country"
              className={`${styles.input} ${formik.touched.country && formik.errors.country ? styles.inputError : ''}`}
              value={formik.values.country}
              onChange={handleCountryChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting}
              required
              aria-required="true"
              aria-invalid={!!(formik.touched.country && formik.errors.country)}
              aria-describedby={formik.touched.country && formik.errors.country ? "profile-country-error" : undefined}
            />
            <datalist id="profile-country-list">
              {countries.map(c => (
                <option key={c.isoCode} value={c.name} />
              ))}
            </datalist>
            {formik.touched.country && formik.errors.country && (
              <div id="profile-country-error" className={styles.errorText} role="alert">{formik.errors.country}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="profile-city">
              City<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              list="profile-city-list"
              id="profile-city"
              name="city"
              autoComplete="address-level2"
              placeholder={cities.length === 0 && formik.values.country ? 'No cities available' : 'Search or select a city'}
              className={`${styles.input} ${formik.touched.city && formik.errors.city ? styles.inputError : ''}`}
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={formik.isSubmitting || !formik.values.country || cities.length === 0}
              required
              aria-required="true"
              aria-invalid={!!(formik.touched.city && formik.errors.city)}
              aria-describedby={formik.touched.city && formik.errors.city ? "profile-city-error" : undefined}
            />
            <datalist id="profile-city-list">
              {cities.map((c, i) => (
                <option key={`${c.name}-${i}`} value={c.name} />
              ))}
            </datalist>
            {formik.touched.city && formik.errors.city && (
              <div id="profile-city-error" className={styles.errorText} role="alert">{formik.errors.city}</div>
            )}
          </div>

          <button type="submit" className={styles.submit} disabled={formik.isSubmitting || !formik.isValid}>
            {formik.isSubmitting ? 'Saving…' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

