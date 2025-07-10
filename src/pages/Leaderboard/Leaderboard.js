import React, { useEffect, useState } from "react";
import "./Leaderboard.css"; // Responsive CSS

const getBadge = (user) => {
  const xp = user.total_xp;

  if (xp >= 40000) return "🏆 Champion";
  if (xp >= 30000) return "🎖️ Top Performer";
  if (xp >= 20000) return "⚔️ Warrior";
  if (xp >= 15000) return "🚀 Pro";
  if (xp >= 10000) return "🔥 Master";
  if (xp >= 5000) return "🥈 Intermediate";
  return "🎯 Beginner";
};

const Leaderboard = () => {
  const userId = localStorage.getItem("user_id");

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/leaderboard?sort_by=xp`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        console.log("Leaderboard data:", data);
        setUserData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div className="leaderboard-wrapper">
      <div className="leaderboard-card">
        <h2 className="leaderboard-heading">🏅 Leaderboard</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && userData && (
          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Badge</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {userData.leaderboard?.map((user, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{(user.name || user.user_id || "Unknown").trim()}</td>
                    <td>{getBadge(user)}</td>
                    <td>{user.level ? `Lv. ${user.level}` : "—"}</td>
                    <td>{user.xp || user.total_xp || 0}</td>
                    <td>{user.score || user.total_score || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
