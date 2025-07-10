import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const isLoggedIn = !!localStorage.getItem("email"); // check if logged in

  return (
    <section className="home-hero">
      <div className="home-content">
        <h1>WELCOME TO FITTRACKER</h1>
        <p>Level up your health, one challenge at a time.</p>
        <div className="home-buttons">
          {isLoggedIn ? (
            // If logged in, show the Login button
            <Link to="/register" className="home-button">
              Get Started &nbsp; &nbsp;→
            </Link>
          ) : (
            // If NOT logged in, show the Register button
            <Link to="/signup" className="home-button">
              Unlock Fitness Mode &nbsp; &nbsp;<strong>→</strong>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
