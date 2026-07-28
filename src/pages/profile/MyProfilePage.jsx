import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { useToast } from 'context/ToastContext';
import { useAriaLive } from 'context/AriaLiveContext';
import { Country, City } from 'country-state-city';
import { COLOR_MAP } from 'data';
import {
  Camera, Mail, MapPin, Building2, Calendar, Edit2,
  Briefcase, User, CheckCircle2, ChevronRight, MessageSquare, FileText, Star
} from 'lucide-react';
import Avatar from 'components/common/Avatar/Avatar';
import styles from './MyProfilePage.module.css';



const COMPLETENESS_FIELDS = [
  { key: 'displayName', label: 'Display name' },
  { key: 'bio', label: 'Bio' },
  { key: 'avatarUrl', label: 'Profile photo' },
  { key: 'company', label: 'Company' },
  { key: 'role', label: 'Role' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
];

function calcCompleteness(user) {
  if (!user) return { filled: 0, total: COMPLETENESS_FIELDS.length, percent: 0, missing: [] };
  const missing = [];
  let filled = 0;
  for (const f of COMPLETENESS_FIELDS) {
    if (user[f.key]) filled++;
    else missing.push(f.label);
  }
  return { filled, total: COMPLETENESS_FIELDS.length, percent: Math.round((filled / COMPLETENESS_FIELDS.length) * 100), missing };
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function timeSince(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''}, ${rem} month${rem !== 1 ? 's' : ''} ago`;
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const { addToast } = useToast();
  const { announce } = useAriaLive();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const lastFocusRef = useRef(null);

  const [formData, setFormData] = useState({
    displayName: "",
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

  const completeness = useMemo(() => calcCompleteness(user), [user]);

  const handleAvatarSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp|gif)$/)) {
      addToast('Please select a PNG, JPEG, WebP, or GIF image.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast('Image must be smaller than 2 MB.', 'error');
      return;
    }

    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await uploadAvatar(reader.result);
          addToast('Profile photo updated!', 'success');
          announce('Profile photo updated');
        } catch (err) {
          addToast(err.message || 'Failed to upload photo.', 'error');
        } finally {
          setAvatarUploading(false);
        }
      };
      reader.onerror = () => {
        addToast('Failed to read file.', 'error');
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setAvatarUploading(false);
    }

    // Reset file input so the same file can be re-selected
    e.target.value = '';
  }, [uploadAvatar, addToast, announce]);

  const handleRemoveAvatar = useCallback(async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;
    setAvatarUploading(true);
    try {
      await removeAvatar();
      addToast('Profile photo removed.', 'success');
      announce('Profile photo removed');
    } catch (err) {
      addToast(err.message || 'Failed to remove photo.', 'error');
    } finally {
      setAvatarUploading(false);
    }
  }, [removeAvatar, addToast, announce]);

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
      setTimeout(() => {
        if (lastFocusRef.current) lastFocusRef.current.focus();
      }, 0);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePreventEnterSubmit = (e) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName || "",
      bio: user.bio || "",
      company: user.company || "",
      designation: user.designation || "",
      country: user.country || "",
      city: user.city || ""
    });
    setErrorMsg("");
    setIsEditing(false);
    setTimeout(() => {
      if (lastFocusRef.current) lastFocusRef.current.focus();
    }, 0);
  };

  const colors = COLOR_MAP[user.color] || COLOR_MAP.blue;
  const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : "?";
  const hasAvatar = !!user.avatarUrl;

  // Build location string
  const locationParts = [user.city, user.country].filter(Boolean);
  const locationStr = locationParts.join(', ');

  // Build company line
  const companyLine = [user.designation, user.company].filter(Boolean).join(' at ');



  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     EDIT MODE
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (isEditing) {
    return (
      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button type="button" className={styles.crumbBtn} onClick={() => navigate("/")}>
            Community
          </button>
          <span aria-hidden="true" className={styles.sep}>/</span>
          <span className={styles.crumbCurrent}>Edit Profile</span>
        </nav>

        <div className={`${styles.coverBanner} ${styles.fadeUp}`} />

        <form onSubmit={handleSave}>
          <div className={`${styles.editCard} ${styles.fadeUp} ${styles.fadeUp1}`}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrapper}>
                <Avatar
                  src={user.avatarUrl}
                  initials={initial}
                  color={user.color}
                  size={120}
                  className={styles.avatarOverride}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className={styles.avatarHiddenInput}
                  onChange={handleAvatarSelect}
                  aria-label="Upload profile photo"
                />
              </div>
              <div className={styles.profileHeaderInfo}>
                <div className={styles.avatarActions}>
                  <button
                    type="button"
                    className={styles.avatarAddBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                  >
                    {hasAvatar ? 'Change photo' : 'Add photo'}
                  </button>
                  {hasAvatar && (
                    <button
                      type="button"
                      className={styles.avatarRemoveBtn}
                      onClick={handleRemoveAvatar}
                      disabled={avatarUploading}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                <h1 className={styles.editTitle}>Edit Profile</h1>
              </div>
            </div>

            {errorMsg && <p className={styles.errorMsg} role="alert">{errorMsg}</p>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="edit-name" className={styles.formLabel}>
                  Display Name
                  <span className="required-asterisk" aria-hidden="true"> *</span>
                </label>
                <input
                  id="edit-name"
                  className={styles.formInput}
                  autoComplete="name"
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  onKeyDown={handlePreventEnterSubmit}
                  required
                  aria-required="true"
                  pattern=".*\S+.*"
                  title="This field cannot be empty or just spaces"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-designation" className={styles.formLabel}>Designation / Job Title</label>
                <input
                  id="edit-designation"
                  className={styles.formInput}
                  autoComplete="organization-title"
                  value={formData.designation}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  onKeyDown={handlePreventEnterSubmit}
                  placeholder="e.g. Accessibility Engineer"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-company" className={styles.formLabel}>Company</label>
                <input
                  id="edit-company"
                  className={styles.formInput}
                  autoComplete="organization"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  onKeyDown={handlePreventEnterSubmit}
                />
              </div>


              <div className={styles.formGroup}>
                <label htmlFor="edit-country" className={styles.formLabel}>
                  Country
                  <span className="required-asterisk" aria-hidden="true"> *</span>
                </label>
                <input
                  list="edit-country-list"
                  id="edit-country"
                  className={styles.formInput}
                  autoComplete="country-name"
                  value={formData.country}
                  onChange={handleCountryChange}
                  onKeyDown={handlePreventEnterSubmit}
                  placeholder="Search or select a country"
                  required
                  aria-required="true"
                />
                <datalist id="edit-country-list">
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="edit-city" className={styles.formLabel}>
                  City
                  <span className="required-asterisk" aria-hidden="true"> *</span>
                </label>
                <input
                  list="edit-city-list"
                  id="edit-city"
                  className={styles.formInput}
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  onKeyDown={handlePreventEnterSubmit}
                  placeholder={cities.length === 0 && formData.country ? 'No cities available' : 'Search or select a city'}
                  disabled={!formData.country || cities.length === 0}
                  required
                  aria-required="true"
                />
                <datalist id="edit-city-list">
                  {cities.map((c, i) => (
                    <option key={`${c.name}-${i}`} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                <label htmlFor="edit-bio" className={styles.formLabel}>About Me</label>
                <textarea
                  id="edit-bio"
                  className={styles.formTextarea}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell the community about yourself, your experience, and interests..."
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     VIEW MODE
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button type="button" className={styles.crumbBtn} onClick={() => navigate("/")}>
          Community
        </button>
        <span aria-hidden="true" className={styles.sep}>/</span>
        <span className={styles.crumbCurrent}>My Profile</span>
      </nav>

      {/* Cover banner */}
      <div className={`${styles.coverBanner} ${styles.fadeUp}`} />

      {/* Profile card */}
      <div className={`${styles.profileCard} ${styles.fadeUp} ${styles.fadeUp1}`}>

        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <Avatar
              src={user.avatarUrl}
              initials={initial}
              color={user.color}
              size={120}
              className={styles.avatarOverride}
            />
          </div>
          <div className={styles.profileHeaderInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{user.displayName}</h1>
            </div>

            <div className={styles.metaRow}>
              {companyLine && (
                <span className={styles.metaItem}>
                  <Building2 aria-hidden="true" className={styles.metaIcon} />
                  {companyLine}
                </span>
              )}
              {locationStr && (
                <span className={styles.metaItem}>
                  <MapPin aria-hidden="true" className={styles.metaIcon} />
                  {locationStr}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className={styles.editBtnBottom}
          onClick={(e) => {
            lastFocusRef.current = e.currentTarget;
            setIsEditing(true);
            setTimeout(() => document.getElementById('edit-name')?.focus(), 0);
          }}
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Profile Completeness */}
      {completeness.percent < 100 ? (
        <div className={`${styles.completenessCard} ${styles.fadeUp} ${styles.fadeUp2}`}>
          <div className={styles.completenessHeader}>
            <span className={styles.completenessTitle}>
              <CheckCircle2 size={14} style={{ marginRight: 4, verticalAlign: -2 }} />
              Profile Completeness
            </span>
            <span className={styles.completenessPercent}>
              {completeness.filled} / {completeness.total}
            </span>
          </div>
          <div className={styles.completenessBar}>
            <div
              className={styles.completenessFill}
              style={{ width: `${completeness.percent}%` }}
            />
          </div>
          <p className={styles.completenessHint}>
            Complete your profile to help others connect with you.
            {completeness.missing.length > 0 && (
              <> Add your <strong>{completeness.missing.slice(0, 3).join(', ')}</strong>{completeness.missing.length > 3 ? ` and ${completeness.missing.length - 3} more` : ''}. </>
            )}
            <button
              type="button"
              className={styles.crumbBtn}
              aria-label="Complete now: your profile"
              onClick={(e) => {
                lastFocusRef.current = e.currentTarget;
                setIsEditing(true);
                setTimeout(() => document.getElementById('edit-name')?.focus(), 0);
              }}
              style={{ fontSize: 12, marginLeft: 4 }}
            >
              Complete now <ChevronRight size={12} style={{ verticalAlign: -2 }} />
            </button>
          </p>
        </div>
      ) : (
        <div className={`${styles.completenessCard} ${styles.completenessSuccess} ${styles.fadeUp} ${styles.fadeUp2}`}>
          <div className={styles.completenessHeader}>
            <span className={`${styles.completenessTitle} ${styles.completenessSuccessTitle} ${styles.tada}`}>
              <CheckCircle2 size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
              Profile 100% Complete!
            </span>
          </div>
          <p className={styles.completenessHint}>
            Your profile looks amazing. You're all set to connect with the community.
          </p>
        </div>
      )}

      {/* Info Cards */}
      <div className={`${styles.cardsGrid} ${styles.fadeUp} ${styles.fadeUp3}`}>
        {/* About */}
        <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
          <h2 className={styles.cardTitle}>
            <User size={14} /> About
          </h2>
          {user.bio ? (
            <p className={styles.bio}>{user.bio}</p>
          ) : (
            <p className={styles.bioEmpty}>
              No bio provided yet. Tell the community about yourself!
            </p>
          )}
        </div>

        {/* Community Stats */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <Star size={14} /> Community Stats
          </h2>
          <div className={styles.cardRow}>
            <Star className={styles.cardRowIcon} style={{ color: 'var(--amber-500)' }} />
            <div>
              <div className={styles.cardRowLabel}>Reputation</div>
              <div className={styles.cardRowValue}>
                {user.reputation || 0} Upvotes
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <FileText className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Discussions Started</div>
              <div className={styles.cardRowValue}>
                {user.discussionsCount || 0} Posts
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <MessageSquare className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Comments Made</div>
              <div className={styles.cardRowValue}>
                {user.commentsCount || 0} Comments
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <Briefcase size={14} /> Professional Details
          </h2>
          <div className={styles.cardRow}>
            <Building2 className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Company</div>
              <div className={styles.cardRowValue}>
                {user.company || <span className={styles.cardRowEmpty}>Not set</span>}
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <Briefcase className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Designation</div>
              <div className={styles.cardRowValue}>
                {user.designation || <span className={styles.cardRowEmpty}>Not set</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

