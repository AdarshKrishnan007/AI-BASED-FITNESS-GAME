import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRunning, FaChild, FaDumbbell, FaPersonBooth } from "react-icons/fa";
import "./AdventureMap.css";
import XPProgressCard from "./XPProgressCard";

import JumpIcon from "../../assets/icons/skipping-rope.png";
import SquatIcon from "../../assets/icons/powerlifting.png";
import PushupIcon from "../../assets/icons/push-up.png";
import PlankIcon from "../../assets/icons/vr-fitness.png";

const exerciseTypes = ["jump", "squat", "pushup", "plank"];
const levelIcons = {
  jump: <img src={JumpIcon} alt="Jump" className="level-icon-img" />,
  squat: <img src={SquatIcon} alt="Squat" className="level-icon-img" />,
  pushup: <img src={PushupIcon} alt="Pushup" className="level-icon-img" />,
  plank: <img src={PlankIcon} alt="Plank" className="level-icon-img" />,
};

const totalLevels = 30;
const levelsPerPage = 12;

const levels = Array.from({ length: totalLevels }, (_, i) => {
  const id = i + 1;
  const exercise = exerciseTypes[i % exerciseTypes.length];
  const reps = 5 + Math.floor(i / 3) * 5;
  const name = `Level ${id}`;
  const description = `${
    exercise.charAt(0).toUpperCase() + exercise.slice(1)
  } ${reps} times`;

  return {
    id,
    name,
    description,
    reps,
    exercise,
    icon: levelIcons[exercise],
  };
});

const AdventureMap = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const [userId, setUserId] = useState(localStorage.getItem("user_id"));
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/user/stats?user_id=${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user stats");
        }
        const data = await response.json();
        console.log("score and xp datas:", data);
        setUserStats(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const unlockedLevels = userStats?.level || 1;

  // 🔹 STEP 4: Handle loading/error
  if (loading) return <div>Loading user stats...</div>;
  if (error) return <div>Error: {error}</div>;

  const totalPages = Math.ceil(totalLevels / levelsPerPage);
  const startIndex = (currentPage - 1) * levelsPerPage;
  const currentLevels = levels.slice(startIndex, startIndex + levelsPerPage);

  const handleLevelSelect = (level) => {
    if (level.id <= unlockedLevels) {
      navigate("/select-workout", {
        state: {
          levelId: level.id,
          levelName: level.name,
          exercise: level.exercise,
          targetReps: level.reps,
        },
      });
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="map-wrapper">
        <div className="left-card">
          <XPProgressCard
            level={userStats.level}
            xp={userStats.max_xp}
            maxXp={userStats.max_xp_for_level}
            score={userStats.max_score}
            maxScore={userStats.max_score_for_level}
          />
        </div>
        <div className="map-container">
          <h2 className="map-title">Choose Your Adventure</h2>

          <div className="level-grid">
            {currentLevels.map((level) => {
              const isUnlocked = level.id <= unlockedLevels;
              return (
                <button
                  key={level.id}
                  className={`level-card ${isUnlocked ? "unlocked" : "locked"}`}
                  onClick={() => handleLevelSelect(level)}
                  disabled={!isUnlocked}
                  title={isUnlocked ? level.description : "Locked"}
                >
                  <div className="level-icon">{level.icon}</div>
                  <div className="level-info">
                    <span className="level-name">{level.name}</span>
                    <small className="level-desc">{level.description}</small>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdventureMap;
