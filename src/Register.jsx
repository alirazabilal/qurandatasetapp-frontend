import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !password.trim()) {
      setError('Name and password are required');
      return;
    }

    try {
      const response = await fetch('https://qurandatasetapp-backend-1.onrender.com/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), password: password.trim() })
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('token', result.token);
        navigate('/recorder');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Error registering. Please try again.');
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label>Unique Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter unique name"
            required
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
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-auth">Register</button>
      </form>
      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}


export default Register;
