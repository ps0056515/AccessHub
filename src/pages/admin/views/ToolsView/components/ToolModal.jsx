import { useState, useEffect } from "react";
import { toolsApi } from "api/client";
import Modal from "components/common/Modal/Modal";
import MultiSelectDropdown from "components/common/MultiSelectDropdown/MultiSelectDropdown";
import styles from "../ToolsView.module.css";

const COMPATIBILITY_OPTIONS = ["Web", "Android", "iOS", "React", "Angular", "PDF"];

export default function ToolModal({
  isOpen,
  tool,
  onClose,
  onSave,
  showToast,
}) {
  const [formData, setFormData] = useState({
    icon: "",
    name: "",
    type: "Browser extension",
    price: "Free",
    badge: "",
    badgeColor: "blue",
    url: "",
    compatibility: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (tool) {
        setFormData({
          icon: tool.icon || "",
          name: tool.name || "",
          type: tool.type || "Browser extension",
          price: tool.price || "Free",
          badge: tool.badge || "",
          badgeColor: tool.badge_color || tool.badgeColor || "blue",
          url: tool.url || "",
          compatibility: tool.compatibility || [],
        });
      } else {
        setFormData({
          icon: "🛠️",
          name: "",
          type: "Browser extension",
          price: "Free",
          badge: "",
          badgeColor: "blue",
          url: "https://",
          compatibility: [],
        });
      }
    }
  }, [tool, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();
    const { icon, name, type, price, badge, badgeColor, url, compatibility } = formData;

    if (!name.trim() || !price.trim() || !url.trim()) {
      showToast?.("Please fill in all required fields.", "error");
      return;
    }

    setSubmitting(true);
    const body = {
      icon: icon && icon.trim() ? icon.trim() : null,
      name: name.trim(),
      type: type && type.trim() ? type.trim() : null,
      price: price.trim(),
      badge: badge && badge.trim() ? badge.trim() : null,
      badgeColor: badge && badge.trim() ? badgeColor : null,
      url: url.trim(),
      compatibility: compatibility || [],
    };

    try {
      if (tool) {
        await toolsApi.update(tool.id, body);
        showToast?.(`Tool "${body.name}" updated successfully!`, "success");
      } else {
        await toolsApi.create(body);
        showToast?.(`Tool "${body.name}" created successfully!`, "success");
      }
      onSave?.();
      onClose();
    } catch (err) {
      showToast?.(err.message || "Failed to save tool.", "error");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Modal
      title={tool ? "✏️ Edit Recommended Tool" : "➕ Add Recommended Tool"}
      onClose={onClose}
      width="50%"
      footer={
        <>
          <button type="button" onClick={onClose} className={styles.cancelBtn} aria-label="Cancel tool edit">
            Cancel
          </button>
          <button
            type="submit"
            form="tool-form"
            disabled={submitting}
            className={styles.saveBtn}
          >
            {submitting ? "Saving..." : "Save Tool"}
          </button>
        </>
      }
    >
      <form id="tool-form" onSubmit={handleSaveTool}>
        <div className={styles.formFields}>
          <div className={styles.formGroup}>
            <label htmlFor="tool-icon" className={styles.formLabel}>
              Emoji Icon
            </label>
            <input
              id="tool-icon"
              name="icon"
              type="text"
              maxLength="5"
              value={formData.icon}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. 🪓"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tool-name" className={styles.formLabel}>
              Tool Name<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="tool-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. axe DevTools"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tool-type" className={styles.formLabel}>
              Classification Type<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="tool-type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. Browser extension"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tool-price" className={styles.formLabel}>
              Pricing/License<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="tool-price"
              name="price"
              type="text"
              value={formData.price}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. Free or Free / Pro"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tool-badge" className={styles.formLabel}>
              Highlight Badge
            </label>
            <input
              id="tool-badge"
              name="badge"
              type="text"
              value={formData.badge}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. Recommended or Popular"
            />
          </div>

          {formData.badge.trim() && (
            <div className={styles.formGroup}>
              <label htmlFor="tool-badge-color" className={styles.formLabel}>
                Badge Color Theme
              </label>
              <select
                id="tool-badge-color"
                name="badgeColor"
                value={formData.badgeColor}
                onChange={handleChange}
                className={styles.formSelect}
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="amber">Amber</option>
                <option value="purple">Purple</option>
                <option value="red">Red</option>
                <option value="pink">Pink</option>
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="tool-url" className={styles.formLabel}>
              Link URL<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="tool-url"
              name="url"
              type="url"
              value={formData.url}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="https://..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Platform Compatibility
            </label>
            <MultiSelectDropdown
              options={COMPATIBILITY_OPTIONS}
              value={formData.compatibility || []}
              onChange={(newValue) => setFormData(prev => ({ ...prev, compatibility: newValue }))}
              placeholder="Select compatible platforms..."
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
