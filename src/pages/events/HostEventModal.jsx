import { useState } from "react";
import Modal from "components/common/Modal/Modal";
import { eventsApi } from "api/client";
import styles from "./Events.module.css";

export default function HostEventModal({ isOpen, onClose }) {
  const [hostTitle, setHostTitle] = useState("");
  const [hostFormat, setHostFormat] = useState("webinar");
  const [hostDate, setHostDate] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [hostDetails, setHostDetails] = useState("");
  const [hostMsg, setHostMsg] = useState(null);

  if (!isOpen) return null;

  const handleHostSubmit = async (e) => {
    e.preventDefault();
    const title = hostTitle.trim();
    const email = hostEmail.trim();
    if (!title || !email) {
      setHostMsg("Please add an event title and a contact email.");
      return;
    }
    try {
      await eventsApi.submitProposal({
        title,
        format: hostFormat,
        proposedDate: hostDate.trim() || null,
        email,
        details: hostDetails.trim() || null,
      });
      setHostMsg(
        "Thanks — your proposal has been submitted! Our team will review it and get back to you."
      );
      setHostTitle("");
      setHostFormat("webinar");
      setHostDate("");
      setHostEmail("");
      setHostDetails("");
    } catch (err) {
      setHostMsg(err.message || "Failed to submit proposal. Please try again.");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setHostMsg(null);
    }, 200);
  };

  return (
    <Modal title="Host an event" onClose={handleClose}>
      <p className={styles.hostModalIntro}>
        Tell us about your session. We’ll review community fit, timing, and
        accessibility needs before it goes live — same flow whether you’re on a
        preview build or production.
      </p>
      <form
        onSubmit={handleHostSubmit}
        noValidate
        aria-describedby="host-required-note"
      >
        <p id="host-required-note" className={styles.formRequiredNote}>
          Required fields are marked with an asterisk (
          <span className={styles.requiredMark} aria-hidden="true">
            *
          </span>
          ).
        </p>
        <label className={styles.formLabel} htmlFor="host-title">
          <span className={styles.formLabelText}>
            Event title
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </span>
          <input
            id="host-title"
            className={styles.formInput}
            name="host-title"
            autoComplete="off"
            required
            aria-required="true"
            value={hostTitle}
            onChange={(e) => setHostTitle(e.target.value)}
          />
        </label>
        <label className={styles.formLabel} htmlFor="host-format">
          <span className={styles.formLabelText}>Format</span>
          <select
            id="host-format"
            className={styles.formInput}
            name="host-format"
            value={hostFormat}
            onChange={(e) => setHostFormat(e.target.value)}
          >
            <option value="webinar">Webinar (online)</option>
            <option value="workshop">Workshop (online)</option>
            <option value="meetup">Local meetup (in person)</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <label className={styles.formLabel} htmlFor="host-date">
          <span className={styles.formLabelText}>
            Proposed date or window
            <span className={styles.optionalMark}> (optional)</span>
          </span>
          <input
            id="host-date"
            className={styles.formInput}
            name="host-date"
            placeholder="e.g. July 2026, or 15 Sept afternoon"
            value={hostDate}
            onChange={(e) => setHostDate(e.target.value)}
          />
        </label>
        <label className={styles.formLabel} htmlFor="host-email">
          <span className={styles.formLabelText}>
            Contact email
            <span className={styles.requiredMark} aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </span>
          <input
            id="host-email"
            className={styles.formInput}
            name="host-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            aria-required="true"
            value={hostEmail}
            onChange={(e) => setHostEmail(e.target.value)}
          />
        </label>
        <label className={styles.formLabel} htmlFor="host-details">
          <span className={styles.formLabelText}>
            Details (audience, length, accessibility plans)
            <span className={styles.optionalMark}> (optional)</span>
          </span>
          <textarea
            id="host-details"
            className={styles.formTextarea}
            name="host-details"
            rows={4}
            value={hostDetails}
            onChange={(e) => setHostDetails(e.target.value)}
          />
        </label>
        {hostMsg ? (
          <p className={styles.formMsg} role="status" aria-live="polite">
            {hostMsg}
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
          <button type="submit" className={styles.submitOk}>
            Submit proposal
          </button>
        </div>
      </form>
    </Modal>
  );
}
