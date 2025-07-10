import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playedDates, setPlayedDates] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [flippedDate, setFlippedDate] = useState(null); // stores flipped day (date string)
  const [activitiesByDate, setActivitiesByDate] = useState({}); // map date -> activities array
  const [calendarFlipped, setCalendarFlipped] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [userId, setUserId] = useState(localStorage.getItem("user_id"));

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5001/user/stats?user_id=${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch user stats");
        const data = await response.json();
        console.log("user data:", data);
        setUser(data);
        setPlayedDates(data.played_dates || []);
        setActivitiesByDate(data.activities_by_date || {});
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) return <div className="dashboard">Loading...</div>;
  if (error) return <div className="dashboard">Error: {error}</div>;
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const calendarDays = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    const isPlayed = (day) => {
      if (!day) return false;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      return playedDates.includes(dateStr);
    };

    return (
      <div>
        <div className="calendar-container">
          <a className="side-arrow left" onClick={handlePrevMonth}>
            &lt;
          </a>

          <div className="calendar-grid-wrapper">
            <div className="calendar-header">
              <h4 className="month-label">
                {new Date(currentYear, currentMonth).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h4>
            </div>

            <div className="calendar-grid">
              {dayNames.map((name) => (
                <div key={name} className="day-name">
                  {name}
                </div>
              ))}
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`day-cell ${isPlayed(day) ? "played" : ""} ${
                    day === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear()
                      ? "today"
                      : ""
                  }`}
                  onClick={() => {
                    if (!day) return;
                    const dateStr = `${currentYear}-${String(
                      currentMonth + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    setSelectedDate(dateStr);
                    setCalendarFlipped(true);
                  }}
                >
                  {day || ""}
                </div>
              ))}
            </div>
          </div>

          <a className="side-arrow right" onClick={handleNextMonth}>
            &gt;
          </a>
        </div>
      </div>
    );
  };
  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const todayCalories = activitiesByDate[todayStr]
    ? activitiesByDate[todayStr]
        .reduce((sum, a) => sum + (parseFloat(a.calories) || 0), 0)
        .toFixed(2)
    : "0.00";

  return (
    <div className="dashboard">
      {/* Left Card: Profile */}
      <div className="left-section">
        <div className={`card flip-card ${flipped ? "flipped" : ""}`}>
          <div className="flip-card-inner">
            {/* Front: Profile Info */}
            <div className="flip-card-front">
              <div className="profile-image"></div>
              <div className="profile-info">
                <div className="profile-row">
                  <span className="profile-label">Name:</span>
                  <span className="profile-value">{user.name}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Age:</span>
                  <span className="profile-value">{user.age}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Gender:</span>
                  <span className="profile-value">{user.gender}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Height:</span>
                  <span className="profile-value">{user.height} cm</span>
                </div>
                <div className="profile-row">
                  <span className="profile-label">Weight:</span>
                  <span className="profile-value">{user.weight} kg</span>
                </div>
              </div>
              <button className="save-btn" onClick={() => setFlipped(true)}>
                View Achievements
              </button>
            </div>

            {/* Back: Achievements */}
            <div className="flip-card-back">
              <h3>🏅 Achievements</h3>
              <ul className="badge-list">
                <li>🔥 Burned 1000 Kcal</li>
                <li>💪 7-Day Workout Streak</li>
                <li>🎯 Goal Crushed</li>
              </ul>
              <button className="save-btn" onClick={() => setFlipped(false)}>
                Back to Profile
              </button>
            </div>
          </div>
        </div>

        <div className="card calorie-card">
          <h4>🔥 Calories Burned</h4>
          <p className="calorie-value">{todayCalories} cal</p>
        </div>
        <Link to="/daily-challenge">
          <button className="startbutton">Daily Challenge</button>
        </Link>
      </div>
      {/* Right Container with two stacked cards */}
      <div className="right-cards">
        {/* Top-right: Fitness Stats */}
        <div className="card fitness-stats">
          <h4>Fitness Stats</h4>

          {/* Circular XP Progress with Level */}
          <div className="xp-circle-wrapper">
            <svg viewBox="0 0 36 36" className="xp-circle">
              <path
                className="circle-bg"
                d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${
                  ((user.max_xp || 200) / (user.max_xp_for_level || 1000)) * 100
                }, 100`}
                d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="level-text">
                Level {user.level || 1}
              </text>
            </svg>
            <div className="xp-label">
              XP: {user.max_xp || 200} / {user.max_xp_for_level || 1000}
            </div>
          </div>

          {/* Linear Progress Bars */}
          <div className="stat-bar">
            <label>Score</label>
            <div className="progress-bar">
              <div
                className="progress-fill1"
                style={{
                  width: `${
                    ((user.max_score || 1000) /
                      (user.max_score_for_level || 1000)) *
                    100
                  }%`,
                }}
              />
            </div>
            <span>
              {user.max_score || 1000} / {user.max_score_for_level || 1000}
            </span>
          </div>

          <div className="stat-summary-row">
            <div className="summary-box">
              <div className="summary-value">
                {Math.round(user.total_reps) || "26"}
              </div>
              <div className="summary-label">Reps</div>
            </div>
            <div className="summary-box">
              <div className="summary-value">
                {user.workouts_completed || "52"}
              </div>
              <div className="summary-label">Exercise</div>
            </div>
          </div>
        </div>

        {/* Bottom-right: Streak + Calendar */}
        <div
          className={`card streak-calendar flip-card1 ${
            calendarFlipped ? "flipped" : ""
          }`}
        >
          <div className="flip-card1-inner">
            {/* Front: Calendar View */}
            <div className="flip-card1-front">
              <h4 className="month-heading">🗓️ Activity Calendar</h4>
              <div className="full-calendar">{renderCalendar()}</div>
            </div>

            {/* Back: Date Details */}

            <div className="flip-card1-back" key={selectedDate}>
              <h4>📅 Details for {selectedDate}</h4>

              <div className="activity-details-wrapper">
                {selectedDate && activitiesByDate[selectedDate]?.length > 0 ? (
                  activitiesByDate[selectedDate].map((activity, index) => (
                    <div key={index} className="activity-detail">
                      <p>
                        <strong>Exercise:</strong> {activity.exercise}
                      </p>
                      <p>
                        <strong>Level:</strong> {activity.level}
                      </p>
                      <p>
                        <strong>Reps:</strong> {activity.reps}
                      </p>
                      <p>
                        <strong>XP:</strong> {activity.xp}
                      </p>
                      <p>
                        <strong>Calories:</strong> {activity.calories}
                      </p>
                      <hr />
                    </div>
                  ))
                ) : (
                  <p>No activity on this day.</p>
                )}
              </div>

              <button
                className="save-btn"
                onClick={() => setCalendarFlipped(false)}
              >
                Back to Calendar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
