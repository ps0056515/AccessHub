import { useState } from "react";
import Modal from "components/common/Modal/Modal";
import { resourcesApi } from "api/client";
import styles from "./Resources.module.css";

export default function SuggestResourceModal({ isOpen, onClose }) {
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitNote, setSubmitNote] = useState("");
  const [submitMsg, setSubmitMsg] = useState(null);
  const [submitSubmitting, setSubmitSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = submitTitle.trim();
    const url = submitUrl.trim();
    if (!title || !url) {
      setSubmitMsg("Please add at least a title and link.");
      return;
    }

    setSubmitSubmitting(true);
    setSubmitMsg(null);
    try {
      await resourcesApi.submitProposal({
        title,
        url,
        note: submitNote.trim(),
      });
      setSubmitMsg(
        "Thanks — your suggestion has been submitted for review. You can submit another anytime.",
      );
      setSubmitTitle("");
      setSubmitUrl("");
      setSubmitNote("");
    } catch (err) {
      setSubmitMsg(
        err.message || "Failed to submit resource. Please try again.",
      );
    } finally {
      setSubmitSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after a brief delay to allow exit animation if any
    setTimeout(() => {
      setSubmitMsg(null);
      setSubmitTitle("");
      setSubmitUrl("");
      setSubmitNote("");
    }, 200);
  };

  return (
    <Modal title="Suggest a resource" onClose={handleClose}>
      <form id="resource-submit-form" onSubmit={handleSubmit} noValidate>
        <label className={styles.formLabel}>
          Title
          <input
            className={styles.formInput}
            name="resource-title"
            autoComplete="off"
            value={submitTitle}
            onChange={(e) => setSubmitTitle(e.target.value)}
          />
        </label>
        <label className={styles.formLabel}>
          Link
          <input
            className={styles.formInput}
            name="resource-url"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={submitUrl}
            onChange={(e) => setSubmitUrl(e.target.value)}
          />
        </label>
        <label className={styles.formLabel}>
          Notes (optional)
          <textarea
            className={styles.formTextarea}
            name="resource-notes"
            rows={3}
            value={submitNote}
            onChange={(e) => setSubmitNote(e.target.value)}
          />
        </label>
        {submitMsg ? (
          <p className={styles.formMsg} role="status" aria-live="polite">
            {submitMsg}
          </p>
        ) : null}
        <div className={styles.submitFooter}>
          <button
            type="button"
            className={styles.submitCancel}
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitOk}
            disabled={submitSubmitting}
          >
            {submitSubmitting ? "Submitting..." : "Submit resource"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
