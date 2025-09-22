import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './App.css';

function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name.trim() || !password.trim() || !gender) {
      setError('Name, password, and gender are required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          password: password.trim(),
          gender
        })
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('gender', result.gender);
        // Show success feedback before navigating
        setTimeout(() => navigate('/recorder'), 500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Error registering. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join our community to get started</p>
        </div>
        
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="name">Unique Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter unique name"
              required
              className={name ? 'has-value' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className={password ? 'has-value' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender:</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className={gender ? 'has-value' : ''}
            >
              <option value="">-- Select Gender --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className={`btn btn-auth ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;