import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './Home';
import Recorder from './Recorder';
import Admin from './Admin';
import AdminLogin from './AdminLogin';
import Register from './Register';
import Login from './Login';
import './App.css';

// Enhanced Navbar Component
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📖</span>
          Quran Recorder
        </Link>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/recorder" 
            className={`navbar-link ${location.pathname === '/recorder' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Recorder
          </Link>
          <Link 
            to="/admin" 
            className={`navbar-link ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Admin
          </Link>
          <Link 
            to="/login" 
            className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className={`navbar-link ${location.pathname === '/register' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Register
          </Link>
        </div>
        
        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-bar"></span>
          <span className="navbar-toggle-bar"></span>
          <span className="navbar-toggle-bar"></span>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
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