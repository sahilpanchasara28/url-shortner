import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import UrlShortener from '../components/UrlShortener';
import Analytics from '../components/Analytics';
import Settings from '../components/Settings';
import './Dashboard.css';

const Dashboard = () => {
  const { user, token, logout, getCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shorten');

  const refreshStats = useCallback(() => {
    if (token) {
      getCurrentUser();
    }
  }, [token, getCurrentUser]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>Welcome, {user?.fullName || user?.email}</h2>
          <p>Total URLs: {user?.totalUrls || 0} | Total Clicks: {user?.totalClicks || 0}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'shorten' ? 'active' : ''}`}
          onClick={() => setActiveTab('shorten')}
        >
          📝 Shorten URL
        </button>
        <button
          className={`nav-tab ${activeTab === 'my-urls' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-urls')}
        >
          📊 My URLs & Analytics
        </button>
        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <div className="dashboard-content">
        {activeTab === 'shorten' && <UrlShortener isAuthenticated={true} onUrlCreated={refreshStats} />}
        {activeTab === 'my-urls' && <Analytics isPersonal={true} onUrlsChanged={refreshStats} />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default Dashboard;
