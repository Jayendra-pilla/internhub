import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://internhub-gbuo.onrender.com";

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const strength = () => {
        if (password.length === 0) return 0;
        let s = 0;
        if (password.length >= 8) s++;
        if (/[A-Z]/.test(password)) s++;
        if (/[0-9]/.test(password)) s++;
        if (/[^A-Za-z0-9]/.test(password)) s++;
        return s;
    };
    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
    const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];
    const s = strength();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (!name.trim() || !email.trim() || !password || !confirm) {
            setError("Please fill in all fields.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API}/register`, {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
            });
            setLoading(false);
            navigate("/login", { state: { successMessage: "🎉 Account created! Please sign in." } });
        } catch (err) {
            setLoading(false);
            const msg =
                err.response?.data?.detail ||
                "Registration failed. Please try again.";
            setError(msg);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />

            <div className="auth-card" style={{ maxWidth: 460 }}>
                {/* Logo */}
                <div className="auth-logo">
                    <div className="brand-icon" style={{ width: 44, height: 44, fontSize: "1.3rem", borderRadius: 12 }}>🎓</div>
                    <span className="auth-brand">InternHub</span>
                </div>

                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Start your internship journey today — it's free</p>

                {error && (
                    <div className="auth-error" id="register-error">
                        ⚠️ {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleRegister} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-name">Full Name</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">👤</span>
                            <input
                                id="reg-name"
                                className="form-input auth-input"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(""); }}
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email Address</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">✉️</span>
                            <input
                                id="reg-email"
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
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔒</span>
                            <input
                                id="reg-password"
                                className="form-input auth-input"
                                type={showPass ? "text" : "password"}
                                placeholder="Min. 6 characters"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                autoComplete="new-password"
                                style={{ paddingRight: 48 }}
                            />
                            <button
                                type="button"
                                className="pass-toggle"
                                id="reg-toggle-pass"
                                onClick={() => setShowPass(!showPass)}
                                tabIndex={-1}
                            >
                                {showPass ? "🙈" : "👁"}
                            </button>
                        </div>

                        {/* Strength meter */}
                        {password.length > 0 && (
                            <div className="strength-meter">
                                <div className="strength-bars">
                                    {[1, 2, 3, 4].map((n) => (
                                        <div
                                            key={n}
                                            className="strength-bar"
                                            style={{ background: s >= n ? strengthColor[s] : "rgba(255,255,255,0.08)" }}
                                        />
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: strengthColor[s] }}>
                                    {strengthLabel[s]}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔑</span>
                            <input
                                id="reg-confirm"
                                className="form-input auth-input"
                                type={showPass ? "text" : "password"}
                                placeholder="Repeat your password"
                                value={confirm}
                                onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                                autoComplete="new-password"
                                style={{
                                    paddingRight: 48,
                                    borderColor: confirm && confirm !== password
                                        ? "rgba(239,68,68,0.6)"
                                        : confirm && confirm === password
                                            ? "rgba(34,197,94,0.5)"
                                            : undefined
                                }}
                            />
                            {confirm && (
                                <span
                                    className="pass-toggle"
                                    style={{ cursor: "default", fontSize: "0.9rem" }}
                                >
                                    {confirm === password ? "✅" : "❌"}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        id="register-submit"
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? <span className="auth-spinner" /> : null}
                        {loading ? "Creating account…" : "Create Account"}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;