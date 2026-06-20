import { useState } from "react";
import axios from "axios";

const API = "https://internhub-gbuo.onrender.com";

const statusBadgeClass = (status) => {
    if (status === "Accepted") return "badge badge-success";
    if (status === "Under Review") return "badge badge-warning";
    if (status === "Rejected") return "badge badge-danger";
    return "badge badge-neutral";
};

function Applications({ applications, setApplications, getAuthHeader }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editResume, setEditResume] = useState("");
    const [editError, setEditError] = useState("");

    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // ── Delete ────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/applications/${id}`, { headers: getAuthHeader() });
            setApplications(applications.filter((app) => app.id !== id));
            setConfirmDeleteId(null);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete application. Please try again.");
        }
    };

    // ── Edit ──────────────────────────────────────────────────────
    const startEdit = (app) => {
        setEditingId(app.id);
        setEditName(app.name);
        setEditEmail(app.email);
        setEditResume(app.resumeUrl || app.resume);
        setEditError("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditError("");
    };

    const saveEdit = async (app) => {
        if (!editName.trim() || !editEmail.trim() || !editResume.trim()) {
            setEditError("All fields are required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
            setEditError("Please enter a valid email address.");
            return;
        }
        try {
            const { data } = await axios.put(
                `${API}/applications/${app.id}`,
                {
                    name: editName.trim(),
                    email: editEmail.trim(),
                    resumeUrl: editResume.trim(),
                },
                { headers: getAuthHeader() }
            );
            setApplications(applications.map((a) => (a.id === app.id ? data : a)));
            setEditingId(null);
        } catch (err) {
            console.error("Update failed:", err);
            setEditError("Failed to save changes. Please try again.");
        }
    };


    return (
        <div className="container">
            <div className="page-header">
                <h1>My Applications</h1>
                <p>Track, edit, and manage all your submitted applications</p>
            </div>

            {applications.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📋</span>
                    <h3>No applications yet</h3>
                    <p>Browse internships and submit your first application!</p>
                </div>
            ) : (
                <>
                    <p className="results-count" style={{ marginBottom: "16px" }}>
                        <strong style={{ color: "var(--text)" }}>{applications.length}</strong> application{applications.length !== 1 ? "s" : ""} submitted
                    </p>

                    <div className="cards-grid">
                        {applications.map((app) => (
                            <div className="card" key={app.id} id={`app-card-${app.id}`}>
                                {/* Card Header */}
                                <div className="card-header">
                                    <div>
                                        <div className="card-title">{app.internship}</div>
                                        <div className="card-company">🏢 {app.company || "—"}</div>
                                    </div>
                                    <span className={statusBadgeClass(app.status)}>
                                        {app.status || "Pending"}
                                    </span>
                                </div>

                                {/* Info */}
                                {editingId !== app.id && (
                                    <div className="app-card-info">
                                        <span>👤 <strong>Name:</strong> {app.name}</span>
                                        <span>📧 <strong>Email:</strong> {app.email}</span>
                                        <span>🔗 <strong>Resume:</strong>{" "}
                                            {app.resumeUrl || app.resume ? (
                                                <a
                                                    href={(() => { const u = app.resumeUrl || app.resume; return u.endsWith('.pdf') ? u : u + '.pdf'; })()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ textDecoration: "none", padding: "2px 8px", fontSize: "0.82rem" }}
                                                >
                                                    📄 View
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </span>
                                        {app.appliedAt && (
                                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                                Applied on {app.appliedAt}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Inline Edit Form */}
                                {editingId === app.id && (
                                    <div className="edit-form">
                                        {editError && (
                                            <div style={{
                                                background: "rgba(239,68,68,0.1)",
                                                border: "1px solid rgba(239,68,68,0.3)",
                                                borderRadius: "8px",
                                                padding: "8px 12px",
                                                fontSize: "0.82rem",
                                                color: "#f87171"
                                            }}>
                                                ⚠️ {editError}
                                            </div>
                                        )}
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" htmlFor={`edit-name-${app.id}`}>Name</label>
                                            <input
                                                id={`edit-name-${app.id}`}
                                                className="form-input"
                                                type="text"
                                                value={editName}
                                                onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" htmlFor={`edit-email-${app.id}`}>Email</label>
                                            <input
                                                id={`edit-email-${app.id}`}
                                                className="form-input"
                                                type="email"
                                                value={editEmail}
                                                onChange={(e) => { setEditEmail(e.target.value); setEditError(""); }}
                                            />
                                        </div>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label" htmlFor={`edit-resume-${app.id}`}>Resume Link (Optional)</label>
                                            <input
                                                id={`edit-resume-${app.id}`}
                                                className="form-input"
                                                type="text"
                                                value={editResume}
                                                onChange={(e) => { setEditResume(e.target.value); setEditError(""); }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="app-card-actions">
                                    {editingId === app.id ? (
                                        <>
                                            <button
                                                id={`save-btn-${app.id}`}
                                                className="btn btn-success btn-sm"
                                                onClick={() => saveEdit(app)}
                                            >
                                                ✓ Save
                                            </button>
                                            <button
                                                id={`cancel-btn-${app.id}`}
                                                className="btn btn-ghost btn-sm"
                                                onClick={cancelEdit}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : confirmDeleteId === app.id ? (
                                        <>
                                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginRight: "auto", alignSelf: "center" }}>
                                                Confirm delete?
                                            </span>
                                            <button
                                                id={`confirm-delete-btn-${app.id}`}
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(app.id)}
                                            >
                                                Delete
                                            </button>
                                            <button
                                                id={`cancel-delete-btn-${app.id}`}
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setConfirmDeleteId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                id={`edit-btn-${app.id}`}
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => startEdit(app)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                id={`delete-btn-${app.id}`}
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setConfirmDeleteId(app.id)}
                                            >
                                                🗑 Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Applications;