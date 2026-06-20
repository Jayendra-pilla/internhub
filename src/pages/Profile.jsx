import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://internhub-gbuo.onrender.com";

/* ── Helpers ─────────────────────────────────────────────────────── */
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ── Stat Card ───────────────────────────────────────────────────── */
function ProfileStatCard({ icon, label, value, color }) {
  return (
    <div className="profile-stat-card" style={{ "--stat-color": color }}>
      <span className="profile-stat-icon">{icon}</span>
      <span className="profile-stat-value">{value ?? 0}</span>
      <span className="profile-stat-label">{label}</span>
    </div>
  );
}

/* ── Skill Badge ─────────────────────────────────────────────────── */
function SkillBadge({ skill, onRemove, editable }) {
  return (
    <span className="skill-badge">
      {skill}
      {editable && (
        <button
          className="skill-remove-btn"
          onClick={() => onRemove(skill)}
          title={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

/* ── Section Wrapper ─────────────────────────────────────────────── */
function ProfileSection({ icon, title, children, action }) {
  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-title">
          <span className="profile-section-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
        {action}
      </div>
      <div className="profile-section-body">{children}</div>
    </div>
  );
}

/* ── Toast ───────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`profile-toast profile-toast-${type}`}>
      <span>{type === "success" ? "✅" : "❌"}</span>
      {message}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────────────── */
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Edit personal/academic info
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Skills
  const [skillInput, setSkillInput] = useState("");

  /* ── Load Profile ──────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/profile`, { headers: authHeader() });
      setProfile(res.data);
      setEditForm({
        name: res.data.name || "",
        college: res.data.college || "",
        branch: res.data.branch || "",
        cgpa: res.data.cgpa || "",
        skills: res.data.skills || [],
      });
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else showToast("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Toast ─────────────────────────────────────────────────────── */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  /* ── Save Profile ──────────────────────────────────────────────── */
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        `${API}/profile`,
        {
          name: editForm.name,
          college: editForm.college,
          branch: editForm.branch,
          cgpa: editForm.cgpa,
          skills: editForm.skills,
        },
        { headers: authHeader() }
      );
      setProfile((prev) => ({ ...prev, ...res.data }));
      setEditMode(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ── Skills Management ─────────────────────────────────────────── */
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (editForm.skills.includes(s)) {
      showToast("Skill already added.", "error");
      return;
    }
    setEditForm((prev) => ({ ...prev, skills: [...prev.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  /* ── Render Loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner" />
        <p>Loading your profile…</p>
      </div>
    );
  }

  if (!profile) return null;

  const stats = profile.stats || {};

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <div className="container profile-container">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />

        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {getInitials(profile.name)}
          </div>
          <span
            className={`profile-role-badge ${profile.role === "admin" ? "badge-danger" : "badge-accent"
              }`}
          >
            {profile.role === "admin" ? "🛡️ Admin" : "👤 User"}
          </span>
        </div>

        <div className="profile-hero-info">
          <h1 className="profile-hero-name">{profile.name}</h1>
          <p className="profile-hero-email">📧 {profile.email}</p>
          {profile.college && profile.role !== "admin" && (
            <p className="profile-hero-college">🎓 {profile.college}</p>
          )}
          <p className="profile-hero-joined">
            Member since {profile.createdAt || "—"}
          </p>
        </div>

        <button
          className="btn btn-primary profile-edit-btn"
          onClick={() => {
            setEditMode(true);
            setEditForm({
              name: profile.name || "",
              college: profile.college || "",
              branch: profile.branch || "",
              cgpa: profile.cgpa || "",
              skills: profile.skills || [],
            });
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* ── Application Stats ────────────────────────────────────── */}
      {profile.role !== "admin" && (
        <div className="profile-stats-grid">
          <ProfileStatCard
            icon="📋"
            label="Total"
            value={stats.total}
            color="var(--accent)"
          />
          <ProfileStatCard
            icon="🟡"
            label="Pending"
            value={stats.pending}
            color="var(--warning)"
          />
          <ProfileStatCard
            icon="🔵"
            label="Under Review"
            value={stats.under_review}
            color="#38bdf8"
          />
          <ProfileStatCard
            icon="🟢"
            label="Accepted"
            value={stats.accepted}
            color="var(--success)"
          />
          <ProfileStatCard
            icon="🔴"
            label="Rejected"
            value={stats.rejected}
            color="var(--danger)"
          />
        </div>
      )}

      {/* ── Two Column Layout ─────────────────────────────────────── */}
      <div className="profile-grid">

        {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
        <div className="profile-col">

          {/* Personal Information */}
          <ProfileSection icon="👤" title="Personal Information">
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span className="profile-info-label">Full Name</span>
                <span className="profile-info-value">{profile.name || "—"}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email Address</span>
                <span className="profile-info-value">{profile.email || "—"}</span>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Role</span>
                <span className="profile-info-value">
                  <span
                    className={`badge ${profile.role === "admin" ? "badge-danger" : "badge-accent"
                      }`}
                  >
                    {profile.role}
                  </span>
                </span>
              </div>
            </div>
          </ProfileSection>

          {/* Academic Information */}
          {profile.role !== "admin" && (
            <ProfileSection icon="🎓" title="Academic Information">
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="profile-info-label">College / University</span>
                  <span className="profile-info-value">{profile.college || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Branch / Department</span>
                  <span className="profile-info-value">{profile.branch || "—"}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">CGPA</span>
                  <span className="profile-info-value">
                    {profile.cgpa ? (
                      <span className="profile-cgpa">{profile.cgpa}</span>
                    ) : "—"}
                  </span>
                </div>
              </div>
            </ProfileSection>
          )}

        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────── */}
        {profile.role !== "admin" && (
          <div className="profile-col">
            {/* Skills */}
            <ProfileSection icon="🛠️" title="Skills">
              {profile.skills && profile.skills.length > 0 ? (
                <div className="skill-tags">
                  {profile.skills.map((s) => (
                    <SkillBadge key={s} skill={s} editable={false} />
                  ))}
                </div>
              ) : (
                <p className="profile-empty-hint">
                  No skills added yet. Click Edit Profile to add your skills.
                </p>
              )}
            </ProfileSection>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          EDIT PROFILE MODAL
      ══════════════════════════════════════════════════════════════ */}
      {editMode && (
        <div className="modal-overlay" onClick={() => setEditMode(false)}>
          <div
            className="modal profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">✏️ Edit Profile</span>
              <button className="modal-close" onClick={() => setEditMode(false)}>
                ×
              </button>
            </div>

            {/* ── Personal ─────────────────────────────────────── */}
            <p className="profile-modal-section-label">Personal Information</p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your full name"
              />
            </div>

            {/* ── Academic & Skills (Hidden for Admin) ───────── */}
            {profile.role !== "admin" && (
              <>
                <p className="profile-modal-section-label" style={{ marginTop: 20 }}>
                  Academic Information
                </p>

                <div className="form-group">
                  <label className="form-label">College / University</label>
                  <input
                    className="form-input"
                    value={editForm.college}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, college: e.target.value }))
                    }
                    placeholder="e.g. IIT Bombay"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Branch / Department</label>
                  <input
                    className="form-input"
                    value={editForm.branch}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, branch: e.target.value }))
                    }
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CGPA</label>
                  <input
                    className="form-input"
                    value={editForm.cgpa}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, cgpa: e.target.value }))
                    }
                    placeholder="e.g. 8.5"
                  />
                </div>

                <p className="profile-modal-section-label" style={{ marginTop: 20 }}>
                  Skills
                </p>

                <div className="profile-skill-input-row">
                  <input
                    className="form-input"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="e.g. React, Python…"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={addSkill}
                  >
                    + Add
                  </button>
                </div>

                {editForm.skills.length > 0 && (
                  <div className="skill-tags" style={{ marginTop: 10 }}>
                    {editForm.skills.map((s) => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        editable
                        onRemove={removeSkill}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="form-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="auth-spinner" /> Saving…
                  </>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
