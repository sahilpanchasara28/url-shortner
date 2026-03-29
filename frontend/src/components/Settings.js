import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setFullName(user?.fullName || '');
    setTheme(user?.theme || 'light');
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({
        fullName,
        theme
      });
      localStorage.setItem('theme', theme);
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
      setMessage('✓ Settings updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>⚙️ User Settings</h2>

      {message && <div className={`message ${message.startsWith('✓') ? 'success' : 'error'}`}>{message}</div>}

      <div className="settings-group">
        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="settings-group">
        <label>Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={loading}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <button className="save-btn" onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </button>

      <hr style={{ margin: '2rem 0' }} />

      <h3>📱 Account Security</h3>
      <div className="security-info">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h3>📊 Account Statistics</h3>
      <div className="stats-grid">
        <div className="stat">
          <h4>Total URLs Created</h4>
          <p className="stat-value">{user?.totalUrls || 0}</p>
        </div>
        <div className="stat">
          <h4>Total Clicks</h4>
          <p className="stat-value">{user?.totalClicks || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
