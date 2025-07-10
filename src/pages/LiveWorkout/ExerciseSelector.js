import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ExerciseSelector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [exercise, setExercise] = useState(location.state?.exercise || "jump");
  const level = location.state?.levelName || "Level 1";
  const reps = location.state?.targetReps;
  const levelId = location.state?.levelId;
  const [mode, setMode] = useState("webcam");
  const [videoFile, setVideoFile] = useState(null);

  const handleStart = () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("User not logged in.");
      return;
    }

    if (mode === "upload" && !videoFile) {
      alert("Please upload a video.");
      return;
    }

    navigate("/live-workout", {
      state: {
        levelId,
        exercise,
        mode,
        level: level,
        user_id,
        targetReps: reps,
      },
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setVideoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("uploadedWorkoutVideo", reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const styles = {
    container: {
      padding: "16px",
      maxWidth: "400px",
      margin: "125px  auto",
      textAlign: "center",
      color: "#fefefe",
    },
    heading: { fontSize: "24px", fontWeight: "700", marginBottom: "16px" },
    label: {
      display: "block",
      marginBottom: "8px",
      textAlign: "left",
      color: "#fefefe",
    },
    select: { width: "100%", padding: "8px", marginBottom: "16px" },
    radioGroup: {
      display: "flex",
      justifyContent: "space-around",
      marginBottom: "16px",
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
    fileInput: { marginBottom: "16px", width: "100%" },
    fileName: { marginBottom: "12px", fontStyle: "italic" },
  };

  return (
    <div style={styles.container}>
      {location.state?.exercise && (
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "12px",
            color: "#fefefe",
          }}
        >
          {level} Task: {reps} {exercise}
        </h3>
      )}
      <label style={styles.label}>Exercise Type:</label>
      <select
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        style={styles.select}
        disabled={!!location.state?.exercise}
      >
        <option value="jump">jump</option>
        <option value="squat">squat</option>
        <option value="pushup">pushup</option>
        <option value="plank">plank</option>
      </select>
      <label style={styles.label}>Mode:</label>
      <div style={styles.radioGroup}>
        <label>
          <input
            type="radio"
            value="webcam"
            checked={mode === "webcam"}
            onChange={(e) => setMode(e.target.value)}
          />
          Webcam
        </label>
        <label>
          <input
            type="radio"
            value="upload"
            checked={mode === "upload"}
            onChange={(e) => setMode(e.target.value)}
          />
          Upload Video
        </label>
      </div>
      {mode === "upload" && (
        <>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={styles.fileInput}
          />
          {videoFile && (
            <div style={styles.fileName}>Selected file: {videoFile.name}</div>
          )}
        </>
      )}
      <button style={styles.startButton} onClick={handleStart}>
        Start Workout
      </button>
    </div>
  );
};

export default ExerciseSelector;
