import { useNavigate } from "react-router-dom";

const statusBadgeClass = (status) => {
    if (status === "Accepted") return "badge badge-success";
    if (status === "Under Review") return "badge badge-warning";
    if (status === "Rejected") return "badge badge-danger";
    return "badge badge-neutral";
};

const statusDot = (status) => {
    if (status === "Accepted") return "#22c55e";
    if (status === "Under Review") return "#3b82f6";
    if (status === "Rejected") return "#ef4444";
    return "#f59e0b";
};

function Dashboard({ applications }) {
    const navigate = useNavigate();
    const userName = localStorage.getItem("userName") || "there";
    const firstName = userName.split(" ")[0];

    const total = applications.length;
    const pending = applications.filter((a) => !a.status || a.status === "Pending").length;
    const review = applications.filter((a) => a.status === "Under Review").length;
    const accepted = applications.filter((a) => a.status === "Accepted").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;

    const recent = [...applications].reverse().slice(0, 5);

    const stats = [
        { icon: "📋", label: "Total Applied", value: total, color: "#6366f1" },
        { icon: "🟡", label: "Pending", value: pending, color: "#f59e0b" },
        { icon: "🔵", label: "Under Review", value: review, color: "#3b82f6" },
        { icon: "🟢", label: "Accepted", value: accepted, color: "#22c55e" },
        { icon: "🔴", label: "Rejected", value: rejected, color: "#ef4444" },
    ];

    return (
        <div className="container">
            {/* ── Welcome Header ── */}
            <div className="db-welcome">
                <div>
                    <h1 className="db-welcome-title">
                        Welcome back, {firstName}! 👋
                    </h1>
                    <p className="db-welcome-sub">
                        Here's an overview of your internship journey
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/internships")}
                    style={{ flexShrink: 0 }}
                >
                    Browse Internships →
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div className="db-stats-grid">
                {stats.map(({ icon, label, value, color }) => (
                    <div
                        key={label}
                        className="db-stat-card"
                        style={{ "--db-stat-color": color }}
                    >
                        <div className="db-stat-top">
                            <span className="db-stat-icon">{icon}</span>
                            <span className="db-stat-value">{value}</span>
                        </div>
                        <span className="db-stat-label">{label}</span>
                        <div className="db-stat-bar">
                            <div
                                className="db-stat-bar-fill"
                                style={{
                                    width: total > 0 ? `${Math.round((value / total) * 100)}%` : "0%",
                                    background: color,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Recent Applications ── */}
            <div className="db-section">
                <div className="db-section-header">
                    <h2 className="db-section-title">📬 Recent Applications</h2>
                    {applications.length > 5 && (
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => navigate("/applications")}
                        >
                            View All →
                        </button>
                    )}
                </div>

                {applications.length === 0 ? (
                    <div className="db-empty">
                        <span className="db-empty-icon">📭</span>
                        <h3>No applications yet</h3>
                        <p>Start by browsing available internships and submitting your first application.</p>
                        <button
                            className="btn btn-primary"
                            style={{ marginTop: 16 }}
                            onClick={() => navigate("/internships")}
                        >
                            Browse Internships
                        </button>
                    </div>
                ) : (
                    <div className="db-table-card">
                        <table className="db-table">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Company</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Resume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((app, i) => (
                                    <tr key={app.id || i}>
                                        <td>
                                            <strong style={{ color: "var(--text-h)" }}>
                                                {app.internship}
                                            </strong>
                                        </td>
                                        <td style={{ color: "var(--text-muted)" }}>
                                            🏢 {app.company || "—"}
                                        </td>
                                        <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                                            {app.appliedAt || "—"}
                                        </td>
                                        <td>
                                            <span
                                                className={statusBadgeClass(app.status)}
                                                style={{ borderLeft: `3px solid ${statusDot(app.status)}`, paddingLeft: 8 }}
                                            >
                                                {app.status || "Pending"}
                                            </span>
                                        </td>
                                        <td>
                                            {app.resumeUrl || app.resume ? (
                                                <a
                                                    href={(() => {
                                                        const u = app.resumeUrl || app.resume;
                                                        return u.endsWith(".pdf") ? u : u + ".pdf";
                                                    })()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ textDecoration: "none" }}
                                                >
                                                    📄 View
                                                </a>
                                            ) : (
                                                <span style={{ color: "var(--text-muted)" }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;