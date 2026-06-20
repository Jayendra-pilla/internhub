import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const handleHome = () => {
        if (isLoggedIn) {
            navigate(role === "admin" ? "/admin" : "/dashboard");
        } else {
            navigate("/");
        }
    };

    return (
        <div className="not-found-page">
            <div className="not-found-glow" />

            <div className="not-found-code">404</div>

            <h1 className="not-found-title">Page Not Found</h1>
            <p className="not-found-desc">
                Oops! The page you're looking for doesn't exist or has been moved.
                Let's get you back on track.
            </p>

            <div className="not-found-actions">
                <button
                    className="btn btn-primary"
                    onClick={handleHome}
                    id="not-found-home-btn"
                >
                    ← Go Home
                </button>
                <button
                    className="btn btn-ghost"
                    onClick={() => navigate(-1)}
                    id="not-found-back-btn"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
}

export default NotFound;
