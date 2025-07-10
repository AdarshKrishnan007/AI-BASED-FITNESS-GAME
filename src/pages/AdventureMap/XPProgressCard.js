import React from "react";
import "./XPProgressCard.css";

const XPProgressCard = ({ level, xp, maxXp, score, maxScore }) => {
  const xpProgress = Math.min((xp / maxXp) * 100, 100).toFixed(1);
  const badgeProgress = Math.min((level / 10) * 100, 100).toFixed(1); // Assuming level 10 = Master

  const getBadgeInfo = () => {
    if (level >= 30 && score >= 3000) return { icon: "🏆", label: "Champion" };
    if (level >= 25 && score >= 2500)
      return { icon: "🎖️", label: "Top Performer" };
    if (level >= 20 && score >= 2000) return { icon: "⚔️", label: "Warrior" };
    if (level >= 15 && score >= 1500) return { icon: "🚀", label: "Pro" };
    if (level >= 10 && score >= 1000) return { icon: "🔥", label: "Master" };
    if (level >= 5 && score >= 500)
      return { icon: "🥈", label: "Intermediate" };
    return { icon: "🎯", label: "Beginner" };
  };

  const badge = getBadgeInfo();

  return (
    <div className="xp-card-row">
      {/* Left: Badge & Progress */}
      <div className="left-section1">
        <p>
          <strong>Score:</strong> {score} / {maxScore}
        </p>
        <div className="progress-bar small">
          <div
            className="progress-fill"
            style={{ width: `${badgeProgress}%` }}
          />
        </div>
      </div>

      {/* Center: Badge Title + Level */}
      <div className="center-section">
        <span className="badge-icon">{badge.icon}</span>
        <span className="badge-title">{badge.label}</span>
        <p>
          <strong>Level:</strong> {level}
        </p>
      </div>

      {/* Right: XP Info */}
      <div className="right-section">
        <p>
          <strong>XP:</strong> {xp} / {maxXp}
        </p>
        <div className="progress-bar small">
          <div className="progress-fill" style={{ width: `${xpProgress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default XPProgressCard;
