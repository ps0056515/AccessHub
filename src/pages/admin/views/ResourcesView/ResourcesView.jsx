import { useState, useEffect, useCallback } from "react";
import { resourcesApi } from "api/client";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./ResourcesView.module.css";
import ResourceModal from "./components/ResourceModal";
import Table from "components/common/Table/Table";
import { truncateText } from "utils/commonUtils";
import { Trash } from "lucide-react";

const TABS = ["Active Resources", "Proposed Resources"];

export default function ResourcesView({ showToast }) {
  const [activeTab, setActiveTab] = useState("Active Resources");
  const [resourceSearch, setResourceSearch] = useState("");

  const [resourcesList, setResourcesList] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [approvingProposal, setApprovingProposal] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      const data = await resourcesApi.list();
      if (Array.isArray(data)) setResourcesList(data);
    } catch (err) {
      showToast?.(err.message || "Failed to load resources.", "error");
    } finally {
      setResourcesLoading(false);
    }
  }, [showToast]);

  const loadProposals = useCallback(async () => {
    setProposalsLoading(true);
    try {
      const data = await resourcesApi.listProposals();
      if (Array.isArray(data)) setProposals(data);
    } catch (err) {
      showToast?.(err.message || "Failed to load proposals.", "error");
    } finally {
      setProposalsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);
  useEffect(() => {
    if (activeTab === "Proposed Resources") loadProposals();
  }, [activeTab, loadProposals]);

  const handleDeleteResource = async (id, title) => {
    if (!window.confirm(`Delete resource "${title}"?`)) return;
    try {
      await resourcesApi.delete(id);
      showToast?.(`Resource "${title}" deleted.`, "success");
      loadResources();
    } catch (err) {
      showToast?.(err.message || "Failed to delete resource.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} resources?`,
      )
    )
      return;
    try {
      await Promise.all(selectedIds.map((id) => resourcesApi.delete(id)));
      showToast?.(
        `Successfully deleted ${selectedIds.length} resources.`,
        "success",
      );
      setSelectedIds([]);
      loadResources();
    } catch (err) {
      showToast?.(err.message || "Failed to bulk delete resources.", "error");
    }
  };

  const handleRejectProposal = async (id) => {
    if (!window.confirm("Reject this proposal?")) return;
    try {
      await resourcesApi.rejectProposal(id);
      showToast?.("Proposal rejected.", "success");
      loadProposals();
    } catch (err) {
      showToast?.(err.message || "Failed to reject proposal.", "error");
    }
  };

  const handleDeleteProposal = async (id) => {
    if (!window.confirm("Permanently delete this proposal?")) return;
    try {
      await resourcesApi.deleteProposal(id);
      showToast?.("Proposal deleted.", "success");
      loadProposals();
    } catch (err) {
      showToast?.(err.message || "Failed to delete proposal.", "error");
    }
  };

  const handleApproveProposal = async (body) => {
    try {
      await resourcesApi.approveProposal(approvingProposal.id, body);
      showToast?.(`Proposal "${body.title}" approved!`, "success");
      loadProposals();
      loadResources();
    } catch (err) {
      throw err;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setApprovingProposal(null);
  };

  const activeResourceColumns = [
    {
      key: "icon",
      label: "Icon",
      width: "15%",
      render: (res) => <span className={styles.resourceIcon}>{res.icon}</span>,
    },
    {
      key: "title",
      label: "Title",
      width: "40%",
      render: (res) => (
        <div className={styles.titleWrapper}>
          <strong>{res.title}</strong>
          <br />
          <a
            href={res.view_url}
            target="_blank"
            rel="noreferrer"
            className={styles.metaLink}
          >
            {truncateText(res.view_url)}
          </a>
        </div>
      ),
    },
    { key: "category", label: "Category", width: "15%" },
    {
      key: "color",
      label: "Color",
      width: "15%",

      render: (res) => (
        <span style={{ color: `var(--${res.color}-600)` }}>{res.color}</span>
      ),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      width: "15%",
      render: (res) =>
        res.updated_at
          ? new Date(res.updated_at)
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
      width: "25%",
      render: (res) => (
        <div className={styles.actionBtnGroup}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => {
              setEditingResource(res);
              setIsModalOpen(true);
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => handleDeleteResource(res.id, res.title)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const proposedResourceColumns = [
    {
      key: "date",
      label: "Date",
      width: "15%",
      render: (p) => new Date(p.created_at).toLocaleDateString(),
    },
    {
      key: "title",
      label: "Title & URL",
      width: "40%",
      render: (p) => (
        <div className={styles.titleWrapper}>
          <strong>{p.title}</strong>
          <br />
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className={styles.metaLink}
          >
            {p.url}
          </a>
        </div>
      ),
    },
    {
      key: "note",
      label: "Submitter Note",
      width: "15%",
      render: (p) => <span className={styles.noteText}>{p.note || "—"}</span>,
    },
    {
      key: "status",
      label: "Status",
      width: "10%",
      render: (p) => (
        <span
          className={`${styles.statusBadge} ${styles["status" + p.status]}`}
        >
          {p.status}
        </span>
      ),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      width: "10%",
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
      width: "20%",
      render: (p) =>
        p.status === "pending" ? (
          <div className={styles.actionBtnGroup}>
            <button
              type="button"
              className={styles.approveBtn}
              onClick={() => {
                setApprovingProposal({
                  ...p,
                  _proposalId: p.id,
                });
              }}
            >
              Approve
            </button>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleRejectProposal(p.id)}
            >
              Reject
            </button>
          </div>
        ) : (
          <div
            className={`${styles.actionBtnGroup} ${styles.actionBtnGroupSpaced}`}
          >
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleDeleteProposal(p.id)}
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
          <h1 className={dashboardStyles.title}>Manage Resources</h1>
          <p className={dashboardStyles.lead}>
            Curate guides, templates, and reference materials.
          </p>
        </div>
      </header>

      <section
        className={dashboardStyles.panel}
        aria-labelledby="resources-cms-title"
      >
        <div className={styles.eventsHeader}>
          <h2
            id="resources-cms-title"
            className={`${dashboardStyles.panelTitle} ${styles.headerTitle}`}
          >
            Resources Library
          </h2>
          <div className={styles.headerActions}>
            <input
              type="text"
              placeholder="Search resources..."
              value={resourceSearch}
              onChange={(e) => setResourceSearch(e.target.value)}
              className={styles.searchInput}
            />
            {activeTab === "Active Resources" && selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className={`${styles.deleteBtn} ${styles.bulkDeleteBtn}`}
              >
                <Trash size={16} /> Delete ({selectedIds.length})
              </button>
            )}
            {activeTab === "Active Resources" && (
              <button
                type="button"
                onClick={() => {
                  setEditingResource(null);
                  setIsModalOpen(true);
                }}
                className={styles.addEventBtn}
              >
                📚 Add Resource
              </button>
            )}
          </div>
        </div>

        <nav className={styles.tabs} aria-label="Resources admin sections">
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
              {tab === "Proposed Resources" &&
                proposals.filter((p) => p.status === "pending").length > 0 && (
                  <span className={styles.rsvpCount}>
                    {proposals.filter((p) => p.status === "pending").length}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {activeTab === "Active Resources" &&
          (resourcesLoading && resourcesList.length === 0 ? (
            <p className={dashboardStyles.loading}>Loading resources…</p>
          ) : (
            <Table
              columns={activeResourceColumns}
              data={resourcesList}
              loading={resourcesLoading}
              emptyMessage="No active resources."
              searchQuery={resourceSearch}
              selectable
              selectedRowIds={selectedIds}
              onSelectChange={setSelectedIds}
              pagination={true}
              
            />
          ))}

        {activeTab === "Proposed Resources" &&
          (proposalsLoading && proposals.length === 0 ? (
            <p className={dashboardStyles.loading}>Loading proposals…</p>
          ) : (
            <Table
              columns={proposedResourceColumns}
              data={proposals}
              loading={proposalsLoading}
              emptyMessage="No proposals yet."
              searchQuery={resourceSearch}
              pagination={true}
            />
          ))}
      </section>

      <ResourceModal
        isOpen={isModalOpen || !!approvingProposal}
        resource={approvingProposal || editingResource}
        existingResources={resourcesList}
        onClose={handleModalClose}
        onSave={approvingProposal ? handleApproveProposal : loadResources}
        showToast={showToast}
      />
    </>
  );
}
