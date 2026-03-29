import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Home.css';

function Home() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">🔗 URL Shortener</h1>
          <p className="hero-subtitle">Create short, shareable links and track detailed analytics</p>
          
          <div className="hero-features">
            <div className="feature">
              <span className="feature-icon">📊</span>
              <h3>Real-time Analytics</h3>
              <p>Track clicks, device info, location, and referrer data</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <h3>Password Protected</h3>
              <p>Secure your links with password protection</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎫</span>
              <h3>QR Codes</h3>
              <p>Generate and download QR codes for your shortened URLs</p>
            </div>
            <div className="feature">
              <span className="feature-icon">⏰</span>
              <h3>Expiry Dates</h3>
              <p>Set expiration dates on your shortened links</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🏷️</span>
              <h3>Organize with Tags</h3>
              <p>Categorize your URLs with custom tags</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📥</span>
              <h3>Export Data</h3>
              <p>Download your analytics as CSV files</p>
            </div>
          </div>

          <div className="hero-cta">
            {isAuthenticated ? (
              <Link to="/dashboard" className="cta-button cta-primary">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="cta-button cta-primary">
                  Get Started Free →
                </Link>
                <Link to="/login" className="cta-button cta-secondary">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <p className="hero-note">
            ✨ No credit card required • Start shortening URLs immediately
          </p>
        </div>
      </div>

      <div className="home-info">
        <div className="info-section">
          <h2>Why use URL Shortener?</h2>
          <ul>
            <li>✓ Make long URLs short and memorable</li>
            <li>✓ Track who clicks your links and from where</li>
            <li>✓ Protect sensitive URLs with passwords</li>
            <li>✓ Generate QR codes for offline sharing</li>
            <li>✓ Add expiry dates to time-sensitive links</li>
            <li>✓ Organize URLs with tags and collections</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>How it works</h2>
          <ol>
            <li><strong>Create:</strong> Paste your long URL and optionally customize it</li>
            <li><strong>Configure:</strong> Add password, tags, expiry date, or other options</li>
            <li><strong>Share:</strong> Copy the short link or generate a QR code</li>
            <li><strong>Track:</strong> Monitor clicks, locations, and device information</li>
            <li><strong>Analyze:</strong> View comprehensive analytics in your dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Home;
