// Let's start with the first step: user registration of height, weight, and fitness goal.

// === STEP 1: RegisterUserData.js ===

// File: src/pages/Setup/RegisterUserData.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterUserData.css";

const RegisterUserData = () => {
  // const { setUserData } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: " ",
    age: "",
    height: "",
    weight: "",
    goal: "maintain",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user_id = localStorage.getItem("user_id"); // or however you're storing it

    try {
      const response = await fetch("http://localhost:5001/user/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, ...formData }),
      });

      const result = await response.json();
      if (result.success) {
        navigate("/login");
      } else {
        alert("Failed to save profile: " + result.message || result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving profile");
    }
  };

  return (
    <div className="register-card">
      <h2 className="register-card-title">Set Up Your Fitness Profile</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div>
          <label className="register-label">Name</label>
          <input
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age || ""}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Gender</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            required
            className="register-select"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="register-label">Height (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
            className="register-input"
          />
        </div>
        <div>
          <label className="register-label">Goal</label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="register-select"
          >
            <option value="lose">Lose Weight</option>
            <option value="gain">Gain Weight</option>
            <option value="maintain">Maintain</option>
          </select>
        </div>
        <button type="submit" className="register-button">
          Continue
        </button>
      </form>
    </div>
  );
};

export default RegisterUserData;
