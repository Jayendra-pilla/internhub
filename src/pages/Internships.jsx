import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API = "https://internhub-gbuo.onrender.com";
const CATEGORIES = ["All", "Frontend", "Backend", "Fullstack", "Design", "Data"];

/* ── Toast ─────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    return (
        <div className={`global-toast global-toast-${type}`}>
            <span>{icon}</span>
            {message}
        </div>
    );
}

function Internships({ applications, setApplications, getAuthHeader }) {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [detailInternship, setDetailInternship] = useState(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formError, setFormError] = useState("");
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => setToast({ message, type });

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${API}/internships`)
            .then((res) => { setInternships(res.data); setLoading(false); })
            .catch((err) => { console.error(err); setLoading(false); });
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return internships.filter((item) => {
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.company.toLowerCase().includes(q) ||
                item.location.toLowerCase().includes(q) ||
                (item.tags || []).some((t) => t.toLowerCase().includes(q));
            const matchesCategory = activeCategory === "All" || item.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [search, activeCategory, internships]);

    const openModal = (internship) => {
        setSelectedInternship(internship);
        setName(localStorage.getItem("userName") || "");
        setEmail(localStorage.getItem("userEmail") || "");
        setResumeFile(null);
        setUploading(false);
        setFormError("");
        setShowModal(true);
        setDetailInternship(null);
    };

    const closeModal = () => { setShowModal(false); setSelectedInternship(null); };

    const handleSubmit = async () => {
        if (!name.trim() || !resumeFile) {
            setFormError("Please fill in all fields and select a resume.");
            return;
        }
        try {
            setUploading(true);
            setFormError("");

            const formData = new FormData();
            formData.append("file", resumeFile);
            const uploadRes = await axios.post(`${API}/upload-resume`, formData, {
                headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" }
            });
            const resumeUrl = uploadRes.data.resumeUrl;

            const payload = {
                name: name.trim(),
                resumeUrl,
                internship: selectedInternship.title,
                company: selectedInternship.company,
            };
            const { data } = await axios.post(`${API}/apply`, payload, {
                headers: getAuthHeader(),
            });

            setApplications([...applications, data]);
            closeModal();
            showToast(`Applied to ${selectedInternship.title} at ${selectedInternship.company}!`, "success");
        } catch (err) {
            console.error("Submit failed:", err);
            if (err.response?.status === 401) {
                setFormError("You must be logged in to apply.");
            } else {
                setFormError(err.response?.data?.detail || "Failed to submit application. Please try again.");
            }
        } finally {
            setUploading(false);
        }
    };

    const alreadyApplied = (internship) =>
        applications.some((a) => a.internship === internship.title && a.company === internship.company);

    return (
        <div className="container">
            {/* Toast */}
            <div className="global-toast-container">
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>

            {/* Page Header */}
            <div className="page-header">
                <h1>Available Internships</h1>
                <p>Search and filter from {internships.length}+ curated opportunities</p>
            </div>

            {/* Search + Filters */}
            <div className="search-filter-bar">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        id="internship-search"
                        type="text"
                        className="search-input"
                        placeholder="Search by title, company, location or skill..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-pills">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            id={`filter-${cat.toLowerCase()}`}
                            className={`filter-pill${activeCategory === cat ? " active" : ""}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="intern-loading">
                    <div className="intern-loading-spinner" />
                    <p>Loading internships…</p>
                </div>
            ) : (
                <>
                    <p className="results-count">
                        Showing <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> internship{filtered.length !== 1 ? "s" : ""}
                    </p>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">🔎</span>
                            <h3>No internships found</h3>
                            <p>Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        <div className="cards-grid">
                            {filtered.map((internship) => {
                                const applied = alreadyApplied(internship);
                                return (
                                    <div className="card" key={internship.id} id={`internship-${internship.id}`}>
                                        <div className="card-header">
                                            <div>
                                                <div className="card-title">{internship.title}</div>
                                                <div className="card-company">🏢 {internship.company}</div>
                                            </div>
                                            <span className="badge badge-accent">{internship.category}</span>
                                        </div>

                                        <div className="card-tags">
                                            {(internship.tags || []).map((tag) => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                        </div>

                                        <div className="card-meta">
                                            <span className="internship-location">📍 {internship.location}</span>
                                            <span className="internship-duration">🗓 {internship.duration}</span>
                                        </div>

                                        {/* Description preview */}
                                        {internship.description && (
                                            <p style={{
                                                fontSize: "0.82rem",
                                                color: "var(--text-muted)",
                                                margin: "10px 0 0",
                                                lineHeight: 1.55,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}>
                                                {internship.description}
                                            </p>
                                        )}

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", gap: 8 }}>
                                            <span className="internship-stipend">{internship.stipend}</span>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => setDetailInternship(internship)}
                                                    id={`detail-btn-${internship.id}`}
                                                >
                                                    Details
                                                </button>
                                                <button
                                                    id={`apply-btn-${internship.id}`}
                                                    className={`btn btn-sm ${applied ? "btn-ghost" : "btn-primary"}`}
                                                    onClick={() => !applied && openModal(internship)}
                                                    disabled={applied}
                                                    style={{ opacity: applied ? 0.6 : 1 }}
                                                >
                                                    {applied ? "✓ Applied" : "Apply Now"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* ── Detail Modal ── */}
            {detailInternship && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetailInternship(null)}>
                    <div className="modal" id="detail-modal" style={{ maxWidth: 560 }}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">{detailInternship.title}</div>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
                                    🏢 {detailInternship.company} &nbsp;·&nbsp; 📍 {detailInternship.location}
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setDetailInternship(null)}>✕</button>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
                            <span className="badge badge-accent">{detailInternship.category}</span>
                            <span style={{ color: "var(--success)", fontWeight: 700 }}>{detailInternship.stipend}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>🗓 {detailInternship.duration}</span>
                        </div>

                        <div className="card-tags" style={{ marginBottom: 18 }}>
                            {(detailInternship.tags || []).map((tag) => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>

                        {detailInternship.description && (
                            <div style={{ marginBottom: 16 }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>About the Role</p>
                                <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.65 }}>{detailInternship.description}</p>
                            </div>
                        )}

                        {detailInternship.requirements && (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Requirements</p>
                                <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.65 }}>{detailInternship.requirements}</p>
                            </div>
                        )}

                        <div className="form-actions">
                            <button className="btn btn-ghost" onClick={() => setDetailInternship(null)}>Close</button>
                            {!alreadyApplied(detailInternship) ? (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => openModal(detailInternship)}
                                    id={`detail-apply-btn-${detailInternship.id}`}
                                >
                                    Apply Now →
                                </button>
                            ) : (
                                <span className="badge badge-success">✓ Already Applied</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Apply Modal ── */}
            {showModal && selectedInternship && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="modal" id="apply-modal">
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Apply for {selectedInternship.title}</div>
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                    {selectedInternship.company} · {selectedInternship.location}
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeModal} id="modal-close-btn">✕</button>
                        </div>

                        {formError && (
                            <div style={{
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: "8px",
                                padding: "10px 14px",
                                marginBottom: "16px",
                                fontSize: "0.85rem",
                                color: "#f87171"
                            }}>
                                ⚠️ {formError}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="apply-name">Full Name</label>
                            <input
                                id="apply-name"
                                className="form-input"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setFormError(""); }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="apply-email">
                                Email Address{" "}
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>(from your account)</span>
                            </label>
                            <input
                                id="apply-email"
                                className="form-input"
                                type="email"
                                value={email}
                                readOnly
                                style={{ opacity: 0.7, cursor: "not-allowed" }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="apply-resume">Upload Resume (PDF only)</label>
                            <input
                                id="apply-resume"
                                className="form-input"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) { setResumeFile(null); return; }
                                    if (file.type !== "application/pdf") {
                                        setFormError("Only PDF files are allowed.");
                                        setResumeFile(null); e.target.value = ""; return;
                                    }
                                    if (file.size > 5 * 1024 * 1024) {
                                        setFormError("Resume file must be less than 5 MB.");
                                        setResumeFile(null); e.target.value = ""; return;
                                    }
                                    setResumeFile(file);
                                    setFormError("");
                                }}
                            />
                            {resumeFile && (
                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                                    Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <button className="btn btn-ghost" onClick={closeModal} id="modal-cancel-btn" disabled={uploading}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit} id="modal-submit-btn" disabled={uploading}>
                                {uploading ? "Uploading…" : "Submit Application"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Internships;