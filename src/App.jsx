import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Recorder from "./Recorder";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link style={{"color": "yellow"}} to="/">Recorder</Link> | <Link style={{"color": "yellow"}} to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Recorder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={() => window.location.href = "/admin"} />} />
      </Routes>
    </Router>
  );
}

export default App;
