import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import "./CelebrationModal.css";

const CelebrationModal = ({ result, onRetry, onNext }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);

    const applause = new Audio("/sounds/applause.mp3");
    applause.play().catch((err) => {
      console.warn("Autoplay failed:", err);
    });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Confetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={300}
        recycle={false}
      />

      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">🎉 Level Completed!</h2>
          <div className="result-grid">
            <p>
              <strong>Feedback:</strong> {result?.feedback}
            </p>
            <p>
              <strong>XP:</strong> {result?.xp}
            </p>
            <p>
              <strong>Score:</strong> {result?.score}
            </p>
            <p>
              <strong>Accuracy:</strong> {result?.accuracy}%
            </p>
            <p>
              <strong>Calories:</strong> {result?.calories} kcal
            </p>
            <p>
              <strong>Reps:</strong> {result?.reps}
            </p>
          </div>

          <div className="button-group">
            <button className="retry-btn" onClick={onRetry}>
              Retry
            </button>
            <button className="next-btn" onClick={onNext}>
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelebrationModal;
