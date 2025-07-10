import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DailyChallenge = () => {
  const [streak, setStreak] = useState(0);
  const [weekProgress, setWeekProgress] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [showWheel, setShowWheel] = useState(false);
  const rewards = [
    "+10 XP",
    "+20 XP",
    "+30 XP",
    "+50 XP",
    "Power-Up",
    "Try Again",
  ];
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const randDeg = Math.floor(Math.random() * 360) + 720; // 2 full spins + random
    const selectedIndex =
      Math.floor((360 - (randDeg % 360)) / (360 / rewards.length)) %
      rewards.length;

    setRotation((prev) => prev + randDeg);

    setTimeout(() => {
      setResult(rewards[selectedIndex]);
      setSpinning(false);
    }, 4000);
  };

  useEffect(() => {
    fetchPlayedDates();
  }, []);

  // === Add the fetchPlayedDates function here ===
  const fetchPlayedDates = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:5001/user/stats?user_id=${userId}`
      );
      const data = await response.json();

      if (data.played_dates) {
        const playedSet = new Set(data.played_dates);

        // Weekly progress calculation
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday start

        const thisWeek = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(startOfWeek);
          d.setDate(d.getDate() + i);
          const dStr = d.toISOString().split("T")[0];
          thisWeek.push(playedSet.has(dStr) ? "✅" : "");
        }
        setWeekProgress(thisWeek);

        // Streak calculation
        let streakCount = 0;
        for (let i = 0; i < 100; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split("T")[0];
          if (playedSet.has(dStr)) {
            streakCount++;
          } else {
            break;
          }
        }
        setStreak(streakCount);
      }
    } catch (err) {
      console.error("Error fetching played dates", err);
    }
  };

  const handleStartWorkout = () => {
    setShowWheel(true);
    fetchPlayedDates(); // Refresh data after workout completes
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏋️ Daily Challenge</h1>
      <p style={styles.subtitle}>
        Complete your workout to gain XP and build your streak!
      </p>

      {/* 🔥 Streak Tracker */}
      <div style={styles.card}>
        <h2>🔥 Streak: {streak} Days</h2>
        <p style={styles.hint}>
          <span style={{ color: "black" }}>
            Keep it up! Reach <span style={styles.highlight}>5 Days</span> to
            earn a reward.
          </span>
        </p>
      </div>

      {/* 🗓️ Weekly Progress */}
      <div style={styles.card}>
        <h2>🗓️ This Week</h2>
        <div style={styles.calendar}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div
              key={day}
              style={{
                ...styles.dayBox,
                backgroundColor:
                  weekProgress[i] === "✅" ? "#28a745" : "#e0e0e0",
                color: weekProgress[i] === "✅" ? "#fff" : "#000",
              }}
            >
              {day} {weekProgress[i]}
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Start Workout Button */}
      <Link to="/adventure-map">
        <button style={styles.startButton}>Start Workout</button>
      </Link>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "600px",
    margin: "120px auto",
    padding: "20px",
    fontFamily: "sans-serif",
    textAlign: "center",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#fefefe",
  },
  subtitle: {
    fontSize: "16px",
    color: "#fff",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  calendar: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "10px",
    marginTop: "10px",
  },
  dayBox: {
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  startButton: {
    padding: "12px 25px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "20px",
  },
  spinButton: {
    padding: "10px 20px",
    backgroundColor: "#ffd700",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  backLink: {
    display: "inline-block",
    marginTop: "20px",
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
  },
  hint: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#000",
  },
  highlight: {
    color: "#ff6347",
    fontWeight: "bold",
  },
  wheelContainer: {
    position: "relative",
    width: "220px",
    height: "220px",
    margin: "30px auto",
    boxShadow: "0 0 15px rgba(0,0,0,0.3)",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #222, #444)", // dark sporty background
  },

  wheel: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "10px solid #ff6600", // orange gym color border
    position: "relative",
    background: "radial-gradient(circle at center, #333 0%, #111 80%)", // dark gradient
    boxShadow: "inset 0 0 10px #ff6600",
  },

  wedge: {
    position: "absolute",
    width: "100%",
    height: "50%",
    left: 0,
    top: 0,
    transformOrigin: "50% 100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontSize: "14px",
    fontWeight: "700",
    color: "#ff6600",
    paddingTop: "12px",
    fontFamily: "'Roboto', sans-serif",
    textShadow: "1px 1px 2px #000",
  },

  pointer: {
    position: "absolute",
    top: "-28px",
    left: "calc(50% - 14px)",
    fontSize: "28px",
    color: "#ff6600",
    textShadow: "1px 1px 2px #000",
    userSelect: "none",
  },

  spinButton: {
    marginTop: "20px",
    padding: "12px 28px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#ff6600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 5px 10px rgba(255, 102, 0, 0.5)",
    transition: "background-color 0.3s",
  },

  hint: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#ddd",
    fontStyle: "italic",
    textAlign: "center",
  },
};

export default DailyChallenge;
