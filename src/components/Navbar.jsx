import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎓 EduEvents
        </Link>

        <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <ul className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
          <li>
            <Link
              to="/"
              className={isActive("/")}
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={isActive("/about")}
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/events"
              className={isActive("/events")}
              onClick={() => setMenuOpen(false)}
            >
              Events
            </Link>
          </li>

          {isStudent() && (
            <li>
              <Link
                to="/bookings"
                className={isActive("/bookings")}
                onClick={() => setMenuOpen(false)}
              >
                My Bookings
              </Link>
            </li>
          )}

          {isAdmin() && (
            <li>
              <Link
                to="/admin"
                className={isActive("/admin")}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
          )}

          {user ? (
            <>
              <li>
                <Link
                  to="/profile"
                  className={isActive("/profile")}
                  onClick={() => setMenuOpen(false)}
                >
                  👤 {user.name.split(" ")[0]}
                </Link>
              </li>
              <li>
                <button
                  className="btn btn-outline nav-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={isActive("/login")}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="btn btn-primary nav-btn"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
