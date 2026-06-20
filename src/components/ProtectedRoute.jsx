import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute
 * Wraps any route that requires authentication.
 * - If authenticated → renders children
 * - If not          → redirects to /login, preserving the intended path via `state.from`
 */
function ProtectedRoute({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                state={{ from: location, message: "Please login to continue." }}
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;
