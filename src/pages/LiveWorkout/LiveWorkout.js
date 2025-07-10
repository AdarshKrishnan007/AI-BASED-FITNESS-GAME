import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { startPoseDetection } from "../../utils/poseDetectionFrontend";
import workoutService from "../../services/workoutService";
import CelebrationModal from "../LiveWorkout/CelebrationModal"; // Adjust path if needed

const LiveWorkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const exercise = location.state?.exercise || "";
  const mode = location.state?.mode || "";
  const level = location.state?.level || "Level 1";
  const levelId = location.state?.levelId;

  const targetReps = location.state?.targetReps || 0;
  const user_id = location.state?.user_id;

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [liveReps, setLiveReps] = useState(0);
  const [liveFormFeedback, setLiveFormFeedback] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (user_id) {
      fetch(`http://localhost:5001/user/stats?user_id=${user_id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user info");
          return res.json();
        })
        .then((data) => {
          console.log(data);
          setUserInfo(data);
        })
        .catch((err) => {
          console.error(err);
          alert("Error loading user data");
        });
    }
  }, [user_id]);
  useEffect(() => {
    console.log("useEffect triggered:", {
      isVideoReady,
      exercise,
      mode,
      userInfo,
    });
    if (!exercise || !mode || !user_id) {
      navigate("/dailychallenge");
      return;
    }

    if ((mode === "webcam" || mode === "video") && !isVideoReady) return;
    if (!userInfo) return;

    const runWorkout = async () => {
      console.log("runWorkout started");
      try {
        let workoutResult;

        if (mode === "webcam") {
          workoutResult = await handleWebcamMode(exercise, videoRef);
        } else {
          workoutResult = await handleVideoMode(exercise);
        }

        if (!workoutResult) {
          throw new Error("Workout detection returned no results");
        }

        const { score, accuracy, xp, feedback, reps, calories } = workoutResult;

        setResult(workoutResult);
        console.log("Workout log data:", {
          user_id,
          exercise,
          level,
          score,
          xp,
          reps,
          completed: true,
          calories,
        });

        setFeedbackMessage(feedback || "Good effort! Keep going!");

        await workoutService.logWorkout({
          user_id,
          exercise,
          level,
          score,
          xp,
          reps,
          completed: true,
          calories,
        });

        const todayProgress = await workoutService.getTodayProgress(user_id);

        if ((score >= 70 && xp >= 50) || reps >= targetReps) {
          await workoutService.unlockNextLevel({
            user_id,
            currentLevel: level,
          });

          // 🔓 Unlock next level locally using localStorage
          const levelId = parseInt(level.split(" ")[1]); // e.g., "Level 2" → 2
          const unlockedSoFar =
            parseInt(localStorage.getItem("unlockedLevels")) || 1;
          if (levelId >= unlockedSoFar) {
            localStorage.setItem("unlockedLevels", levelId + 1);
          }

          setShowCelebration(true); // ✅ Show modal instead of alert
        }
      } catch (error) {
        console.error("Workout error:", error);
        setResult({ error: error.message || "Workout failed. Try again." });
      } finally {
        // ✅ Stop the live video stream after workout ends
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
        }
        setIsLoading(false);
        console.log("runWorkout finished");
      }
    };

    runWorkout();
  }, [exercise, mode, level, user_id, navigate, isVideoReady]);

  const handleWebcamMode = async (exercise, videoRef) => {
    const video = videoRef.current;
    if (!video) throw new Error("Video element not found");

    await new Promise((resolve, reject) => {
      if (video.readyState >= 2) resolve();
      else {
        const onLoadedMetadata = () => {
          video.removeEventListener("loadedmetadata", onLoadedMetadata);
          resolve();
        };
        video.addEventListener("loadedmetadata", onLoadedMetadata);
      }
      setTimeout(() => reject(new Error("Video metadata load timeout")), 10000);
    });

    const detectionResult = await startPoseDetection(
      video,
      exercise,
      targetReps,
      ({ reps, formFeedback }) => {
        setLiveReps(reps);
        setLiveFormFeedback(formFeedback);
      },
      userInfo
    );

    if (!detectionResult) throw new Error("Pose detection failed or timed out");

    return {
      ...detectionResult,
      feedback: detectionResult.feedback || "Live detection complete!",
      reps: detectionResult.reps || 0,
    };
  };

  const handleVideoMode = async (exercise) => {
    console.log("useEffect triggered:", {
      isVideoReady,
      exercise,
      mode,
      userInfo,
    });
    const base64Video = localStorage.getItem("uploadedWorkoutVideo");
    if (!base64Video) throw new Error("No video uploaded");

    const response = await workoutService.uploadVideoDetection(
      base64Video,
      exercise
    );

    if (!response || !response.success) {
      throw new Error("Backend processing failed");
    }

    // Map backend response to frontend expected format
    const backendScore = response.score || {};

    const workoutResult = {
      score: backendScore.score || 0,
      accuracy: backendScore.accuracy || 0, // You can set default or calculate if needed
      xp: backendScore.xp || 0,
      feedback: backendScore.feedback || "Great job!",
      reps: response.reps || backendScore.reps || 0,
      calories: backendScore.calories || 0,
    };

    console.log("Video detection finished", workoutResult);

    return workoutResult;
  };

  useEffect(() => {
    let timeoutId;

    if (mode === "webcam" && videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
          video: true,
        })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current
            .play()
            .then(() => setIsVideoReady(true))
            .catch((err) => {
              console.error("Video play error:", err);
              setIsLoading(false);
              setResult({ error: "Unable to play video stream" });
            });
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setIsLoading(false);
          setResult({ error: "Camera access denied or not available" });
        });

      timeoutId = setTimeout(() => {
        if (!isVideoReady) {
          console.warn("Timeout: video not ready in time.");
          setIsLoading(false);
          setResult({ error: "Camera failed to load. Please try again." });
        }
      }, 10000);
    }

    return () => clearTimeout(timeoutId);
  }, [mode, isVideoReady]);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "40px auto" }}>
      <h2 style={{ fontSize: 24, textAlign: "center" }}>
        {level || exercise?.toUpperCase() || "Live Workout"}
      </h2>

      {mode === "webcam" && isLoading && (
        <div style={{ marginBottom: 16 }}>
          <h4>Live Camera Feed</h4>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%" }}
          />
          <div className="mt-4 text-lg font-medium">
            <p>
              🔁 Reps:{" "}
              <span className="font-bold text-green-600">{liveReps}</span>
            </p>
            <p>
              💡 Feedback:{" "}
              <span className="font-bold text-blue-600">
                {liveFormFeedback}
              </span>
            </p>
          </div>
        </div>
      )}

      {mode === "video" && isLoading && (
        <div style={{ marginBottom: 16 }}>
          <h4>Upload Workout Video</h4>
          <input
            type="file"
            accept="video/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = reader.result.split(",")[1]; // Strip off base64 header
                localStorage.setItem("uploadedWorkoutVideo", base64);
                setIsVideoReady(true); // ✅ Signal that we're ready to start
              };
              reader.readAsDataURL(file);
            }}
          />
          <p style={{ fontSize: 14, color: "#666" }}>
            Please upload a short workout video in MP4 or WebM format.
          </p>
        </div>
      )}

      {isLoading ? (
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div className="loader"></div>
          <p>Starting workout...</p>
        </div>
      ) : result?.error ? (
        <div
          style={{ color: "#dc2626", fontWeight: "600", textAlign: "center" }}
        >
          {result.error}
        </div>
      ) : (
        <>
          {showCelebration && (
            <CelebrationModal
              result={result}
              onRetry={() => window.location.reload()}
              onNext={() => {
                navigate("/adventure-map");
              }}
            />
          )}
        </>
      )}

      <button
        onClick={async () => {
          try {
            setIsLoading(true);
            const manualResult = await handleVideoMode(exercise);
            console.log("Manual handleVideoMode result1:", manualResult);
            setResult(manualResult);
            setFeedbackMessage(manualResult.feedback || "Good job!");
            setShowCelebration(true);
          } catch (error) {
            console.error("Manual handleVideoMode error:", error);
            setResult({ error: error.message || "Manual run failed" });
          } finally {
            setIsLoading(false);
          }
        }}
        style={{
          marginTop: 12,
          backgroundColor: "#10b981",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",

          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        Run video detection
      </button>
    </div>
  );
};

export default LiveWorkout;
