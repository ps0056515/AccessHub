import { useState, useEffect, useCallback } from "react";
import { resourcesApi } from "api/client";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./ResourcesView.module.css";
import ResourceModal from "./components/ResourceModal";

const TABS = ["Active Resources", "Proposed Resources"];

export default function ResourcesView({ showToast }) {
  const [activeTab, setActiveTab] = useState("Active Resources");

  const [resourcesList, setResourcesList] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);

  const [proposals, setProposals] = useState([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [approvingProposal, setApprovingProposal] = useState(null);

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
          <h2 id="resources-cms-title" className={dashboardStyles.panelTitle}>
            Resources Library
          </h2>
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
                  <span className={styles.rsvpCount} style={{ marginLeft: 6 }}>
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
            <div className={styles.tableContainer}>
              <table className={dashboardStyles.table}>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 60 }}>
                      Icon
                    </th>
                    <th scope="col">Title</th>
                    <th scope="col">Category</th>
                    <th scope="col">Color</th>
                    <th scope="col" style={{ width: 130 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resourcesList.map((res) => (
                    <tr key={res.id}>
                      <td style={{ fontSize: "1.25rem" }}>{res.icon}</td>
                      <td>
                        <strong>{res.title}</strong>
                        <br />
                        <a
                          href={res.view_url}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.metaLink}
                        >
                          {res.view_url}
                        </a>
                      </td>
                      <td>{res.category}</td>
                      <td>
                        <span style={{ color: `var(--${res.color}-600)` }}>
                          {res.color}
                        </span>
                      </td>
                      <td>
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
                            onClick={() =>
                              handleDeleteResource(res.id, res.title)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {resourcesList.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        No active resources.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}

        {activeTab === "Proposed Resources" &&
          (proposalsLoading && proposals.length === 0 ? (
            <p className={dashboardStyles.loading}>Loading proposals…</p>
          ) : (
            <div className={styles.tableContainer}>
              <table className={dashboardStyles.table}>
                <thead>
                  <tr>
                    <th scope="col" style={{ width: 120 }}>
                      Date
                    </th>
                    <th scope="col">Title & URL</th>
                    <th scope="col">Submitter Note</th>
                    <th scope="col" style={{ width: 100 }}>
                      Status
                    </th>
                    <th scope="col" style={{ width: 150 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.id}>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
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
                      </td>
                      <td style={{ color: "var(--gray-600)" }}>
                        {p.note || "—"}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${styles["status" + p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {p.status === "pending" ? (
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={dashboardStyles.btnApprove}
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
                              className={dashboardStyles.btnReject}
                              onClick={() => handleRejectProposal(p.id)}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div
                            className={styles.actionBtnGroup}
                            style={{ justifyContent: "space-between" }}
                          >
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteProposal(p.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {proposals.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        No proposals yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
