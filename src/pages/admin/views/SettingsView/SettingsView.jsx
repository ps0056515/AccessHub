import { useState, useEffect } from 'react';
import { useConfig } from 'context/ConfigContext';
import { settingsApi } from 'api/client';
import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './SettingsView.module.css';

export default function SettingsView({ showToast }) {
  const { siteName, navbarLogoUrl, footerLogoUrl, navigation, footerColumns, refreshConfig } = useConfig();

  // Tab state: 'branding', 'navbar', 'footer'
  const [activeSubTab, setActiveSubTab] = useState('branding');

  // Branding states
  const [siteNameInput, setSiteNameInput] = useState(siteName);
  const [brandingLoading, setBrandingLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(null); // 'navbar' or 'footer'

  // Link manager states
  const [localNavbarLinks, setLocalNavbarLinks] = useState([]);
  const [footerColSelect, setFooterColSelect] = useState('footer_community');
  const [localFooterLinks, setLocalFooterLinks] = useState([]);

  // Footer columns manager states
  const [localFooterColumns, setLocalFooterColumns] = useState([]);
  const [newColTitle, setNewColTitle] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [savingColumns, setSavingColumns] = useState(false);

  // Initialize inputs from context config
  useEffect(() => {
    setSiteNameInput(siteName);
  }, [siteName]);

  useEffect(() => {
    if (navigation?.navbar) {
      setLocalNavbarLinks(navigation.navbar);
    }
  }, [navigation?.navbar]);

  useEffect(() => {
    if (navigation && navigation[footerColSelect]) {
      setLocalFooterLinks(navigation[footerColSelect]);
    } else {
      setLocalFooterLinks([]);
    }
  }, [navigation, footerColSelect]);

  useEffect(() => {
    if (footerColumns) {
      setLocalFooterColumns(footerColumns);
    }
  }, [footerColumns]);

  // Handle fallback for selected footer column if it gets deleted
  useEffect(() => {
    if (footerColumns) {
      const validKeys = [...footerColumns.map(c => `footer_${c.key_name}`), 'footer_socials'];
      if (footerColSelect && !validKeys.includes(footerColSelect)) {
        setFooterColSelect(validKeys[0] || 'footer_socials');
      }
    }
  }, [footerColumns, footerColSelect]);

  // Handle saving general branding settings
  const handleSaveBranding = async (e) => {
    e.preventDefault();
    if (!siteNameInput.trim()) {
      showToast?.('Site name cannot be empty.', 'error');
      return;
    }
    setBrandingLoading(true);
    try {
      await settingsApi.update({ site_name: siteNameInput.trim() });
      await refreshConfig();
      showToast?.('Site branding updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update branding.', 'error');
    } finally {
      setBrandingLoading(false);
    }
  };

  // Handle uploading logo files with size validation
  const handleLogoUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation: Logo size MUST be smaller than 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast?.(`Logo file size must be smaller than 2MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`, 'error');
      return;
    }
    setLogoLoading(key);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        await settingsApi.uploadLogo({
          data: base64Data,
          filename: file.name,
          key: key
        });
        await refreshConfig();
        showToast?.(`${key === 'navbar_logo_url' ? 'Navbar' : 'Footer'} logo uploaded successfully!`, 'success');
      } catch (err) {
        showToast?.(err.message || 'Failed to upload logo.', 'error');
      } finally {
        setLogoLoading(null);
      }
    };
    reader.onerror = () => {
      showToast?.('Failed to read file.', 'error');
      setLogoLoading(null);
    };
    reader.readAsDataURL(file);
  };

  // Link modification actions (Generic for Navbar/Footer)
  const addLink = (type) => {
    const newLink = { label: 'New Link', url: '/', isExternal: false };
    if (type === 'navbar') {
      setLocalNavbarLinks([...localNavbarLinks, newLink]);
    } else {
      setLocalFooterLinks([...localFooterLinks, newLink]);
    }
  };

  const removeLink = (type, index) => {
    if (type === 'navbar') {
      setLocalNavbarLinks(localNavbarLinks.filter((_, i) => i !== index));
    } else {
      setLocalFooterLinks(localFooterLinks.filter((_, i) => i !== index));
    }
  };

  const updateLinkField = (type, index, field, value) => {
    if (type === 'navbar') {
      const updated = [...localNavbarLinks];
      updated[index] = { ...updated[index], [field]: value };
      setLocalNavbarLinks(updated);
    } else {
      const updated = [...localFooterLinks];
      updated[index] = { ...updated[index], [field]: value };
      setLocalFooterLinks(updated);
    }
  };

  const moveLink = (type, index, direction) => {
    const list = type === 'navbar' ? [...localNavbarLinks] : [...localFooterLinks];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    if (type === 'navbar') {
      setLocalNavbarLinks(list);
    } else {
      setLocalFooterLinks(list);
    }
  };

  const handleSaveNavigation = async (type) => {
    const links = type === 'navbar' ? localNavbarLinks : localFooterLinks;
    const menuType = type === 'navbar' ? 'navbar' : footerColSelect;

    // Validate link fields are not empty
    const hasEmpty = links.some(l => !l.label.trim() || !l.url.trim());
    if (hasEmpty) {
      showToast?.('Link label and URL cannot be empty.', 'error');
      return;
    }

    try {
      await settingsApi.updateNavigation({
        menu_type: menuType,
        links: links.map(l => ({
          label: l.label.trim(),
          url: l.url.trim(),
          isExternal: Boolean(l.isExternal)
        }))
      });
      await refreshConfig();
      showToast?.('Navigation updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to save navigation.', 'error');
    }
  };

  // Footer column layout manager actions
  const moveColumn = (index, direction) => {
    const list = [...localFooterColumns];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Update display_order based on new position
    const updated = list.map((col, idx) => ({ ...col, display_order: idx + 1 }));
    setLocalFooterColumns(updated);
  };

  const updateColumnTitle = (index, newTitle) => {
    const updated = [...localFooterColumns];
    updated[index] = { ...updated[index], title: newTitle };
    setLocalFooterColumns(updated);
  };

  const handleSaveColumnsLayout = async () => {
    const hasEmpty = localFooterColumns.some(c => !c.title.trim());
    if (hasEmpty) {
      showToast?.('Column titles cannot be empty.', 'error');
      return;
    }
    setSavingColumns(true);
    try {
      await settingsApi.updateFooterColumns({ columns: localFooterColumns });
      await refreshConfig();
      showToast?.('Footer column layout updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update footer column layout.', 'error');
    } finally {
      setSavingColumns(false);
    }
  };

  const handleDeleteColumn = async (key, title) => {
    if (!window.confirm(`Are you sure you want to delete the column "${title}"? This will permanently delete all its navigation links.`)) {
      return;
    }
    try {
      await settingsApi.deleteFooterColumn(key);
      await refreshConfig();
      showToast?.('Footer column deleted successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete footer column.', 'error');
    }
  };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newColTitle.trim()) {
      showToast?.('Column title cannot be empty.', 'error');
      return;
    }
    setCreateLoading(true);
    try {
      const newCol = await settingsApi.createFooterColumn({ title: newColTitle.trim() });
      await refreshConfig();
      setNewColTitle('');
      setFooterColSelect(`footer_${newCol.key_name}`);
      showToast?.(`Column "${newCol.title}" created successfully!`, 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to create footer column.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>System Settings</h1>
          <p className={dashboardStyles.lead}>Manage site branding, upload logos, and edit header and footer navigation menus.</p>
        </div>
      </header>

      {/* Success/Error Alerts are handled by toast notifications */}

      {/* Inner Sub-Navigation Tab Bar */}
      <div className={styles.tabBar} role="tablist" aria-label="Settings categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'branding'}
          onClick={() => setActiveSubTab('branding')}
          className={`${styles.tabBtn} ${activeSubTab === 'branding' ? styles.tabBtnActive : ''}`}
        >
          🎨 Branding & Logos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'navbar'}
          onClick={() => setActiveSubTab('navbar')}
          className={`${styles.tabBtn} ${activeSubTab === 'navbar' ? styles.tabBtnActive : ''}`}
        >
          🔝 Navbar Links
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'footer'}
          onClick={() => setActiveSubTab('footer')}
          className={`${styles.tabBtn} ${activeSubTab === 'footer' ? styles.tabBtnActive : ''}`}
        >
          ⬇️ Footer Columns
        </button>
      </div>

      {/* Tab 1: Branding & Logos */}
      {activeSubTab === 'branding' && (
        <div className={styles.tabContent}>
          <section className={dashboardStyles.panel}>
            <h2 className={dashboardStyles.panelTitle}>Site Brand</h2>
            <form onSubmit={handleSaveBranding}>
              <div className={styles.formGroup}>
                <label htmlFor="site-name-input" className={styles.formLabel}>Site Name</label>
                <input
                  id="site-name-input"
                  type="text"
                  value={siteNameInput}
                  onChange={(e) => setSiteNameInput(e.target.value)}
                  className={styles.textInput}
                />
              </div>
              <button
                type="submit"
                disabled={brandingLoading}
                className={`${dashboardStyles.backBtn} ${styles.saveBtn}`}
              >
                {brandingLoading ? 'Saving...' : 'Save Site Name'}
              </button>
            </form>
          </section>

          <section className={dashboardStyles.panel}>
            <h2 className={dashboardStyles.panelTitle}>Website Logos (Max 2MB file size)</h2>
            
            <div className={styles.logosGrid}>
              {/* Navbar Logo */}
              <div className={styles.logoCard}>
                <h3 className={styles.logoCardTitle}>Navbar Logo</h3>
                <div className={styles.logoPreviewBox}>
                  <img src={navbarLogoUrl} alt="Navbar Logo Preview" className={styles.logoPreviewImg} />
                </div>
                <label className={styles.uploadLabelBtn}>
                  {logoLoading === 'navbar_logo_url' ? 'Uploading...' : 'Choose Navbar Logo'}
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'navbar_logo_url')} className={styles.visuallyHidden} />
                </label>
              </div>

              {/* Footer Logo */}
              <div className={styles.logoCard}>
                <h3 className={styles.logoCardTitle}>Footer Logo</h3>
                <div className={styles.logoPreviewBox}>
                  <img src={footerLogoUrl} alt="Footer Logo Preview" className={styles.logoPreviewImg} />
                </div>
                <label className={styles.uploadLabelBtn}>
                  {logoLoading === 'footer_logo_url' ? 'Uploading...' : 'Choose Footer Logo'}
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload(e, 'footer_logo_url')} className={styles.visuallyHidden} />
                </label>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab 2: Navbar Link configuration */}
      {activeSubTab === 'navbar' && (
        <section className={dashboardStyles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={dashboardStyles.panelTitle} style={{ margin: 0 }}>Header Navbar Navigation Links</h2>
            <button type="button" onClick={() => addLink('navbar')} className={styles.addLinkBtn}>
              ➕ Add Navbar Link
            </button>
          </div>

          <div className={styles.linksList}>
            {localNavbarLinks.map((link, index) => (
              <div key={index} className={styles.linkRow}>
                {/* Drag / Sorting Buttons */}
                <div className={styles.sortButtons}>
                  <button type="button" disabled={index === 0} onClick={() => moveLink('navbar', index, -1)} className={styles.sortBtn} aria-label={`Move navbar link "${link.label || 'New Link'}" up`}>▲</button>
                  <button type="button" disabled={index === localNavbarLinks.length - 1} onClick={() => moveLink('navbar', index, 1)} className={styles.sortBtn} aria-label={`Move navbar link "${link.label || 'New Link'}" down`}>▼</button>
                </div>

                <div className={styles.linkFields}>
                  <input
                    type="text"
                    placeholder="Link Label"
                    value={link.label}
                    onChange={(e) => updateLinkField('navbar', index, 'label', e.target.value)}
                    className={styles.linkLabelInput}
                    aria-label={`Navbar link ${index + 1} label`}
                  />
                  <input
                    type="text"
                    placeholder="URL (e.g. /resources or https://...)"
                    value={link.url}
                    onChange={(e) => updateLinkField('navbar', index, 'url', e.target.value)}
                    className={styles.linkUrlInput}
                    aria-label={`Navbar link ${index + 1} URL`}
                  />
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={link.isExternal}
                      onChange={(e) => updateLinkField('navbar', index, 'isExternal', e.target.checked)}
                    />
                    External Link
                  </label>
                </div>

                <button type="button" onClick={() => removeLink('navbar', index)} className={styles.deleteLinkBtn} title="Delete Link" aria-label={`Delete navbar link "${link.label || 'New Link'}"`}>🗑</button>
              </div>
            ))}
            {localNavbarLinks.length === 0 && <p className={styles.emptyState}>No Navbar links configured. Click "Add Navbar Link" to start.</p>}
          </div>

          <button
            type="button"
            onClick={() => handleSaveNavigation('navbar')}
            className={`${dashboardStyles.backBtn} ${styles.saveBtn}`}
          >
            Save Navbar Navigation
          </button>
        </section>
      )}

      {/* Tab 3: Footer Link configuration */}
      {activeSubTab === 'footer' && (
        <div className={styles.tabContent}>
          {/* Panel 1: Column Layout Manager */}
          <section className={dashboardStyles.panel}>
            <h2 className={dashboardStyles.panelTitle}>Footer Columns Layout</h2>
            <p className={`${dashboardStyles.lead} ${styles.columnLayoutDesc}`}>
              Create, rename, reorder, or delete footer columns.
            </p>

            <div className={styles.linksList}>
              {localFooterColumns.map((col, index) => (
                <div key={col.key_name} className={styles.linkRow}>
                  {/* Sorting */}
                  <div className={styles.sortButtons}>
                    <button type="button" disabled={index === 0} onClick={() => moveColumn(index, -1)} className={styles.sortBtn} aria-label={`Move footer column "${col.title}" up`}>▲</button>
                    <button type="button" disabled={index === localFooterColumns.length - 1} onClick={() => moveColumn(index, 1)} className={styles.sortBtn} aria-label={`Move footer column "${col.title}" down`}>▼</button>
                  </div>

                  <div className={styles.linkFields} style={{ alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Column Title"
                      value={col.title}
                      onChange={(e) => updateColumnTitle(index, e.target.value)}
                      className={styles.linkLabelInput}
                      aria-label={`Footer column ${index + 1} title`}
                    />
                    <span className={styles.keyPill}>
                      Key: footer_{col.key_name}
                    </span>
                  </div>

                  <button type="button" onClick={() => handleDeleteColumn(col.key_name, col.title)} className={styles.deleteLinkBtn} title="Delete Column" aria-label={`Delete footer column "${col.title}"`}>🗑</button>
                </div>
              ))}
              {localFooterColumns.length === 0 && <p className={styles.emptyState}>No columns configured. Add a column below.</p>}
            </div>

            <div className={styles.createColumnBlock}>
              <div className={styles.createInputGroup}>
                <label htmlFor="new-column-title" className={styles.createInputLabel}>New Column Title</label>
                <input
                  id="new-column-title"
                  type="text"
                  placeholder="e.g. Partners"
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  className={styles.createInput}
                />
              </div>
              <button
                type="button"
                onClick={handleCreateColumn}
                disabled={createLoading}
                className={`${dashboardStyles.backBtn} ${styles.createBtn}`}
              >
                {createLoading ? 'Creating...' : '➕ Create Column'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveColumnsLayout}
              disabled={savingColumns}
              className={`${dashboardStyles.backBtn} ${styles.saveBtn}`}
            >
              {savingColumns ? 'Saving Layout...' : 'Save Column Layout'}
            </button>
          </section>

          {/* Panel 2: Column Links Editor */}
          <section className={dashboardStyles.panel}>
            <div className={styles.panelHeaderFooter}>
              <div className={styles.selectGroup}>
                <label htmlFor="footer-col-select" className={styles.selectLabel}>Edit Links for Column:</label>
                <select
                  id="footer-col-select"
                  value={footerColSelect}
                  onChange={(e) => setFooterColSelect(e.target.value)}
                  className={styles.selectDropdown}
                >
                  {footerColumns.map(col => (
                    <option key={col.key_name} value={`footer_${col.key_name}`}>{col.title}</option>
                  ))}
                  <option value="footer_socials">Social Links</option>
                </select>
              </div>

              <button type="button" onClick={() => addLink('footer')} className={styles.addLinkBtn}>
                ➕ Add Link to Column
              </button>
            </div>

            <div className={styles.linksList}>
              {localFooterLinks.map((link, index) => (
                <div key={index} className={styles.linkRow}>
                  {/* Sorting */}
                  <div className={styles.sortButtons}>
                    <button type="button" disabled={index === 0} onClick={() => moveLink('footer', index, -1)} className={styles.sortBtn} aria-label={`Move link "${link.label || 'New Link'}" up`}>▲</button>
                    <button type="button" disabled={index === localFooterLinks.length - 1} onClick={() => moveLink('footer', index, 1)} className={styles.sortBtn} aria-label={`Move link "${link.label || 'New Link'}" down`}>▼</button>
                  </div>

                  <div className={styles.linkFields}>
                    <input
                      type="text"
                      placeholder="Link Label"
                      value={link.label}
                      onChange={(e) => updateLinkField('footer', index, 'label', e.target.value)}
                      className={styles.linkLabelInput}
                      aria-label={`Link ${index + 1} label`}
                    />
                    <input
                      type="text"
                      placeholder="URL (e.g. /news or https://...)"
                      value={link.url}
                      onChange={(e) => updateLinkField('footer', index, 'url', e.target.value)}
                      className={styles.linkUrlInput}
                      aria-label={`Link ${index + 1} URL`}
                    />
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={link.isExternal}
                        onChange={(e) => updateLinkField('footer', index, 'isExternal', e.target.checked)}
                      />
                      External Link
                    </label>
                  </div>

                  <button type="button" onClick={() => removeLink('footer', index)} className={styles.deleteLinkBtn} title="Delete Link" aria-label={`Delete link "${link.label || 'New Link'}"`}>🗑</button>
                </div>
              ))}
              {localFooterLinks.length === 0 && <p className={styles.emptyState}>No links configured in this footer column. Click "Add Link to Column" to add.</p>}
            </div>

            <button
              type="button"
              onClick={() => handleSaveNavigation('footer')}
              className={`${dashboardStyles.backBtn} ${styles.saveBtn}`}
            >
              Save Footer Column Links
            </button>
          </section>
        </div>
      )}
    </>
  );
}
