import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Profile from "../pages/Profile/Profile";
import DailyChallenge from "../pages/DailyChallenge/DailyChallenge";
import LiveWorkout from "../pages/LiveWorkout/LiveWorkout";
import ExerciseSelector from "../pages/LiveWorkout/ExerciseSelector";
import AdventureMap from "../pages/AdventureMap/AdventureMap";

import Leaderboard from "../pages/Leaderboard/Leaderboard";
import Login from "../pages/Login/login";
import Signup from "../pages/signup/signup";
import Logout from "../pages/Login/logout";
import RegisterUserData from "../pages/Setup/RegisterUserData";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/daily-challenge" element={<DailyChallenge />} />
      <Route path="/select-workout" element={<ExerciseSelector />} />
      <Route path="/register" element={<RegisterUserData />} />
      <Route path="/live-workout" element={<LiveWorkout />} />
      <Route path="/adventure-map" element={<AdventureMap />} />

      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default AppRoutes;
