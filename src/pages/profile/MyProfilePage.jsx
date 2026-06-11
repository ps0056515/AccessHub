import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { useToast } from 'context/ToastContext';
import { useAriaLive } from 'context/AriaLiveContext';
import { Country, City } from 'country-state-city';
import { COLOR_MAP } from 'data';
import styles from './MyProfilePage.module.css';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const { announce } = useAriaLive();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    displayName: "",
    role: "",
    bio: "",
    company: "",
    designation: "",
    country: "",
    city: ""
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || "",
        role: user.role || "",
        bio: user.bio || "",
        company: user.company || "",
        designation: user.designation || "",
        country: user.country || "",
        city: user.city || ""
      });
    }
  }, [user]);

  const countries = useMemo(() => Country.getAllCountries(), []);

  const selectedCountry = useMemo(() => {
    return countries.find((c) => c.name === formData.country);
  }, [formData.country, countries]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];
    return City.getCitiesOfCountry(selectedCountry.isoCode) || [];
  }, [selectedCountry]);

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setFormData((prev) => {
      if (prev.country === newCountry) return prev;
      return { ...prev, country: newCountry, city: "" };
    });
  };

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      setErrorMsg("Display name is required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    try {
      await updateProfile(formData);
      addToast("Profile updated successfully!", "success");
      announce("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName || "",
      role: user.role || "",
      bio: user.bio || "",
      company: user.company || "",
      designation: user.designation || "",
      country: user.country || "",
      city: user.city || ""
    });
    setErrorMsg("");
    setIsEditing(false);
  };

  const colors = COLOR_MAP[user.color] || COLOR_MAP.blue;
  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "?";

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button type="button" className={styles.crumbBtn} onClick={() => navigate("/")}>
          Community
        </button>
        <span aria-hidden="true" className={styles.sep}>/</span>
        <span className={styles.crumbCurrent}>My Profile</span>
      </nav>

      {isEditing ? (
        <form onSubmit={handleSave} noValidate>
          <header className={styles.header}>
            <div
              className={styles.avatar}
              style={{ background: colors.bg, color: colors.text }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <div className={styles.headerText} style={{ flex: 1 }}>
              <h1 className={styles.name}>Edit Profile</h1>
            </div>
          </header>

          {errorMsg && <p className={styles.errorMsg} role="alert">{errorMsg}</p>}

          <div className={styles.formGroup}>
            <label htmlFor="edit-name" className={styles.formLabel}>Display Name</label>
            <input
              id="edit-name"
              className={styles.formInput}
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-role" className={styles.formLabel}>Role / Job Title</label>
            <input
              id="edit-role"
              className={styles.formInput}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Accessibility Engineer"
            />
          </div>

          <div className={styles.formGroup} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-company" className={styles.formLabel}>Company</label>
              <input
                id="edit-company"
                className={styles.formInput}
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-designation" className={styles.formLabel}>Designation</label>
              <input
                id="edit-designation"
                className={styles.formInput}
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Accessibility Engineer"
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-country" className={styles.formLabel}>Country</label>
              <input
                list="edit-country-list"
                id="edit-country"
                className={styles.formInput}
                value={formData.country}
                onChange={handleCountryChange}
                placeholder="Search or select a country"
              />
              <datalist id="edit-country-list">
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.name} />
                ))}
              </datalist>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="edit-city" className={styles.formLabel}>City</label>
              <input
                list="edit-city-list"
                id="edit-city"
                className={styles.formInput}
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder={cities.length === 0 && formData.country ? 'No cities available' : 'Search or select a city'}
                disabled={!formData.country || cities.length === 0}
              />
              <datalist id="edit-city-list">
                {cities.map((c, i) => (
                  <option key={`${c.name}-${i}`} value={c.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="edit-bio" className={styles.formLabel}>About Me</label>
            <textarea
              id="edit-bio"
              className={styles.formTextarea}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <header className={styles.header}>
            <div
              className={styles.avatar}
              style={{ background: colors.bg, color: colors.text }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.name}>{user.displayName}</h1>
              {user.role && <p className={styles.role}>{user.role}</p>}
              {(user.designation || user.company || user.city || user.country) && (
                <p className={styles.companyLoc}>
                  {user.designation}{user.designation && user.company ? ' at ' : ''}
                  {user.company}{((user.designation || user.company) && (user.city || user.country)) ? ' · ' : ''}
                  {user.city}{user.city && user.country ? ', ' : ''}{user.country}
                </p>
              )}
            </div>
            <button
              type="button"
              className={styles.editBtn}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </header>

          <section className={styles.section} aria-labelledby="about-heading">
            <h2 id="about-heading" className={styles.sectionTitle}>About</h2>
            {user.bio ? (
              <p className={styles.bio}>{user.bio}</p>
            ) : (
              <p className={styles.bio} style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No bio provided yet.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
