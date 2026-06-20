import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Login({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Message passed from ProtectedRoute or Home's "Browse Internships" button
    const redirectMessage = location.state?.message || "";
    const successMessage = location.state?.successMessage || "";
    const intendedPath = location.state?.from?.pathname || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post(`${API}/login`, {
                email: email.trim(),
                password: password.trim(),
            });
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("email", email.trim());
            localStorage.setItem("userEmail", email.trim());
            localStorage.setItem("userName", data.name || "");
            localStorage.setItem("role", data.role);
            setLoading(false);
            if (onLogin) onLogin();

            // Admin always goes to /admin panel
            if (data.role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate(intendedPath, { replace: true });
            }
        } catch (err) {
            setLoading(false);
            const msg =
                err.response?.data?.detail ||
                "Login failed. Please try again.";
            setError(msg);
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
                    <div className="brand-icon" style={{ width: 44, height: 44, fontSize: "1.3rem", borderRadius: 12 }}>🎓</div>
                    <span className="auth-brand">InternHub</span>
                </div>

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to track your internship journey</p>

                {/* Redirect message (e.g. "Please login to browse internships.") */}
                {successMessage && (
                    <div className="auth-redirect-msg" id="login-success-msg" style={{ background: "rgba(22,163,74,0.12)", borderColor: "rgba(34,197,94,0.35)", color: "#4ade80" }}>
                        ✅ {successMessage}
                    </div>
                )}

                {redirectMessage && (
                    <div className="auth-redirect-msg" id="login-redirect-msg">
                        🔒 {redirectMessage}
                    </div>
                )}

                {error && (
                    <div className="auth-error" id="login-error">
                        ⚠️ {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">Email Address</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">✉️</span>
                            <input
                                id="login-email"
                                className="form-input auth-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <Link to="/forgot-password" className="auth-link-sm" id="forgot-password-link">Forgot password?</Link>
                        </div>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔒</span>
                            <input
                                id="login-password"
                                className="form-input auth-input"
                                type={showPass ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                autoComplete="current-password"
                                style={{ paddingRight: 48 }}
                            />
                            <button
                                type="button"
                                className="pass-toggle"
                                id="login-toggle-pass"
                                onClick={() => setShowPass(!showPass)}
                                tabIndex={-1}
                            >
                                {showPass ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? <span className="auth-spinner" /> : null}
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register" className="auth-link">Create one free</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;