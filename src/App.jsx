import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Internships from "./pages/Internships";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const API = "http://127.0.0.1:8000";

function App() {
  const [applications, setApplications] = useState([]);

  // Helper: build auth header from stored JWT token
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch only the logged-in user's own applications from the protected endpoint.
  // Falls back silently when the user is not logged in (no token).
  const loadMyApplications = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setApplications([]);
      return;
    }
    axios
      .get(`${API}/my-applications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setApplications(res.data))
      .catch((err) => {
        console.error("Failed to load applications:", err);
        setApplications([]);
      });
  };

  useEffect(() => {
    loadMyApplications();
  }, []);

  return (
    <BrowserRouter>

      <Navbar onLoginChange={loadMyApplications} />

      <Routes>

        {/* ── Public Routes ───────────────────────────────────────── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={loadMyApplications} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Protected Routes ────────────────────────────────────── */}
        <Route
          path="/internships"
          element={
            <ProtectedRoute>
              <Internships
                applications={applications}
                setApplications={setApplications}
                getAuthHeader={getAuthHeader}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <Applications
                applications={applications}
                setApplications={setApplications}
                getAuthHeader={getAuthHeader}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard applications={applications} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;