import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

function Navbar({ onLoginChange }) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const role = localStorage.getItem("role");
    const isAdmin = role === "admin";
    const isLoggedIn = !!localStorage.getItem("token");
    const userName = localStorage.getItem("userName") || "";
    const initials = userName
        ? userName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        if (onLoginChange) onLoginChange();
        setMenuOpen(false);
        navigate("/");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav style={{ position: "relative" }}>
            <Link to={isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="nav-brand">
                <div className="brand-icon">🎓</div>
                <span>InternHub</span>
            </Link>

            {/* Hamburger button — mobile only */}
            <button
                className={`nav-hamburger ${menuOpen ? "open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
                id="nav-hamburger-btn"
            >
                <span /><span /><span />
            </button>

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                {/* Home — only visible for guests */}
                {!isLoggedIn && (
                    <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                        Home
                    </NavLink>
                )}

                {isLoggedIn ? (
                    <>
                        {isAdmin ? (
                            <NavLink to="/admin" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                                🛡️ Admin Panel
                            </NavLink>
                        ) : (
                            <>
                                <NavLink to="/internships" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                                    Internships
                                </NavLink>
                                <NavLink to="/applications" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                                    My Applications
                                </NavLink>
                                <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                                    Dashboard
                                </NavLink>
                            </>
                        )}

                        <div className="nav-profile-group">
                            <NavLink
                                to="/profile"
                                onClick={closeMenu}
                                className={({ isActive }) => `nav-profile-link ${isActive ? "active" : ""}`}
                                title="My Profile"
                            >
                                <span className="nav-avatar">{initials}</span>
                                <span>Profile</span>
                            </NavLink>
                            <button
                                id="logout-btn"
                                className="btn btn-ghost btn-sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <NavLink to="/login" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                            Login
                        </NavLink>
                        <NavLink to="/register" onClick={closeMenu} className={({ isActive }) => isActive ? "active" : ""}>
                            Register
                        </NavLink>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;