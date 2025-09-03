import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="home-wrapper">
      <h1>Welcome to Quran Ayat Recording System</h1>
      <div className="auth-buttons">
        <Link to="/register">
          <button className="btn btn-auth">Register</button>
        </Link>
        <Link to="/login">
          <button className="btn btn-auth">Login</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
