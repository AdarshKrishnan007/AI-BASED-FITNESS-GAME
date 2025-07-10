import React from "react";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("user_id");
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Logout</h2>
        <p style={styles.text}>Are you sure you want to logout?</p>
        <div style={styles.buttonGroup}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
          <button onClick={() => navigate("/login")} style={styles.backButton}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  heading: {
    marginBottom: "16px",
    fontSize: "24px",
    color: "#333",
  },
  text: {
    marginBottom: "24px",
    fontSize: "16px",
    color: "#555",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#e53935",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1,
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#9e9e9e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    flex: 1,
  },
};

export default Logout;
