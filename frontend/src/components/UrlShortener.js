import React, { useState, useContext } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { AuthContext } from '../context/AuthContext';
import './UrlShortener.css';

const UrlShortener = ({ isAuthenticated, onUrlCreated }) => {
  const { token } = useContext(AuthContext);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [password, setPassword] = useState('');
  const [tags, setTags] = useState('');
  const [collection, setCollection] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [shortUrl, setShortUrl] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleShorten = async () => {
    setError('');
    setShortUrl(null);
    setCopied(false);

    if (!originalUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        originalUrl,
        customCode: customCode.trim() || undefined,
        password: password || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        collection: collection.trim() || undefined,
        description: description || undefined,
        expiresAt: expiresAt || undefined,
        isPublic
      };

      console.log('📤 Sending request to backend:', requestData);
      
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.post('/api/urls/shorten', requestData, config);

      console.log('📥 Received response from backend:', response.data);

      setShortUrl(response.data);
      onUrlCreated?.();
      setOriginalUrl('');
      setCustomCode('');
      setPassword('');
      setTags('');
      setCollection('');
      setDescription('');
      setExpiresAt('');
      setIsPublic(true);
    } catch (err) {
      console.error('❌ Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error creating short URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (shortUrl) {
      const qrElement = document.getElementById('qrCode');
      const canvas = qrElement.querySelector('canvas');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${shortUrl.shortCode}-qr.png`;
      link.click();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAdvanced) {
      handleShorten();
    }
  };

  return (
    <div className="shortener-card">
      <h2>✂️ Shorten Your URL</h2>

      <div className="form-group">
        <label>Original URL *</label>
        <input
          type="text"
          placeholder="https://example.com/very/long/url"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Custom Code (Optional)</label>
          <input
            type="text"
            placeholder="mycode"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
      </div>

      <button 
        className="advanced-toggle"
        onClick={() => setShowAdvanced(!showAdvanced)}
        type="button"
      >
        {showAdvanced ? '▼' : '▶'} Advanced Options
      </button>

      {showAdvanced && (
        <div className="advanced-options">
          <div className="form-group">
            <label>Password Protection</label>
            <input
              type="password"
              placeholder="Leave empty for no password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="work, important, personal"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Collection</label>
            <input
              type="text"
              placeholder="marketing, clients, personal"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Add a description for this link"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Expires At (Optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="advanced-checkboxes">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  disabled={loading}
                />
                <span>Public analytics access</span>
              </label>
            </div>

          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button
        className="shorten-btn"
        onClick={handleShorten}
        disabled={loading}
      >
        {loading ? 'Shortening...' : '🚀 Shorten URL'}
      </button>

      {shortUrl && (
        <div className="result">
          <div className="result-header">
            <span className="label">✅ {shortUrl.message || 'URL Shortened!'}</span>
          </div>

          {shortUrl.isPasswordProtected && (
            <div className="result-item password-protected-banner">
              🔐 <strong>Password Protected</strong> - Users must enter password to access this link
            </div>
          )}

          <div className="qr-section" id="qrCode">
            <QRCode 
              value={shortUrl.shortUrl} 
              size={200}
              level="H"
              includeMargin={true}
            />
            <button className="download-qr" onClick={downloadQR}>
              📥 Download QR
            </button>
          </div>

          <div className="result-item">
            <span className="label">Short URL:</span>
            <div className="result-content">
              <a href={shortUrl.shortUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl.shortUrl}
              </a>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
          </div>

          <div className="result-item">
            <span className="label">Short Code:</span>
            <span className="code">{shortUrl.shortCode}</span>
          </div>

          {shortUrl.tags?.length > 0 && (
            <div className="result-item">
              <span className="label">Tags:</span>
              <div className="tags-display">
                {shortUrl.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {shortUrl.collection && (
            <div className="result-item">
              <span className="label">Collection:</span>
              <span>{shortUrl.collection}</span>
            </div>
          )}

          <div className="result-item">
            <span className="label">Visibility:</span>
            <span>{shortUrl.isPublic ? 'Public analytics' : 'Private analytics'}</span>
          </div>

          <div className="result-item">
            <span className="label">Created:</span>
            <span>{new Date(shortUrl.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlShortener;
