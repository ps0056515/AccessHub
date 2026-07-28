import { useState, useEffect, useCallback, useMemo } from "react";
import { Trash } from "lucide-react";
import { eventsApi } from "api/client";
import EventModal from "./components/EventModal";
import RsvpModal from "./components/RsvpModal";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./EventsView.module.css";
import Table from "pages/admin/components/Table/Table";
import { truncateText } from "utils/commonUtils";
import { useConfirm } from "context/ConfirmContext";

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
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("Active Events");
  const [eventSearch, setEventSearch] = useState("");

  // Active events state
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rsvpModalEvent, setRsvpModalEvent] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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
    if (!(await confirm(`Delete event "${title}"?`))) return;
    try {
      await eventsApi.delete(id);
      showToast?.(`Event "${title}" deleted.`, "success");
      loadEvents();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to delete event.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !(await confirm(
        `Are you sure you want to delete ${selectedIds.length} events?`,
      ))
    )
      return;
    try {
      await Promise.all(selectedIds.map((id) => eventsApi.delete(id)));
      showToast?.(
        `Successfully deleted ${selectedIds.length} events.`,
        "success",
      );
      setSelectedIds([]);
      loadEvents();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to bulk delete events.", "error");
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
    if (!(await confirm(`Reject proposal "${title}"?`))) return;
    try {
      await eventsApi.rejectProposal(id);
      showToast?.(`Proposal "${title}" rejected.`, "success");
      loadProposals();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to reject proposal.", "error");
    }
  };

  const handleDeleteProposal = async (id, title) => {
    if (!(await confirm(`Permanently delete proposal "${title}"?`))) return;
    try {
      await eventsApi.deleteProposal(id);
      showToast?.(`Proposal "${title}" deleted.`, "success");
      loadProposals();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to delete proposal.", "error");
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

  const uniqueBands = useMemo(() => {
    const bands = new Set();
    eventsList.forEach((e) => {
      if (e.band) bands.add(e.band);
    });
    return Array.from(bands).sort();
  }, [eventsList]);

  const activeEventColumns = [
    {
      key: "date",
      label: "Date",
      render: (ev) => (
        <span className={styles.dateBadge}>
          <span>{fmtMonth(ev.event_date)}</span>
          <span className={styles.dateDay}>{fmtDay(ev.event_date)}</span>
        </span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (ev) => <strong>{truncateText(ev.title, 20)}</strong>,
    },
    { key: "type", label: "Type" },
    {
      key: "band",
      label: "Band",
      filterOptions: uniqueBands.length > 0 ? uniqueBands : undefined,
    },
    {
      key: "timing",
      label: "Timing",
      filterOptions: [
        { label: "Upcoming", value: "upcoming" },
        { label: "Live", value: "live" },
        { label: "Past", value: "past" },
      ],
      filterMatch: (ev, val) => getEventTiming(ev.event_date) === val,
      render: (ev) => (
        <span
          className={`${styles.timingPill} ${timingClass(getEventTiming(ev.event_date), styles)}`}
        >
          {getEventTiming(ev.event_date)}
        </span>
      ),
    },
    {
      key: "rsvps",
      label: "RSVPs",
      render: (ev) => (
        <button
          onClick={() => ev.rsvp_count > 0 && setRsvpModalEvent(ev)}
          className={styles.rsvpBtn}
          title="View RSVPs"
        >
          <span className={styles.rsvpCount}>{ev.rsvp_count ?? 0}</span>
        </button>
      ),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      render: (ev) =>
        ev.updated_at
          ? new Date(ev.updated_at)
              .toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
              .replace(",", "")
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (ev) => (
        <div className={styles.actionBtnGroup}>
          <button
            type="button"
            onClick={() => {
              setEditingEvent(ev);
              setIsModalOpen(true);
            }}
            className={styles.editBtn}
            aria-label={`Edit ${ev.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteEvent(ev.id, ev.title)}
            className={styles.deleteBtn}
            aria-label={`Delete ${ev.title}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const proposedEventColumns = [
    {
      key: "title",
      label: "Title",
      render: (p) => (
        <>
          <strong>{p.title}</strong>
          {p.details && (
            <>
              <br />
              <small className={styles.proposalDetails}>
                {p.details.slice(0, 80)}
                {p.details.length > 80 ? "…" : ""}
              </small>
            </>
          )}
        </>
      ),
    },
    { key: "format", label: "Format" },
    {
      key: "proposed_date",
      label: "Proposed Date",
      render: (p) => p.proposed_date || "—",
    },
    {
      key: "contact",
      label: "Contact",
      render: (p) => <a href={`mailto:${p.email}`}>{p.email}</a>,
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <span
          className={`${styles.statusBadge} ${styles[`status${p.status.charAt(0).toUpperCase() + p.status.slice(1)}`]}`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: "submitted",
      label: "Submitted",
      render: (p) => new Date(p.created_at).toLocaleDateString(),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      render: (p) =>
        p.updated_at
          ? new Date(p.updated_at)
              .toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
              .replace(",", "")
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) =>
        p.status === "pending" ? (
          <div className={styles.actionBtnGroup}>
            <button
              type="button"
              onClick={() => handleApproveProposal(p)}
              className={styles.approveBtn}
              aria-label={`Approve ${p.title}`}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => handleRejectProposal(p.id, p.title)}
              className={styles.deleteBtn}
              aria-label={`Reject ${p.title}`}
            >
              Reject
            </button>
          </div>
        ) : (
          <div className={styles.actionBtnGroupEnd}>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleDeleteProposal(p.id, p.title)}
              aria-label={`Delete ${p.title}`}
            >
              Delete
            </button>
          </div>
        ),
    },
  ];

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
          <h2
            id="events-cms-title"
            className={`${dashboardStyles.panelTitle} ${styles.panelTitle}`}
          >
            Events Calendar
          </h2>
          <div className={styles.searchWrapper}>
            <input
              id="admin-search-input"
              type="search"
              aria-label="Search events"
              placeholder="Search events..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              className={styles.searchInput}
            />
            {activeTab === "Active Events" && selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className={`${styles.deleteBtn} ${styles.bulkDeleteBtn}`}
              >
                <Trash aria-hidden="true" size={16} /> Bulk Delete ({selectedIds.length})
              </button>
            )}
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
        </div>

        {/* Tabs */}
        <nav className={styles.tabs} role="tablist" aria-label="Events admin sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
            >
              {tab}
              {tab === "Proposed Events" &&
                proposals.filter((p) => p.status === "pending").length > 0 && (
                  <span className={`${styles.rsvpCount} ${styles.tabBadge}`}>
                    {proposals.filter((p) => p.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {/* Active Events Tab */}
        {activeTab === "Active Events" && (
          <div role="tabpanel" id="tabpanel-active-events" aria-labelledby="tab-active-events">
            <Table
            columns={activeEventColumns}
            data={eventsList}
            loading={eventsLoading}
            emptyMessage="No events yet. Click '📅 Add Event' to create one."
            searchQuery={eventSearch}
            selectable
            selectedRowIds={selectedIds}
            onSelectChange={setSelectedIds}
            pagination={true}
          />
          </div>
        )}
        {/* Proposed Events Tab */}
        {activeTab === "Proposed Events" && (
          <div role="tabpanel" id="tabpanel-proposed-events" aria-labelledby="tab-proposed-events">
            <Table
            columns={proposedEventColumns}
            data={proposals}
            loading={proposalsLoading}
            emptyMessage="No proposals submitted yet."
            searchQuery={eventSearch}
            pagination={true}
          />
          </div>
        )}
      </section>

      <EventModal
        isOpen={isModalOpen}
        event={editingEvent}
        onClose={handleModalClose}
        onSave={approvingProposal ? handleModalSave : loadEvents}
        showToast={showToast}
      />

      <RsvpModal
        isOpen={!!rsvpModalEvent}
        onClose={() => setRsvpModalEvent(null)}
        event={rsvpModalEvent}
      />
    </>
  );
}
