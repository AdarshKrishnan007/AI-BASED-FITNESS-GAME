import apiFetch from "./api";

function base64ToBlob(base64String) {
  let byteString;
  let mimeString = "video/mp4"; // Default fallback

  // Handle full Base64 Data URL
  if (base64String.includes("base64,")) {
    const parts = base64String.split(",");
    byteString = atob(parts[1]);
    mimeString = parts[0].match(/data:(.*);base64/)[1];
  } else {
    // Handle raw base64 (no prefix)
    byteString = atob(base64String);
  }

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

const workoutService = {
  startLiveDetection: (exercise) => {
    const user_id = localStorage.getItem("email");
    if (!user_id) throw new Error("User not logged in or missing user_id");

    return apiFetch("/start", {
      method: "POST",
      body: {
        user_id,
        type: exercise,
      },
    });
  },

  uploadVideoDetection: (base64String, exercise) => {
    const formData = new FormData();

    const blob = base64ToBlob(base64String);
    const file = new File([blob], "workout.mp4", { type: "video/mp4" });

    const user_id = localStorage.getItem("email"); // 👈 Add this

    formData.append("video", file);
    formData.append("exercise", exercise);
    formData.append("user_id", user_id); // 👈 Send it to Flask

    return apiFetch("/upload", {
      method: "POST",
      body: formData,
      isForm: true,
    });
  },

  logWorkout: (data) =>
    apiFetch("/workout/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    }),

  getTodayProgress: () => {
    const user_id = localStorage.getItem("email");
    return apiFetch("/workout/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { user_id },
    });
  },
  unlockNextLevel: ({ user_id, currentLevel }) => {
    return apiFetch("/workout/unlock-level", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: { user_id, currentLevel },
    });
  },
};

export default workoutService;
