import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function Home() {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);

    // If already logged in, redirect to the appropriate page immediately
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const role = localStorage.getItem("role");
            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        }
        // Trigger entrance animations
        setTimeout(() => setVisible(true), 100);
    }, [navigate]);

    const handleBrowse = () => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate("/internships");
        } else {
            navigate("/login", {
                state: { message: "Please login to browse internships." },
            });
        }
    };

    const features = [
        {
            icon: "🔍",
            title: "Smart Search",
            desc: "Filter internships by role, company, stipend, and location to find your perfect match.",
        },
        {
            icon: "⚡",
            title: "One-Click Apply",
            desc: "Upload your resume once and apply to multiple internships with a single click.",
        },
        {
            icon: "📊",
            title: "Track Progress",
            desc: "Monitor your application status in real-time with a personalized dashboard.",
        },
        {
            icon: "🔔",
            title: "Instant Updates",
            desc: "Get notified when your application status changes — never miss an opportunity.",
        },
    ];

    const steps = [
        { num: "01", title: "Create Account", desc: "Sign up for free in seconds with just your email." },
        { num: "02", title: "Upload Resume", desc: "Add your resume to your profile — it's saved for all applications." },
        { num: "03", title: "Browse & Apply", desc: "Explore curated internships and apply with one click." },
        { num: "04", title: "Get Hired", desc: "Track your status and land your dream internship." },
    ];

    return (
        <div className={`landing-page ${visible ? "lp-visible" : ""}`}>
            {/* ── Animated background ── */}
            <div className="lp-bg-glow lp-bg-glow-1" />
            <div className="lp-bg-glow lp-bg-glow-2" />
            <div className="lp-bg-glow lp-bg-glow-3" />
            <div className="lp-particles">
                {[...Array(20)].map((_, i) => (
                    <span key={i} className="lp-particle" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 6}s`,
                        animationDuration: `${4 + Math.random() * 6}s`,
                        width: `${2 + Math.random() * 3}px`,
                        height: `${2 + Math.random() * 3}px`,
                    }} />
                ))}
            </div>

            {/* ── Hero Section ── */}
            <section className="lp-hero">
                <div className="lp-hero-badge lp-anim lp-anim-1">
                    <span className="lp-badge-dot" />
                    🚀 Your career starts here
                </div>

                <h1 className="lp-hero-title lp-anim lp-anim-2">
                    Discover & Land Your
                    <br />
                    <span className="lp-gradient-text">Dream Internship</span>
                </h1>

                <p className="lp-hero-desc lp-anim lp-anim-3">
                    InternHub connects students with handpicked internship opportunities
                    from top companies. Apply in seconds, track your progress, and kickstart
                    your career — all in one place.
                </p>

                <div className="lp-hero-actions lp-anim lp-anim-4">
                    <button onClick={handleBrowse} className="lp-btn-primary" id="hero-browse-btn">
                        <span>Browse Internships</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                    <button onClick={() => navigate("/register")} className="lp-btn-outline" id="hero-register-btn">
                        Create Free Account
                    </button>
                </div>

                <div className="lp-hero-stats lp-anim lp-anim-5">
                    <div className="lp-stat">
                        <span className="lp-stat-num">50+</span>
                        <span className="lp-stat-label">Open Positions</span>
                    </div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat">
                        <span className="lp-stat-num">20+</span>
                        <span className="lp-stat-label">Top Companies</span>
                    </div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat">
                        <span className="lp-stat-num">₹80K</span>
                        <span className="lp-stat-label">Max Stipend</span>
                    </div>
                    <div className="lp-stat-divider" />
                    <div className="lp-stat">
                        <span className="lp-stat-num">100%</span>
                        <span className="lp-stat-label">Free to Apply</span>
                    </div>
                </div>
            </section>

            {/* ── Trusted By ── */}
            <section className="lp-trusted lp-anim lp-anim-6">
                <p className="lp-trusted-label">Trusted by students from</p>
                <div className="lp-trusted-logos">
                    {["IIT Delhi", "NIT Trichy", "BITS Pilani", "VIT", "SRM University", "IIIT Hyderabad"].map((name) => (
                        <span key={name} className="lp-trusted-logo">{name}</span>
                    ))}
                </div>
            </section>

            {/* ── Features Section ── */}
            <section className="lp-section">
                <div className="lp-section-header lp-anim lp-anim-7">
                    <span className="lp-section-badge">Features</span>
                    <h2 className="lp-section-title">Everything You Need to Succeed</h2>
                    <p className="lp-section-desc">Powerful tools designed to make your internship hunt effortless.</p>
                </div>

                <div className="lp-features-grid">
                    {features.map((f, i) => (
                        <div key={i} className={`lp-feature-card lp-anim lp-anim-${8 + i}`}>
                            <div className="lp-feature-icon">{f.icon}</div>
                            <h3 className="lp-feature-title">{f.title}</h3>
                            <p className="lp-feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="lp-section">
                <div className="lp-section-header lp-anim lp-anim-12">
                    <span className="lp-section-badge">How It Works</span>
                    <h2 className="lp-section-title">From Sign Up to Dream Internship</h2>
                    <p className="lp-section-desc">Four simple steps to land your next opportunity.</p>
                </div>

                <div className="lp-steps">
                    {steps.map((s, i) => (
                        <div key={i} className={`lp-step lp-anim lp-anim-${13 + i}`}>
                            <div className="lp-step-num">{s.num}</div>
                            <div className="lp-step-connector" />
                            <h3 className="lp-step-title">{s.title}</h3>
                            <p className="lp-step-desc">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="lp-cta lp-anim lp-anim-17">
                <div className="lp-cta-glow" />
                <h2 className="lp-cta-title">Ready to Start Your Journey?</h2>
                <p className="lp-cta-desc">
                    Join thousands of students who found their dream internship through InternHub.
                </p>
                <div className="lp-cta-actions">
                    <button onClick={() => navigate("/register")} className="lp-btn-primary lp-btn-lg" id="cta-register-btn">
                        Get Started — It's Free
                    </button>
                    <button onClick={() => navigate("/login")} className="lp-btn-outline lp-btn-lg" id="cta-login-btn">
                        Already have an account? Login
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer-brand">
                    <div className="brand-icon" style={{ width: 30, height: 30, fontSize: "0.9rem", borderRadius: 8 }}>🎓</div>
                    <span>InternHub</span>
                </div>
                <p className="lp-footer-copy">© 2025 InternHub. Built for students, by students.</p>
            </footer>
        </div>
    );
}

export default Home;