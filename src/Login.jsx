import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Login() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          password: password.trim() 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Faster response checking - don't wait for JSON parsing for non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        setError(errorData.error || 'Login failed');
        setLoading(false);
        return;
      }

      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem('token', result.token);
        navigate('/bulk-recording');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Error logging in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button 
            type="submit" 
            className="btn btn-auth"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="switch-auth">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;