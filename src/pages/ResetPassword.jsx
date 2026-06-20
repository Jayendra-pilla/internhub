import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

// Password strength helper
const getStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
};
const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Strong"];
const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#22c55e"];

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const strength = getStrength(newPassword);

    // Auto-redirect to login after success
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => navigate("/login"), 3000);
        return () => clearTimeout(timer);
    }, [success, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!newPassword || newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!token) {
            setError("Invalid reset link. Please request a new one.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/reset-password`, {
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            setSuccess(data.message);
        } catch (err) {
            setError(
                err.response?.data?.detail ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div
                        className="brand-icon"
                        style={{ width: 44, height: 44, fontSize: "1.3rem", borderRadius: 12 }}
                    >
                        🎓
                    </div>
                    <span className="auth-brand">InternHub</span>
                </div>

                {/* Icon */}
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.8rem",
                    margin: "8px 0 20px",
                }}>
                    🔒
                </div>

                <h1 className="auth-title">Set New Password</h1>
                <p className="auth-subtitle">
                    Choose a strong password for your account.
                </p>

                {error && (
                    <div className="auth-error" id="reset-error">
                        ⚠️ {error}
                    </div>
                )}

                {success ? (
                    <div style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "10px",
                        padding: "20px",
                        textAlign: "center",
                        color: "#4ade80",
                    }} id="reset-success">
                        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>✅</div>
                        <strong style={{ fontSize: "1.05rem" }}>Password Reset!</strong>
                        <p style={{ color: "#86efac", marginTop: 8, fontSize: "0.85rem" }}>
                            {success}
                        </p>
                        <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: 12 }}>
                            Redirecting to login in 3 seconds…
                        </p>
                        <Link
                            to="/login"
                            className="btn btn-primary"
                            style={{ marginTop: 16, textDecoration: "none", width: "100%", justifyContent: "center" }}
                        >
                            Go to Login →
                        </Link>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {/* New Password */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="reset-new-password">
                                New Password
                            </label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🔒</span>
                                <input
                                    id="reset-new-password"
                                    className="form-input auth-input"
                                    type={showNew ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                                    autoComplete="new-password"
                                    style={{ paddingRight: 48 }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="pass-toggle"
                                    id="reset-toggle-new"
                                    onClick={() => setShowNew(!showNew)}
                                    tabIndex={-1}
                                >
                                    {showNew ? "🙈" : "👁"}
                                </button>
                            </div>

                            {/* Strength meter */}
                            {newPassword && (
                                <div className="strength-meter" style={{ marginTop: 8 }}>
                                    <div className="strength-bars">
                                        {[1, 2, 3, 4, 5].map((lvl) => (
                                            <div
                                                key={lvl}
                                                className="strength-bar"
                                                style={{
                                                    background: lvl <= strength
                                                        ? strengthColor[strength]
                                                        : "rgba(255,255,255,0.08)",
                                                    transition: "background 0.3s ease",
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <span
                                        className="strength-label"
                                        style={{ color: strengthColor[strength] }}
                                    >
                                        {strengthLabel[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="reset-confirm-password">
                                Confirm Password
                            </label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🔒</span>
                                <input
                                    id="reset-confirm-password"
                                    className="form-input auth-input"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                                    autoComplete="new-password"
                                    style={{
                                        paddingRight: 48,
                                        borderColor: confirmPassword
                                            ? newPassword === confirmPassword
                                                ? "rgba(34,197,94,0.5)"
                                                : "rgba(239,68,68,0.5)"
                                            : undefined,
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="pass-toggle"
                                    id="reset-toggle-confirm"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    tabIndex={-1}
                                >
                                    {showConfirm ? "🙈" : "👁"}
                                </button>
                            </div>
                            {confirmPassword && newPassword !== confirmPassword && (
                                <p style={{ color: "#f87171", fontSize: "0.78rem", marginTop: 4 }}>
                                    Passwords don't match
                                </p>
                            )}
                            {confirmPassword && newPassword === confirmPassword && (
                                <p style={{ color: "#4ade80", fontSize: "0.78rem", marginTop: 4 }}>
                                    ✓ Passwords match
                                </p>
                            )}
                        </div>

                        <button
                            id="reset-submit"
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={loading}
                        >
                            {loading ? <span className="auth-spinner" /> : null}
                            {loading ? "Resetting…" : "Reset Password"}
                        </button>
                    </form>
                )}

                <div className="auth-divider"><span>or</span></div>

                <p className="auth-footer">
                    <Link to="/login" className="auth-link">
                        ← Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;
