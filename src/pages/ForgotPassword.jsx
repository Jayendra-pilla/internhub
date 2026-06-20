import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/forgot-password`, {
                email: email.trim().toLowerCase(),
            });
            setSuccess(data.message);
            setEmail("");
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
            {/* Decorative blobs */}
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
                    🔑
                </div>

                <h1 className="auth-title">Forgot Password?</h1>
                <p className="auth-subtitle">
                    Enter your email and we'll send you a reset link.
                </p>

                {error && (
                    <div className="auth-error" id="forgot-error">
                        ⚠️ {error}
                    </div>
                )}

                {success ? (
                    <div style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "10px",
                        padding: "16px 18px",
                        fontSize: "0.9rem",
                        color: "#4ade80",
                        marginBottom: "20px",
                        lineHeight: 1.6,
                    }} id="forgot-success">
                        <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>📬</div>
                        <strong>Check your inbox!</strong>
                        <p style={{ color: "#86efac", marginTop: 6, fontSize: "0.85rem" }}>
                            {success}
                        </p>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label className="form-label" htmlFor="forgot-email">
                                Email Address
                            </label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">✉️</span>
                                <input
                                    id="forgot-email"
                                    className="form-input auth-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            id="forgot-submit"
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={loading}
                        >
                            {loading ? <span className="auth-spinner" /> : null}
                            {loading ? "Sending…" : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <div className="auth-divider"><span>or</span></div>

                <p className="auth-footer">
                    Remember your password?{" "}
                    <Link to="/login" className="auth-link">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPassword;
