import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Recorder from './Recorder';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import Register from './Register';
import Login from './Login';
import './App.css';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link style={{ color: 'yellow' }} to="/">Home</Link> |{' '}
        <Link style={{ color: 'yellow' }} to="/recorder">Recorder</Link> |{' '}
        <Link style={{ color: 'yellow' }} to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recorder" element={<Recorder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<AdminLogin onLogin={() => window.location.href = '/admin'} />} />
      </Routes>
    </Router>
  );
}

export default App;
