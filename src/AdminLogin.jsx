import React, { useState } from "react";

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch("https://qurandatasetapp-backend-1.onrender.com/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("adminToken", data.token);
        onLogin();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Error logging in. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Admin Login</h2>
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="message error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`btn btn-auth ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-content">
                <span className="spinner"></span>
                Processing...
              </span>
            ) : (
              "Login"
            )}
          </button>

          {isLoading && (
            <div className="message info-message">
              This may take a moment. Please wait...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;