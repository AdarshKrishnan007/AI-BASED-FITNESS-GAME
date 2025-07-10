import * as tf from "@tensorflow/tfjs";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

let detector;

// let audio = {
//   good: new Audio("/audio/good.mp3"),
//   bad: new Audio("/audio/bad.mp3"),
// };

export async function loadModel() {
  await tf.setBackend("webgl");
  await tf.ready();
  detector = await posedetection.createDetector(
    posedetection.SupportedModels.MoveNet,
    {
      modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    }
  );
}

let lastSpokenTime = 0;
let cooldown = 1000; // 1 second cooldown to prevent overlap

function speakFeedback(msg) {
  const now = Date.now();

  // Prevent overlapping or repeating too fast
  if (now - lastSpokenTime < cooldown) return;
  lastSpokenTime = now;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(msg);
  speech.volume = 1;
  speech.pitch = 1;
  speech.rate = 1;
  window.speechSynthesis.speak(speech);
}

// Helper to get x/y of a keypoint
function getXY(keypoints, name) {
  const kp = keypoints.find((k) => k.name === name);
  return { x: kp?.x || 0, y: kp?.y || 0, score: kp?.score || 0 };
}
function getAngle(A, B, C) {
  // Vectors: BA and BC
  const BAx = A.x - B.x;
  const BAy = A.y - B.y;
  const BCx = C.x - B.x;
  const BCy = C.y - B.y;

  const dotProduct = BAx * BCx + BAy * BCy;
  const magBA = Math.sqrt(BAx ** 2 + BAy ** 2);
  const magBC = Math.sqrt(BCx ** 2 + BCy ** 2);

  if (magBA === 0 || magBC === 0) return 0;

  const angleRad = Math.acos(dotProduct / (magBA * magBC));
  return angleRad * (180 / Math.PI); // Convert to degrees
}

// Basic keypoint reliability check
function isReliable(kp, threshold = 0.5) {
  return kp.score >= threshold;
}

// Exercise handlers
const exerciseHandlers = {
  squat: (k, state) => {
    const lHip = getXY(k, "left_hip");
    const lKnee = getXY(k, "left_knee");
    const lAnkle = getXY(k, "left_ankle");
    const rHip = getXY(k, "right_hip");
    const rKnee = getXY(k, "right_knee");
    const rAnkle = getXY(k, "right_ankle");

    // Ensure data is reliable
    if (
      !isReliable(lHip) ||
      !isReliable(lKnee) ||
      !isReliable(lAnkle) ||
      !isReliable(rHip) ||
      !isReliable(rKnee) ||
      !isReliable(rAnkle)
    )
      return {};

    // Helper: Calculate knee angle
    const getAngle = (a, b, c) => {
      const ab = { x: a.x - b.x, y: a.y - b.y };
      const cb = { x: c.x - b.x, y: c.y - b.y };
      const dot = ab.x * cb.x + ab.y * cb.y;
      const magAB = Math.hypot(ab.x, ab.y);
      const magCB = Math.hypot(cb.x, cb.y);
      const angle = Math.acos(dot / (magAB * magCB));
      return (angle * 180) / Math.PI;
    };

    const leftKneeAngle = getAngle(lHip, lKnee, lAnkle);
    const rightKneeAngle = getAngle(rHip, rKnee, rAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

    const isDown = avgKneeAngle < 100; // <100° indicates squat bottom
    const isUp = avgKneeAngle > 160; // >160° indicates standing

    // DOWN phase
    if (!state.down) {
      if (isDown) {
        state.downCount = (state.downCount || 0) + 1;
        if (state.downCount > 4) {
          state.down = true;
          state.downCount = 0;
          speakFeedback("Good depth!");
          return { feedback: "Squat depth reached!", repCounted: false };
        }
      } else {
        state.downCount = 0;
        return { feedback: "Go deeper!", scorePenalty: 1 };
      }
    }

    // UP phase
    else {
      if (isUp) {
        state.upCount = (state.upCount || 0) + 1;
        if (state.upCount > 4) {
          state.down = false;
          state.upCount = 0;
          speakFeedback("Squat counted!");
          return { feedback: "Squat counted!", repCounted: true };
        }
      } else {
        state.upCount = 0;
      }
    }

    return {};
  },

  jump: (k, state) => {
    const hip = getXY(k, "left_hip");
    if (!isReliable(hip)) return {};

    if (state.prevHipY == null) state.prevHipY = hip.y;

    const jumpHeight = state.prevHipY - hip.y;
    const jumpUp = jumpHeight > 20;
    const weakJump = jumpHeight > 5 && jumpHeight <= 20; // Low effort jump
    const land = hip.y - state.prevHipY > 10;

    // Weak jump form penalty
    if (!state.jumping && weakJump) {
      speakFeedback("Jump higher!");
      return {
        feedback: "Jump higher!",
        scorePenalty: 1,
        repCounted: false,
      };
    }

    // Good jump detected
    if (!state.jumping && jumpUp) {
      state.jumping = true;
      speakFeedback("Nice jump!");
      return { feedback: "Nice jump!" };
    }

    // Landing after jump
    if (state.jumping && land) {
      state.jumping = false;
      speakFeedback("Jump counted!");
      return { feedback: "Jump counted!", repCounted: true };
    }

    state.prevHipY = hip.y;
    return {};
  },

  pushup: (k, state) => {
    const shoulder = getXY(k, "left_shoulder");
    const elbow = getXY(k, "left_elbow");
    const wrist = getXY(k, "left_wrist");
    const hip = getXY(k, "left_hip");

    if (
      !isReliable(shoulder) ||
      !isReliable(elbow) ||
      !isReliable(wrist) ||
      !isReliable(hip)
    )
      return {};

    // Helper: calculate angle between 3 points
    const getAngle = (a, b, c) => {
      const ab = { x: a.x - b.x, y: a.y - b.y };
      const cb = { x: c.x - b.x, y: c.y - b.y };
      const dot = ab.x * cb.x + ab.y * cb.y;
      const magAB = Math.hypot(ab.x, ab.y);
      const magCB = Math.hypot(cb.x, cb.y);
      const angle = Math.acos(dot / (magAB * magCB));
      return (angle * 180) / Math.PI;
    };

    const elbowAngle = getAngle(shoulder, elbow, wrist);
    const bodyAngle = getAngle(shoulder, hip, { x: hip.x, y: hip.y + 0.1 }); // vertical approx

    // Thresholds for down/up phase:
    const downThreshold = 90; // elbow angle less than 90° means pushup down phase
    const upThreshold = 160; // elbow angle more than 160° means pushup up phase

    state.downCount = state.downCount || 0;
    state.upCount = state.upCount || 0;

    // Detect pushup DOWN phase
    if (!state.down) {
      if (elbowAngle < downThreshold) {
        state.downCount++;
        if (state.downCount > 3) {
          state.down = true;
          state.downCount = 0;
          speakFeedback("Good pushup depth!");
          return { feedback: "Good pushup depth!", repCounted: false };
        }
      } else {
        state.downCount = 0;
        return { feedback: "Lower your chest!", scorePenalty: 1 };
      }
    }
    // Detect pushup UP phase
    else {
      if (elbowAngle > upThreshold) {
        state.upCount++;
        if (state.upCount > 4) {
          state.down = false;
          state.upCount = 0;
          speakFeedback("Pushup counted!");
          return { feedback: "Pushup counted!", repCounted: true };
        }
      } else {
        state.upCount = 0;
      }
    }

    return {};
  },

  plank: (poseKeypoints, state) => {
    const now = Date.now();
    const deltaTime = now - (state.lastUpdateTime || now);
    state.lastUpdateTime = now;

    const getXY = (keypoints, name) => {
      const kp = keypoints.find((k) => k.name === name);
      return kp && kp.score > 0.5 ? { x: kp.x, y: kp.y } : null;
    };

    const isReliable = (point) =>
      point && typeof point.x === "number" && typeof point.y === "number";

    const shoulder = getXY(poseKeypoints, "left_shoulder");
    const hip = getXY(poseKeypoints, "left_hip");

    if (!isReliable(shoulder) || !isReliable(hip)) {
      state.plankHoldTime = 0;
      state.lastPlankSecond = 0;
      return {};
    }

    const hipDrop = hip.y - shoulder.y;

    // Simple range check for proper plank posture
    if (hipDrop > 100 || hipDrop < 5) {
      state.plankHoldTime = 0;
      state.lastPlankSecond = 0;
      return {
        feedback: "Align your hips to your shoulders!",
        repCounted: false,
      };
    }

    // Good posture → accumulate time
    state.plankHoldTime = (state.plankHoldTime || 0) + deltaTime;

    const secondsHeld = Math.floor(state.plankHoldTime / 1000);

    if (secondsHeld > (state.lastPlankSecond || 0)) {
      state.lastPlankSecond = secondsHeld;
      state.plankReps = (state.plankReps || 0) + 1;

      const msg = `Holding plank: ${secondsHeld}s`;
      speakFeedback(msg);
      console.log("✔️ Plank reps:", state.plankReps);

      return { feedback: msg, repCounted: true };
    }

    return {};
  },
};
let lastStandInViewTime = 0;
export async function startPoseDetection(
  videoElement,
  exercise,
  targetReps,
  feedbackCallback = null,
  userInfo
) {
  if (!detector) await loadModel();

  if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
    await new Promise((resolve) => {
      const checkReady = () => {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          resolve();
        } else {
          requestAnimationFrame(checkReady); // Keep checking
        }
      };
      videoElement.onloadedmetadata = checkReady;
      checkReady();
    });
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let totalScore = 500;
  let badFormCount = 0;
  let repCount = 0;
  const state = {};
  const MET_VALUES = {
    pushup: 8,
    squat: 7,
    plank: 5,
    jumping_jack: 8,
    // add more as needed
  };
  let workoutComplete = false; // ✅ Add flag to stop detection

  const workoutStartTime = Date.now();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      document.body.removeChild(canvas);
      return resolve(null);
    }, 300000);

    const detect = async () => {
      if (workoutComplete) return; // ✅ Stop further frames

      const poses = await detector.estimatePoses(videoElement);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "20px Arial";
      if (
        !poses ||
        !Array.isArray(poses) ||
        poses.length === 0 ||
        !poses[0]?.keypoints ||
        poses[0].keypoints.length === 0
      ) {
        ctx.fillStyle = "red";

        const now = Date.now();
        if (now - lastStandInViewTime > 4000) {
          lastStandInViewTime = now;
        }

        requestAnimationFrame(detect);
        return;
      }

      const pose = poses[0];

      const handler = exerciseHandlers[exercise];
      if (!handler) throw new Error("Unsupported exercise: " + exercise);

      const result = handler(pose.keypoints, state);

      if (result.feedback) {
        ctx.fillStyle = result.scorePenalty ? "red" : "green";
        ctx.fillText(result.feedback, 10, 30);
        speakFeedback(result.feedback);
      }

      if (result.scorePenalty) {
        totalScore -= result.scorePenalty;
      }

      if (result.repCounted) {
        repCount++;

        // ✅ Count bad form once per rep based on presence of scorePenalty
        const isBadForm = result.scorePenalty ? true : false;

        if (isBadForm) {
          badFormCount++;
        }

        speakFeedback(`Rep ${repCount} completed!`);
      }

      if (typeof feedbackCallback === "function") {
        feedbackCallback({
          reps: repCount,
          formFeedback: result.feedback,
        });
      }

      if (repCount >= targetReps) {
        workoutComplete = true; // ✅ Set flag to stop further detection
        clearTimeout(timeout);
        document.body.removeChild(canvas);

        window.speechSynthesis.cancel();

        const workoutEndTime = Date.now();
        const durationMinutes = (workoutEndTime - workoutStartTime) / 60000;

        let rawAccuracy = ((targetReps - badFormCount) / targetReps) * 100;
        let adjustedAccuracy = Math.max(30, Math.min(rawAccuracy, 95)); // clamp between 30 and 95

        let level = "";
        if (adjustedAccuracy < 40) level = "Weak";
        else if (adjustedAccuracy < 60) level = "Beginner";
        else if (adjustedAccuracy < 80) level = "Intermediate";
        else level = "Advanced";

        const formQuality = badFormCount / targetReps;
        console.log("Target Reps:", targetReps);
        console.log("Bad Form Count:", badFormCount);
        console.log("Form Quality:", formQuality);

        let feedback = "Perfect form!";
        if (formQuality > 0.5) {
          feedback = "Work on your form!";
        } else if (formQuality > 0.25) {
          feedback = "Try better form next time!";
        } else if (formQuality > 0.1) {
          feedback = "Pretty good form!";
        }

        // Calories calculation with gender factor
        const genderFactor =
          userInfo?.gender?.toLowerCase() === "male" ? 1 : 0.95;
        const met = MET_VALUES[exercise.toLowerCase()] || 6;
        const caloriesBurned =
          met *
          (userInfo?.weight || 70) *
          (durationMinutes / 60) *
          genderFactor;

        return resolve({
          score: Math.max(0, totalScore),
          accuracy: Math.floor(adjustedAccuracy),
          xp: Math.floor(Math.max(0, totalScore * 0.8)),
          feedback:
            badFormCount > 0 ? "Try better form next time!" : "Perfect form!",
          reps: repCount,
          badFormCount,
          calories: caloriesBurned.toFixed(2),
          durationMinutes: durationMinutes.toFixed(2),
        });
      }

      requestAnimationFrame(detect);
    };

    detect();
  });
}
