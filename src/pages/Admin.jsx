import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://internhub-gbuo.onrender.com";
const STATUS_OPTIONS = ["Pending", "Under Review", "Accepted", "Rejected"];
const CATEGORIES = ["Frontend", "Backend", "Fullstack", "Design", "Data"];

const statusBadgeClass = (status) => {
    if (status === "Accepted") return "badge badge-success";
    if (status === "Under Review") return "badge badge-warning";
    if (status === "Rejected") return "badge badge-danger";
    return "badge badge-neutral";
};

const statusDot = (status) => {
    if (status === "Accepted") return "#22c55e";
    if (status === "Under Review") return "#f59e0b";
    if (status === "Rejected") return "#ef4444";
    return "#94a3b8";
};

const SIDEBAR_ITEMS = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "internships", icon: "💼", label: "Internships" },
    { key: "applications", icon: "📋", label: "Applications" },
    { key: "users", icon: "👥", label: "Users" },
    { key: "analytics", icon: "📈", label: "Analytics" },
];

const EMPTY_FORM = { title: "", company: "", location: "", stipend: "", duration: "", category: "Frontend", description: "", requirements: "", tagInput: "", tags: [] };

function Admin() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [users, setUsers] = useState([]);
    const [applications, setApplications] = useState([]);
    const [internships, setInternships] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [seeding, setSeeding] = useState(false);
    const [appSearch, setAppSearch] = useState("");
    const [appFilter, setAppFilter] = useState("All");

    // Confirm delete state
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteType, setConfirmDeleteType] = useState(null);

    // Internship form modal state
    const [showInternForm, setShowInternForm] = useState(false);
    const [editingInternship, setEditingInternship] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState("");
    const [formLoading, setFormLoading] = useState(false);

    const token = localStorage.getItem("token");
    const adminName = localStorage.getItem("userName") || "Admin";
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!token || localStorage.getItem("role") !== "admin") {
            navigate("/login");
            return;
        }
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        setError("");
        try {
            const [usersRes, appsRes, internsRes, analyticsRes] = await Promise.all([
                axios.get(`${API}/admin/users`, { headers }),
                axios.get(`${API}/admin/applications`, { headers }),
                axios.get(`${API}/admin/internships`, { headers }),
                axios.get(`${API}/admin/analytics`, { headers }),
            ]);
            setUsers(usersRes.data);
            setApplications(appsRes.data);
            setInternships(internsRes.data);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setError(err.response?.data?.detail || "Failed to load admin data.");
        } finally {
            setLoading(false);
        }
    };

    // ── Status update ─────────────────────────────────────────────
    const updateStatus = async (appId, newStatus) => {
        try {
            const { data } = await axios.patch(
                `${API}/admin/applications/${appId}/status`,
                { status: newStatus },
                { headers }
            );
            setApplications(applications.map((a) => (a.id === appId ? data : a)));
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to update status.");
        }
    };

    // ── Delete application ────────────────────────────────────────
    const deleteApplication = async (appId) => {
        try {
            await axios.delete(`${API}/admin/applications/${appId}`, { headers });
            setApplications(applications.filter((a) => a.id !== appId));
            setConfirmDeleteId(null); setConfirmDeleteType(null);
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to delete application.");
        }
    };

    // ── Delete user ───────────────────────────────────────────────
    const deleteUser = async (userId) => {
        try {
            await axios.delete(`${API}/admin/users/${userId}`, { headers });
            setUsers(users.filter((u) => u.id !== userId));
            setConfirmDeleteId(null); setConfirmDeleteType(null);
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to delete user.");
        }
    };

    // ── Delete internship ─────────────────────────────────────────
    const deleteInternship = async (id) => {
        try {
            await axios.delete(`${API}/admin/internships/${id}`, { headers });
            setInternships(internships.filter((i) => i.id !== id));
            setConfirmDeleteId(null); setConfirmDeleteType(null);
        } catch (err) {
            alert(err.response?.data?.detail || "Failed to delete internship.");
        }
    };

    // ── Open internship form ──────────────────────────────────────
    const openCreateForm = () => {
        setEditingInternship(null);
        setForm(EMPTY_FORM);
        setFormError("");
        setShowInternForm(true);
    };

    const openEditForm = (intern) => {
        setEditingInternship(intern);
        setForm({
            title: intern.title || "",
            company: intern.company || "",
            location: intern.location || "",
            stipend: intern.stipend || "",
            duration: intern.duration || "",
            category: intern.category || "Frontend",
            description: intern.description || "",
            requirements: intern.requirements || "",
            tagInput: "",
            tags: intern.tags || [],
        });
        setFormError("");
        setShowInternForm(true);
    };

    const closeForm = () => {
        setShowInternForm(false);
        setEditingInternship(null);
        setFormError("");
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setFormError("");
    };

    const addTag = () => {
        const tag = form.tagInput.trim();
        if (tag && !form.tags.includes(tag)) {
            setForm((prev) => ({ ...prev, tags: [...prev.tags, tag], tagInput: "" }));
        }
    };

    const removeTag = (tag) => {
        setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
    };

    const submitInternship = async () => {
        if (!form.title.trim() || !form.company.trim() || !form.location.trim() || !form.stipend.trim() || !form.duration.trim()) {
            setFormError("Please fill in all required fields.");
            return;
        }
        setFormLoading(true);
        const payload = {
            title: form.title.trim(),
            company: form.company.trim(),
            location: form.location.trim(),
            stipend: form.stipend.trim(),
            duration: form.duration.trim(),
            category: form.category,
            description: form.description.trim(),
            requirements: form.requirements.trim(),
            tags: form.tags,
        };
        try {
            if (editingInternship) {
                const { data } = await axios.put(`${API}/admin/internships/${editingInternship.id}`, payload, { headers });
                setInternships(internships.map((i) => (i.id === editingInternship.id ? data : i)));
            } else {
                const { data } = await axios.post(`${API}/admin/internships`, payload, { headers });
                setInternships([...internships, data]);
            }
            closeForm();
        } catch (err) {
            setFormError(err.response?.data?.detail || "Failed to save internship.");
        } finally {
            setFormLoading(false);
        }
    };

    // ── Seed internships ──────────────────────────────────────────
    const seedInternships = async () => {
        setSeeding(true);
        try {
            const { data } = await axios.post(`${API}/admin/seed-internships`, {}, { headers });
            alert(`✅ ${data.message}`);
            const res = await axios.get(`${API}/admin/internships`, { headers });
            setInternships(res.data);
        } catch (err) {
            alert(err.response?.data?.detail || "Seed failed.");
        } finally {
            setSeeding(false);
        }
    };

    // ── Computed stats ────────────────────────────────────────────
    const totalUsers = users.length;
    const totalApps = applications.length;
    const totalInternships = internships.length;
    const pending = applications.filter((a) => a.status === "Pending" || !a.status).length;
    const underReview = applications.filter((a) => a.status === "Under Review").length;
    const accepted = applications.filter((a) => a.status === "Accepted").length;
    const rejected = applications.filter((a) => a.status === "Rejected").length;

    // ── Filtered applications ─────────────────────────────────────
    const filteredApps = applications.filter((app) => {
        const matchesSearch = !appSearch ||
            (app.name || "").toLowerCase().includes(appSearch.toLowerCase()) ||
            (app.email || "").toLowerCase().includes(appSearch.toLowerCase()) ||
            (app.internship || "").toLowerCase().includes(appSearch.toLowerCase());
        const matchesFilter = appFilter === "All" || (app.status || "Pending") === appFilter;
        return matchesSearch && matchesFilter;
    });

    // ── Greeting ──────────────────────────────────────────────────
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    // ── User initials helper ──────────────────────────────────────
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <div className="adm-sidebar-brand">
                        <div className="brand-icon" style={{ width: 32, height: 32, fontSize: "0.9rem", borderRadius: 9 }}>🎓</div>
                        <span className="adm-sidebar-title">InternHub</span>
                    </div>
                    {SIDEBAR_ITEMS.map((item) => (
                        <button key={item.key} className={`sidebar-btn${activeTab === item.key ? " active" : ""}`}>
                            <span className="sidebar-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </aside>
                <main className="admin-content">
                    <div className="adm-loading">
                        <div className="adm-loading-spinner" />
                        <p>Loading admin data…</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-layout">

            {/* ── Sidebar ────────────────────────────────────────── */}
            <aside className="admin-sidebar">
                <div className="adm-sidebar-brand">
                    <div className="brand-icon" style={{ width: 32, height: 32, fontSize: "0.9rem", borderRadius: 9 }}>🎓</div>
                    <span className="adm-sidebar-title">InternHub</span>
                </div>
                <div className="sidebar-label">Navigation</div>
                {SIDEBAR_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        id={`sidebar-${item.key}`}
                        className={`sidebar-btn${activeTab === item.key ? " active" : ""}`}
                        onClick={() => setActiveTab(item.key)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
                <div className="adm-sidebar-footer">
                    <div className="adm-sidebar-avatar">{getInitials(adminName)}</div>
                    <div className="adm-sidebar-user">
                        <div className="adm-sidebar-name">{adminName}</div>
                        <div className="adm-sidebar-role">Administrator</div>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ───────────────────────────────────── */}
            <main className="admin-content">
                {error && (
                    <div className="auth-error" style={{ maxWidth: 600, marginBottom: 24 }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* ══════════════════════════════════════════════════
                    DASHBOARD TAB
                ═════════════════════════════════════════════════ */}
                {activeTab === "dashboard" && (
                    <>
                        {/* Welcome Header */}
                        <div className="adm-welcome">
                            <div className="adm-welcome-text">
                                <h1 className="adm-welcome-title">{greeting}, {adminName.split(" ")[0]} 👋</h1>
                                <p className="adm-welcome-sub">Here's what's happening with your platform today.</p>
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={fetchAll} id="refresh-btn">
                                🔄 Refresh
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="adm-stats-grid">
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#6366f1" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">👥</span>
                                    <span className="adm-stat-trend adm-stat-trend-up">Active</span>
                                </div>
                                <div className="adm-stat-value">{totalUsers}</div>
                                <div className="adm-stat-label">Total Users</div>
                            </div>
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#3b82f6" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">💼</span>
                                    <span className="adm-stat-trend adm-stat-trend-up">Live</span>
                                </div>
                                <div className="adm-stat-value">{totalInternships}</div>
                                <div className="adm-stat-label">Internships</div>
                            </div>
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#8b5cf6" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">📋</span>
                                </div>
                                <div className="adm-stat-value">{totalApps}</div>
                                <div className="adm-stat-label">Applications</div>
                            </div>
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#22c55e" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">✅</span>
                                    <span className="adm-stat-trend adm-stat-trend-up">{totalApps ? Math.round((accepted / totalApps) * 100) : 0}%</span>
                                </div>
                                <div className="adm-stat-value">{accepted}</div>
                                <div className="adm-stat-label">Accepted</div>
                            </div>
                        </div>

                        {/* Quick Overview Cards */}
                        <div className="adm-overview-row">
                            <div className="adm-overview-card adm-overview-card-wide">
                                <div className="adm-card-head">
                                    <h3>📋 Recent Applications</h3>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("applications")}>View All →</button>
                                </div>
                                {applications.length === 0 ? (
                                    <div className="adm-empty-mini">
                                        <p>No applications yet.</p>
                                    </div>
                                ) : (
                                    <div className="adm-activity-list">
                                        {[...applications].reverse().slice(0, 5).map((app) => (
                                            <div className="adm-activity-item" key={app.id}>
                                                <div className="adm-activity-avatar" style={{ background: `linear-gradient(135deg, ${statusDot(app.status)}, ${statusDot(app.status)}88)` }}>
                                                    {getInitials(app.name)}
                                                </div>
                                                <div className="adm-activity-info">
                                                    <div className="adm-activity-name">{app.name}</div>
                                                    <div className="adm-activity-detail">Applied to <strong>{app.internship}</strong> at {app.company}</div>
                                                </div>
                                                <span className={statusBadgeClass(app.status)}>{app.status || "Pending"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="adm-overview-card">
                                <div className="adm-card-head">
                                    <h3>📊 Status Breakdown</h3>
                                </div>
                                <div className="adm-donut-stats">
                                    {[
                                        { label: "Pending", count: pending, color: "#f59e0b" },
                                        { label: "Under Review", count: underReview, color: "#3b82f6" },
                                        { label: "Accepted", count: accepted, color: "#22c55e" },
                                        { label: "Rejected", count: rejected, color: "#ef4444" },
                                    ].map(({ label, count, color }) => (
                                        <div className="adm-donut-row" key={label}>
                                            <span className="adm-donut-dot" style={{ background: color }} />
                                            <span className="adm-donut-label">{label}</span>
                                            <span className="adm-donut-count">{count}</span>
                                            <div className="adm-donut-bar-track">
                                                <div className="adm-donut-bar-fill" style={{
                                                    width: `${totalApps ? Math.round((count / totalApps) * 100) : 0}%`,
                                                    background: color
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ══════════════════════════════════════════════════
                    MANAGE INTERNSHIPS TAB
                ═════════════════════════════════════════════════ */}
                {activeTab === "internships" && (
                    <>
                        <div className="adm-page-header">
                            <div>
                                <h2>💼 Manage Internships</h2>
                                <p>{totalInternships} internship{totalInternships !== 1 ? "s" : ""} total</p>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                {totalInternships === 0 && (
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={seedInternships}
                                        disabled={seeding}
                                        id="seed-btn"
                                    >
                                        {seeding ? "Seeding…" : "🌱 Seed Default Data"}
                                    </button>
                                )}
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={openCreateForm}
                                    id="add-internship-btn"
                                >
                                    + Add Internship
                                </button>
                            </div>
                        </div>

                        {internships.length === 0 ? (
                            <div className="adm-empty-state">
                                <span className="adm-empty-icon">💼</span>
                                <h3>No internships yet</h3>
                                <p>Add your first internship or seed the default dataset.</p>
                            </div>
                        ) : (
                            <div className="adm-table-card">
                                <table className="adm-table" id="admin-internships-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Company</th>
                                            <th>Category</th>
                                            <th>Location</th>
                                            <th>Stipend</th>
                                            <th>Duration</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {internships.map((intern) => (
                                            <tr key={intern.id} id={`intern-row-${intern.id}`}>
                                                <td><strong>{intern.title}</strong></td>
                                                <td style={{ color: "var(--text-muted)" }}>{intern.company}</td>
                                                <td><span className="badge badge-accent">{intern.category}</span></td>
                                                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{intern.location}</td>
                                                <td style={{ color: "var(--success)", fontWeight: 600 }}>{intern.stipend}</td>
                                                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{intern.duration}</td>
                                                <td>
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => openEditForm(intern)}
                                                            id={`edit-intern-${intern.id}`}
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        {confirmDeleteId === intern.id && confirmDeleteType === "intern" ? (
                                                            <div style={{ display: "flex", gap: 6 }}>
                                                                <button className="btn btn-danger btn-sm" onClick={() => deleteInternship(intern.id)} id={`confirm-del-intern-${intern.id}`}>Confirm</button>
                                                                <button className="btn btn-ghost btn-sm" onClick={() => { setConfirmDeleteId(null); setConfirmDeleteType(null); }}>Cancel</button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => { setConfirmDeleteId(intern.id); setConfirmDeleteType("intern"); }}
                                                                id={`del-intern-${intern.id}`}
                                                            >
                                                                🗑
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════════
                    APPLICATIONS TAB
                ═════════════════════════════════════════════════ */}
                {activeTab === "applications" && (
                    <>
                        <div className="adm-page-header">
                            <div>
                                <h2>📋 Applications</h2>
                                <p>{totalApps} application{totalApps !== 1 ? "s" : ""} total</p>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="adm-filter-bar">
                            <div className="adm-search-wrap">
                                <span className="adm-search-icon">🔍</span>
                                <input
                                    className="adm-search-input"
                                    type="text"
                                    placeholder="Search by name, email or internship…"
                                    value={appSearch}
                                    onChange={(e) => setAppSearch(e.target.value)}
                                    id="app-search"
                                />
                            </div>
                            <div className="adm-filter-pills">
                                {["All", ...STATUS_OPTIONS].map((s) => (
                                    <button
                                        key={s}
                                        className={`adm-filter-pill${appFilter === s ? " active" : ""}`}
                                        onClick={() => setAppFilter(s)}
                                    >
                                        {s} {s !== "All" && <span className="adm-pill-count">
                                            {applications.filter((a) => s === "Pending" ? (!a.status || a.status === "Pending") : a.status === s).length}
                                        </span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredApps.length === 0 ? (
                            <div className="adm-empty-state">
                                <span className="adm-empty-icon">📋</span>
                                <h3>{appSearch || appFilter !== "All" ? "No matching applications" : "No applications"}</h3>
                                <p>{appSearch || appFilter !== "All" ? "Try adjusting your search or filter." : "No one has applied yet."}</p>
                            </div>
                        ) : (
                            <div className="adm-table-card">
                                <table className="adm-table" id="admin-applications-table">
                                    <thead>
                                        <tr>
                                            <th>Applicant</th>
                                            <th>Internship</th>
                                            <th>Date</th>
                                            <th>Resume</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredApps.map((app) => (
                                            <tr key={app.id} id={`admin-app-row-${app.id}`}>
                                                <td>
                                                    <div className="adm-user-cell">
                                                        <div className="adm-user-avatar">{getInitials(app.name)}</div>
                                                        <div>
                                                            <strong>{app.name}</strong>
                                                            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{app.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <strong>{app.internship}</strong>
                                                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{app.company}</div>
                                                </td>
                                                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{app.appliedAt || "—"}</td>
                                                <td>
                                                    {app.resumeUrl || app.resume ? (
                                                        <a
                                                            href={(() => { const u = app.resumeUrl || app.resume; return u.endsWith('.pdf') ? u : u + '.pdf'; })()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-ghost btn-sm"
                                                            style={{ textDecoration: "none" }}
                                                        >
                                                            📄 View
                                                        </a>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </td>
                                                <td>
                                                    <select
                                                        className="adm-status-select"
                                                        value={app.status || "Pending"}
                                                        onChange={(e) => updateStatus(app.id, e.target.value)}
                                                        id={`admin-status-${app.id}`}
                                                        style={{ borderColor: statusDot(app.status || "Pending") + "55" }}
                                                    >
                                                        {STATUS_OPTIONS.map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td>
                                                    {confirmDeleteId === app.id && confirmDeleteType === "app" ? (
                                                        <div style={{ display: "flex", gap: 6 }}>
                                                            <button className="btn btn-danger btn-sm" onClick={() => deleteApplication(app.id)} id={`confirm-del-app-${app.id}`}>Confirm</button>
                                                            <button className="btn btn-ghost btn-sm" onClick={() => { setConfirmDeleteId(null); setConfirmDeleteType(null); }}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => { setConfirmDeleteId(app.id); setConfirmDeleteType("app"); }}
                                                            id={`del-app-${app.id}`}
                                                        >
                                                            🗑
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════════
                    USERS TAB
                ═════════════════════════════════════════════════ */}
                {activeTab === "users" && (
                    <>
                        <div className="adm-page-header">
                            <div>
                                <h2>👥 Users</h2>
                                <p>{users.filter(u => u.role !== "admin").length} registered user{users.filter(u => u.role !== "admin").length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>

                        {users.filter(u => u.role !== "admin").length === 0 ? (
                            <div className="adm-empty-state">
                                <span className="adm-empty-icon">👥</span>
                                <h3>No users</h3>
                                <p>No one has registered yet.</p>
                            </div>
                        ) : (
                            <div className="adm-table-card">
                                <table className="adm-table" id="admin-users-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter(u => u.role !== "admin").map((user) => (
                                            <tr key={user.id} id={`admin-user-row-${user.id}`}>
                                                <td>
                                                    <div className="adm-user-cell">
                                                        <div className="adm-user-avatar" style={{
                                                            background: user.role === "admin"
                                                                ? "linear-gradient(135deg, var(--accent), var(--accent-dark))"
                                                                : "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                                                        }}>
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <strong>{user.name}</strong>
                                                    </div>
                                                </td>
                                                <td style={{ color: "var(--text-muted)" }}>{user.email}</td>
                                                <td>
                                                    <span className={user.role === "admin" ? "badge badge-accent" : "badge badge-neutral"}>
                                                        {user.role === "admin" ? "🛡️ Admin" : "👤 User"}
                                                    </span>
                                                </td>
                                                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{user.createdAt || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* ══════════════════════════════════════════════════
                    ANALYTICS TAB
                ═════════════════════════════════════════════════ */}
                {activeTab === "analytics" && (
                    <>
                        <div className="adm-page-header">
                            <div>
                                <h2>📈 Analytics</h2>
                                <p>System-wide insights</p>
                            </div>
                        </div>

                        <div className="adm-stats-grid">
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#6366f1" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">👥</span>
                                </div>
                                <div className="adm-stat-value">{analytics?.total_users ?? totalUsers}</div>
                                <div className="adm-stat-label">Total Users</div>
                            </div>
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#3b82f6" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">💼</span>
                                </div>
                                <div className="adm-stat-value">{analytics?.total_internships ?? totalInternships}</div>
                                <div className="adm-stat-label">Internships</div>
                            </div>
                            <div className="adm-stat-card" style={{ "--adm-stat-accent": "#8b5cf6" }}>
                                <div className="adm-stat-header">
                                    <span className="adm-stat-icon">📋</span>
                                </div>
                                <div className="adm-stat-value">{analytics?.total_applications ?? totalApps}</div>
                                <div className="adm-stat-label">Applications</div>
                            </div>
                        </div>

                        <div className="adm-analytics-grid">
                            {/* Application Status Breakdown */}
                            <div className="adm-analytics-card">
                                <h3 className="adm-analytics-title">Application Status</h3>
                                {[
                                    { label: "Pending", count: analytics?.pending ?? pending, color: "#f59e0b" },
                                    { label: "Under Review", count: analytics?.under_review ?? underReview, color: "#3b82f6" },
                                    { label: "Accepted", count: analytics?.accepted ?? accepted, color: "#22c55e" },
                                    { label: "Rejected", count: analytics?.rejected ?? rejected, color: "#ef4444" },
                                ].map(({ label, count, color }) => {
                                    const total = analytics?.total_applications || totalApps || 1;
                                    const pct = Math.round((count / total) * 100);
                                    return (
                                        <div className="adm-bar-row" key={label}>
                                            <div className="adm-bar-label">{label}</div>
                                            <div className="adm-bar-track">
                                                <div className="adm-bar-fill" style={{ width: `${pct}%`, background: color }} />
                                            </div>
                                            <div className="adm-bar-count">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Top Companies by Applications */}
                            <div className="adm-analytics-card">
                                <h3 className="adm-analytics-title">Top Companies</h3>
                                {analytics?.top_companies?.length > 0 ? (
                                    analytics.top_companies.map(({ company, count }, idx) => {
                                        const maxCount = analytics.top_companies[0]?.count || 1;
                                        const pct = Math.round((count / maxCount) * 100);
                                        const colors = ["#6366f1", "#8b5cf6", "#3b82f6", "#06b6d4", "#10b981"];
                                        return (
                                            <div className="adm-bar-row" key={company}>
                                                <div className="adm-bar-label" title={company}>
                                                    {company?.length > 12 ? company.slice(0, 12) + "…" : company}
                                                </div>
                                                <div className="adm-bar-track">
                                                    <div className="adm-bar-fill" style={{ width: `${pct}%`, background: colors[idx % colors.length] }} />
                                                </div>
                                                <div className="adm-bar-count">{count}</div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No application data yet.</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* ── Internship Create/Edit Modal ───────────────────── */}
            {showInternForm && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeForm()}>
                    <div className="modal" id="intern-form-modal" style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <div className="modal-title">
                                {editingInternship ? "✏️ Edit Internship" : "➕ Add Internship"}
                            </div>
                            <button className="modal-close" onClick={closeForm} id="intern-modal-close">✕</button>
                        </div>

                        {formError && (
                            <div className="auth-error" style={{ marginBottom: 16 }}>⚠️ {formError}</div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input className="form-input" type="text" placeholder="Frontend Developer Intern" value={form.title} onChange={(e) => handleFormChange("title", e.target.value)} id="intern-title" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company *</label>
                                <input className="form-input" type="text" placeholder="Google" value={form.company} onChange={(e) => handleFormChange("company", e.target.value)} id="intern-company" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location *</label>
                                <input className="form-input" type="text" placeholder="Bengaluru (Remote)" value={form.location} onChange={(e) => handleFormChange("location", e.target.value)} id="intern-location" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stipend *</label>
                                <input className="form-input" type="text" placeholder="₹30,000/mo" value={form.stipend} onChange={(e) => handleFormChange("stipend", e.target.value)} id="intern-stipend" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Duration *</label>
                                <input className="form-input" type="text" placeholder="3 Months" value={form.duration} onChange={(e) => handleFormChange("duration", e.target.value)} id="intern-duration" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select className="admin-status-select" style={{ width: "100%", padding: "11px 14px" }} value={form.category} onChange={(e) => handleFormChange("category", e.target.value)} id="intern-category">
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-textarea" placeholder="Describe the role…" value={form.description} onChange={(e) => handleFormChange("description", e.target.value)} id="intern-description" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Requirements</label>
                            <textarea className="form-textarea" placeholder="List required skills…" value={form.requirements} onChange={(e) => handleFormChange("requirements", e.target.value)} id="intern-requirements" />
                        </div>

                        {/* Tags */}
                        <div className="form-group">
                            <label className="form-label">Skills / Tags</label>
                            <div style={{ display: "flex", gap: 8 }}>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="e.g. React"
                                    value={form.tagInput}
                                    onChange={(e) => handleFormChange("tagInput", e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                                    id="intern-tag-input"
                                />
                                <button type="button" className="btn btn-ghost btn-sm" onClick={addTag} id="add-tag-btn">Add</button>
                            </div>
                            {form.tags.length > 0 && (
                                <div className="tag-display">
                                    {form.tags.map((tag) => (
                                        <button key={tag} className="tag-remove" onClick={() => removeTag(tag)}>{tag} ✕</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-ghost" onClick={closeForm} id="intern-cancel-btn">Cancel</button>
                            <button className="btn btn-primary" onClick={submitInternship} disabled={formLoading} id="intern-submit-btn">
                                {formLoading ? <span className="auth-spinner" /> : null}
                                {formLoading ? "Saving…" : editingInternship ? "Save Changes" : "Create Internship"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
