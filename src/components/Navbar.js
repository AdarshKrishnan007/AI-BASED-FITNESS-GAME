import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("email");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/logout");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="white-navbar">
      <div className="white-navbar-container">
        <div className="white-navbar-logo">
          <span role="img" aria-label="logo">
            🏋️‍♂️
          </span>{" "}
          FitTracker
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
        <div className={`white-navbar-links ${menuOpen ? "active" : ""}`}>
          <NavLink
            to="/"
            className="white-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          {isLoggedIn && (
            <>
              <NavLink
                to="/profile"
                className="white-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink
                to="/daily-challenge"
                className="white-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Daily
              </NavLink>
              <NavLink
                to="/adventure-map"
                className="white-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                Map
              </NavLink>
            </>
          )}
          <NavLink
            to="/leaderboard"
            className="white-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Rank
          </NavLink>
          {!isLoggedIn ? (
            <NavLink
              to="/login"
              className="white-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
          ) : (
            <span className="white-nav-link logout-link" onClick={handleLogout}>
              Logout
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
