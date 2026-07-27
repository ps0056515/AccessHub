import { useState } from "react";
import Modal from "components/common/Modal/Modal";
import { eventsApi } from "api/client";
import { useAuth } from "context/AuthContext";
import { useToast } from "context/ToastContext";
import styles from "./Events.module.css";

export default function RsvpModal({ event, onClose }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpMsg, setRsvpMsg] = useState(null);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);

  if (!event) return null;

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    const email = user ? user.email : rsvpEmail.trim();
    if (!email) {
      setRsvpMsg("Please enter your email address.");
      return;
    }
    setRsvpSubmitting(true);
    try {
      await eventsApi.rsvp(event.id, {
        email,
        displayName: user?.displayName || null,
      });
      setRsvpMsg("✨ You're on the list! Check your email for a calendar invite.");
      addToast("Successfully RSVP'd to the event!", "success");
    } catch (err) {
      setRsvpMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setRsvpEmail("");
      setRsvpMsg(null);
      setRsvpSubmitting(false);
    }, 200);
  };

  return (
    <Modal title={`RSVP: ${event.title}`} onClose={handleClose}>
      <p style={{ marginBottom: 12 }}>{event.type}</p>
      {rsvpMsg ? (
        <p className={styles.rsvpHint} role="status" aria-live="polite">
          {rsvpMsg}
        </p>
      ) : (
        <form onSubmit={handleRsvpSubmit}>
          {user ? (
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              Registering as <strong>{user.displayName}</strong> ({user.email})
            </p>
          ) : (
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Your email address<span className="required-asterisk" aria-hidden="true"> *</span>
              </span>
              <input
                type="email"
                className={styles.formInput}
                value={rsvpEmail}
                onChange={(e) => setRsvpEmail(e.target.value)}
                placeholder="you@example.com"
                required
                aria-required="true"
              />
            </label>
          )}
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
              disabled={rsvpSubmitting}
            >
              {rsvpSubmitting ? "Registering…" : "Confirm RSVP"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
