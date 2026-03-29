import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProtectedUrl.css';

function ProtectedUrl() {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if URL exists and is password protected
  useEffect(() => {
    const checkUrl = async () => {
      try {
        const response = await axios.get(`/api/urls/public/${shortCode}`);
        
        // If not password protected, redirect directly
        if (!response.data.isPasswordProtected) {
          window.location.href = `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${shortCode}`;
        }
      } catch (err) {
        setError(err.response?.data?.error || 'URL not found');
      }
    };

    checkUrl();
  }, [shortCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${shortCode}`,
        { password },
        { withCredentials: true }
      );

      window.location.href = `${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${shortCode}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  if (error && error !== 'Invalid password') {
    return (
      <div className="protected-url-container">
        <div className="protected-url-card error">
          <h1>❌ Error</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="protected-url-container">
      <div className="protected-url-card">
        <div className="lock-icon">🔒</div>
        <h1>Password Protected Link</h1>
        <p>This link is password protected. Please enter the password to access it.</p>
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="password">Enter Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Enter the password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || !password.trim()}
            className="submit-btn"
          >
            {loading ? 'Verifying...' : '✓ Access Link'}
          </button>
        </form>

        <p className="hint">
          💡 Tip: The link owner set a password to protect this content.
        </p>
      </div>
    </div>
  );
}

export default ProtectedUrl;
