import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import "./styles/main.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
