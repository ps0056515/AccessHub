import { useState, useEffect, useCallback } from "react";
import { eventsApi } from "api/client";
import EventModal from "./components/EventModal";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./EventsView.module.css";

const TABS = ["Active Events", "Proposed Events"];

const MONTH_ABBRS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

/** Derive past / live / upcoming from the stored ISO date vs today (UTC). */
function getEventTiming(eventDateStr) {
  if (!eventDateStr) return "upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(String(eventDateStr).slice(0, 10) + "T00:00:00");
  const diff = d - today;
  if (diff < 0) return "past";
  if (diff === 0) return "live";
  return "upcoming";
}

function fmtMonth(dateStr) {
  if (!dateStr) return "";
  return (
    MONTH_ABBRS[
      new Date(String(dateStr).slice(0, 10) + "T00:00:00Z").getUTCMonth()
    ] ?? ""
  );
}

function fmtDay(dateStr) {
  if (!dateStr) return "";
  return String(
    new Date(String(dateStr).slice(0, 10) + "T00:00:00Z").getUTCDate(),
  );
}

function timingClass(timing, s) {
  if (timing === "live") return s.timingLive;
  if (timing === "past") return s.timingPast;
  return s.timingUpcoming;
}

export default function EventsView({ showToast }) {
  const [activeTab, setActiveTab] = useState("Active Events");

  // Active events state
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Proposals state
  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [approvingProposal, setApprovingProposal] = useState(null); // proposal being promoted

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const data = await eventsApi.list();
      if (Array.isArray(data)) setEventsList(data);
    } catch (err) {
      showToast?.(err.message || "Failed to load events.", "error");
    } finally {
      setEventsLoading(false);
    }
  }, [showToast]);

  const loadProposals = useCallback(async () => {
    setProposalsLoading(true);
    try {
      const data = await eventsApi.listProposals();
      if (Array.isArray(data)) setProposals(data);
    } catch (err) {
      showToast?.(err.message || "Failed to load proposals.", "error");
    } finally {
      setProposalsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
  useEffect(() => {
    if (activeTab === "Proposed Events") loadProposals();
  }, [activeTab, loadProposals]);

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await eventsApi.delete(id);
      showToast?.(`Event "${title}" deleted.`, "success");
      loadEvents();
    } catch (err) {
      showToast?.(err.message || "Failed to delete event.", "error");
    }
  };

  const handleMoveEvent = async (index, direction) => {
    const list = [...eventsList];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setEventsList(list);
    try {
      await eventsApi.reorder({ eventIds: list.map((e) => e.id) });
      showToast?.("Events reordered.", "success");
    } catch (err) {
      showToast?.(err.message || "Failed to reorder.", "error");
      loadEvents();
    }
  };

  const handleRejectProposal = async (id, title) => {
    if (!window.confirm(`Reject proposal "${title}"?`)) return;
    try {
      await eventsApi.deleteProposal(id);
      showToast?.(`Proposal "${title}" rejected.`, "success");
      loadProposals();
    } catch (err) {
      showToast?.(err.message || "Failed to reject proposal.", "error");
    }
  };

  // Pre-fill EventModal from a proposal
  const handleApproveProposal = (proposal) => {
    setApprovingProposal(proposal);
    setEditingEvent({
      _proposalId: proposal.id,
      title: proposal.title,
      type: `${proposal.format}${proposal.proposed_date ? " · " + proposal.proposed_date : ""}`,
      event_date: "",
      band: "Free",
    });
    setIsModalOpen(true);
  };

  const handleSaveFromProposal = async (body, proposalId) => {
    try {
      await eventsApi.approveProposal(proposalId, body);
      showToast?.("Proposal approved and added to events!", "success");
      setApprovingProposal(null);
      loadEvents();
      loadProposals();
    } catch (err) {
      showToast?.(err.message || "Failed to approve proposal.", "error");
    }
  };

  const handleModalSave = useCallback(
    async (body) => {
      if (approvingProposal) {
        await handleSaveFromProposal(body, approvingProposal.id);
      }
      setApprovingProposal(null);
    },
    [approvingProposal],
  );

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setApprovingProposal(null);
  };

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Manage Events</h1>
          <p className={dashboardStyles.lead}>
            Create workshops, webinars, and coordinate community office hour
            schedules.
          </p>
        </div>
      </header>

      <section
        className={dashboardStyles.panel}
        aria-labelledby="events-cms-title"
      >
        {/* Panel header */}
        <div className={styles.eventsHeader}>
          <h2 id="events-cms-title" className={dashboardStyles.panelTitle}>
            Events Calendar
          </h2>
          {activeTab === "Active Events" && (
            <button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setIsModalOpen(true);
              }}
              className={styles.addEventBtn}
            >
              📅 Add Event
            </button>
          )}
        </div>

        {/* Tabs */}
        <nav className={styles.tabs} aria-label="Events admin sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            >
              {tab}
              {tab === "Proposed Events" &&
                proposals.filter((p) => p.status === "pending").length > 0 && (
                  <span className={styles.rsvpCount} style={{ marginLeft: 6 }}>
                    {proposals.filter((p) => p.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {/* Active Events Tab */}
        {activeTab === "Active Events" &&
          (eventsLoading && eventsList.length === 0 ? (
            <p className={dashboardStyles.loading}>Loading events…</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={dashboardStyles.table}>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 80 }}>
                      Date
                    </th>
                    <th scope="col">Title</th>
                    <th scope="col">Type</th>
                    <th scope="col">Band</th>
                    <th scope="col">Timing</th>
                    <th scope="col" style={{ width: 80, textAlign: "center" }}>
                      RSVPs
                    </th>
                    <th scope="col" style={{ width: 130 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventsList.map((ev, index) => (
                    <tr key={ev.id}>
                      <td>
                        <span className={styles.dateBadge}>
                          <span>{fmtMonth(ev.event_date)}</span>
                          <span className={styles.dateDay}>
                            {fmtDay(ev.event_date)}
                          </span>
                        </span>
                      </td>
                      <td>
                        <strong>{ev.title}</strong>
                      </td>
                      <td>{ev.type}</td>
                      <td>{ev.band}</td>
                      <td>
                        <span
                          className={`${styles.timingPill} ${timingClass(getEventTiming(ev.event_date), styles)}`}
                        >
                          {getEventTiming(ev.event_date)}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={styles.rsvpCount}>
                          {ev.rsvp_count ?? 0}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtnGroup}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEvent(ev);
                              setIsModalOpen(true);
                            }}
                            className={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id, ev.title)}
                            className={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {eventsList.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "var(--text-muted)",
                        }}
                      >
                        No events yet. Click "📅 Add Event" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

        {/* Proposed Events Tab */}
        {activeTab === "Proposed Events" &&
          (proposalsLoading ? (
            <p className={dashboardStyles.loading}>Loading proposals…</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={dashboardStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Format</th>
                    <th scope="col">Proposed Date</th>
                    <th scope="col">Contact</th>
                    <th scope="col">Status</th>
                    <th scope="col">Submitted</th>
                    <th scope="col" style={{ width: 160 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.title}</strong>
                        {p.details && (
                          <>
                            <br />
                            <small style={{ color: "var(--text-muted)" }}>
                              {p.details.slice(0, 80)}
                              {p.details.length > 80 ? "…" : ""}
                            </small>
                          </>
                        )}
                      </td>
                      <td>{p.format}</td>
                      <td>{p.proposed_date || "—"}</td>
                      <td>
                        <a href={`mailto:${p.email}`}>{p.email}</a>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${styles[`status${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        {p.status === "pending" ? (
                          <div className={styles.actionBtnGroup}>
                            <button
                              type="button"
                              onClick={() => handleApproveProposal(p)}
                              className={styles.approveBtn}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRejectProposal(p.id, p.title)
                              }
                              className={styles.deleteBtn}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            style={{ color: "var(--text-muted)", fontSize: 12 }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {proposals.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "var(--text-muted)",
                        }}
                      >
                        No proposals submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
      </section>

      <EventModal
        isOpen={isModalOpen}
        event={editingEvent}
        onClose={handleModalClose}
        onSave={approvingProposal ? handleModalSave : loadEvents}
        showToast={showToast}
      />
    </>
  );
}
