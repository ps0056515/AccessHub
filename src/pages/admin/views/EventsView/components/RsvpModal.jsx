import React, { useEffect, useState } from "react";
import { eventsApi } from "api/client";
import Modal from "components/common/Modal/Modal";
import styles from "./EventModals.module.css";

export default function RsvpModal({ isOpen, event, onClose }) {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event) {
      loadRsvps();
    }
  }, [isOpen, event]);

  const loadRsvps = async () => {
    setLoading(true);
    try {
      const data = await eventsApi.getRsvpsAdmin(event.id);
      setRsvps(data || []);
    } catch (err) {
      console.error("Failed to load RSVPs", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <Modal title={`RSVPs for ${event.title}`} onClose={onClose} width="400px">
      <div className={styles.content}>
        {loading ? (
          <p>Loading RSVPs...</p>
        ) : rsvps.length === 0 ? (
          <p className={styles.emptyText}>No RSVPs yet.</p>
        ) : (
          <ul className={styles.list}>
            {rsvps.map((rsvp, idx) => (
              <li key={rsvp.id || idx} className={styles.listItem}>
                <div className={styles.itemName}>{rsvp.display_name || 'Guest'}</div>
                <div className={styles.itemEmail}>{rsvp.email}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
