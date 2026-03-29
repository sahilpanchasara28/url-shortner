import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Analytics.css';

const Analytics = ({ isPersonal, onUrlsChanged }) => {
  const { token } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [allCollections, setAllCollections] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [detailsByCode, setDetailsByCode] = useState({});
  const [loadingDetailsCode, setLoadingDetailsCode] = useState('');
  const [sortBy, setSortBy] = useState('clicks'); // 'clicks', 'created', 'code'

  const fetchUserUrls = useCallback(async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('/api/urls/user/urls', config);
      setAnalytics(response.data);
      
      // Extract all unique tags
      const tags = new Set();
      response.data.forEach(url => {
        url.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));

      const collections = new Set();
      response.data.forEach(url => {
        if (url.collection) {
          collections.add(url.collection);
        }
      });
      setAllCollections(Array.from(collections));
    } catch (err) {
      setError('Error fetching your URLs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isPersonal && token) {
      fetchUserUrls();
    }
  }, [isPersonal, token, fetchUserUrls]);

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setError('Please enter a short code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(`/api/urls/analytics/${searchCode}`, {}, config);
      setAnalytics([response.data]);
      setDetailsByCode({ [response.data.shortCode]: response.data });
      setSearchCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'URL not found');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shortCode) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/urls/${shortCode}`, config);
        setAnalytics(analytics.filter(a => a.shortCode !== shortCode));
        setSelectedUrl(null);
        setDetailsByCode((current) => {
          const next = { ...current };
          delete next[shortCode];
          return next;
        });
        onUrlsChanged?.();
      } catch (err) {
        setError('Error deleting URL');
      }
    }
  };

  const fetchDetailedAnalytics = useCallback(async (shortCode) => {
    try {
      setLoadingDetailsCode(shortCode);
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.post(`/api/urls/analytics/${shortCode}`, {}, config);
      setDetailsByCode((current) => ({ ...current, [shortCode]: response.data }));
    } catch (err) {
      setError(err.response?.data?.error || 'Error fetching detailed analytics');
    } finally {
      setLoadingDetailsCode('');
    }
  }, [token]);

  const handleExport = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' };
      const response = await axios.get('/api/urls/user/export', config);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'urls.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Error exporting URLs');
    }
  };

  let filteredAnalytics = analytics;

  if (filterTag) {
    filteredAnalytics = filteredAnalytics.filter(url => url.tags?.includes(filterTag));
  }

  if (filterCollection) {
    filteredAnalytics = filteredAnalytics.filter(url => url.collection === filterCollection);
  }

  // Sort
  filteredAnalytics = [...filteredAnalytics].sort((a, b) => {
    if (sortBy === 'clicks') return b.clicks - a.clicks;
    if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'code') return a.shortCode.localeCompare(b.shortCode);
    return 0;
  });

  const totalClicks = analytics.reduce((sum, url) => sum + url.clicks, 0);
  const topUrl = analytics.reduce((max, url) => url.clicks > (max?.clicks || 0) ? url : max, null);
  const privateUrlCount = analytics.filter((url) => url.isPublic === false).length;
  const protectedUrlCount = analytics.filter((url) => url.isPasswordProtected).length;

  const formatMetricList = (metricMap = {}) => {
    const entries = Object.entries(metricMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (entries.length === 0) {
      return <p className="metric-empty">No data yet.</p>;
    }

    return (
      <div className="metric-list">
        {entries.map(([label, count]) => (
          <div key={label} className="metric-item">
            <span>{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
    );
  };

  const toggleSelectedUrl = async (url) => {
    if (selectedUrl?.shortCode === url.shortCode) {
      setSelectedUrl(null);
      return;
    }

    setSelectedUrl(url);
    if (!detailsByCode[url.shortCode]) {
      await fetchDetailedAnalytics(url.shortCode);
    }
  };

  return (
    <div className="analytics-container">
      <h2>📊 Analytics Dashboard</h2>

      {isPersonal && (
        <div className="user-stats">
          <div className="stat-card">
            <h3>Total URLs</h3>
            <p className="stat-number">{analytics.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Clicks</h3>
            <p className="stat-number">{totalClicks}</p>
          </div>
          <div className="stat-card">
            <h3>Average Clicks/URL</h3>
            <p className="stat-number">
              {analytics.length > 0 ? (totalClicks / analytics.length).toFixed(1) : 0}
            </p>
          </div>
          <div className="stat-card">
            <h3>Top URL</h3>
            <p className="stat-code">{topUrl?.shortCode || '-'}</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>{topUrl?.clicks || 0} clicks</p>
          </div>
          <div className="stat-card">
            <h3>Private URLs</h3>
            <p className="stat-number">{privateUrlCount}</p>
          </div>
          <div className="stat-card">
            <h3>Protected URLs</h3>
            <p className="stat-number">{protectedUrlCount}</p>
          </div>
        </div>
      )}

      <div className="controls-section">
        {isPersonal ? (
          <>
            <div className="filter-group">
              {allTags.length > 0 && (
                <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}
              {allCollections.length > 0 && (
                <select value={filterCollection} onChange={(e) => setFilterCollection(e.target.value)}>
                  <option value="">All Collections</option>
                  {allCollections.map(collection => (
                    <option key={collection} value={collection}>{collection}</option>
                  ))}
                </select>
              )}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="clicks">Sort by Clicks</option>
                <option value="created">Sort by Date</option>
                <option value="code">Sort by Code</option>
              </select>
              <button className="export-btn" onClick={handleExport}>
                📥 Export CSV
              </button>
            </div>
          </>
        ) : (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by short code..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {filteredAnalytics.length > 0 ? (
        <div className="analytics-grid">
          {filteredAnalytics.map((url) => (
            <div
              key={url.shortCode}
              className="url-card"
              onClick={() => toggleSelectedUrl(url)}
            >
              <div className="url-card-header">
                <a href={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}/${url.shortCode}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="short-code"
                >
                  {url.shortCode}
                </a>
                <span className="click-badge">{url.clicks} clicks</span>
              </div>

              <div className="url-card-body">
                <p className="original-url" title={url.originalUrl}>
                  {url.originalUrl.length > 50
                    ? url.originalUrl.substring(0, 50) + '...'
                    : url.originalUrl}
                </p>
                {url.tags?.length > 0 && (
                  <div className="tags">
                    {url.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="meta-badges">
                  {url.collection && <span className="meta-badge">Collection: {url.collection}</span>}
                  <span className={`meta-badge ${url.isPublic ? 'is-public' : 'is-private'}`}>
                    {url.isPublic ? 'Public' : 'Private'}
                  </span>
                  {url.isPasswordProtected && <span className="meta-badge is-protected">Password Protected</span>}
                </div>
                <p className="created-date">
                  📅 {new Date(url.createdAt).toLocaleDateString()}
                </p>
              </div>

              {selectedUrl?.shortCode === url.shortCode && (
                <div className="url-card-details">
                  <div className="details-row">
                    <span>Original URL:</span>
                    <a href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                      {url.originalUrl}
                    </a>
                  </div>
                  {url.description && (
                    <div className="details-row">
                      <span>Description:</span>
                      <p>{url.description}</p>
                    </div>
                  )}
                  {url.collection && (
                    <div className="details-row">
                      <span>Collection:</span>
                      <p>{url.collection}</p>
                    </div>
                  )}
                  <div className="details-row">
                    <span>Created:</span>
                    <p>{new Date(url.createdAt).toLocaleString()}</p>
                  </div>
                  {url.expiresAt && (
                    <div className="details-row">
                      <span>Expires:</span>
                      <p>{new Date(url.expiresAt).toLocaleString()}</p>
                    </div>
                  )}
                  <div className="details-row">
                    <span>Visibility:</span>
                    <p>{url.isPublic ? 'Public analytics' : 'Private analytics'}</p>
                  </div>
                  <div className="details-row">
                    <span>Password Protection:</span>
                    <p>{url.isPasswordProtected ? 'Enabled' : 'Disabled'}</p>
                  </div>

                  {loadingDetailsCode === url.shortCode && (
                    <div className="loading">Loading detailed analytics...</div>
                  )}

                  {detailsByCode[url.shortCode]?.analytics && (
                    <div className="analytics-highlights">
                      <div className="detail-panel">
                        <h4>Countries</h4>
                        {formatMetricList(detailsByCode[url.shortCode].analytics.byCountry)}
                      </div>
                      <div className="detail-panel">
                        <h4>Cities</h4>
                        {formatMetricList(detailsByCode[url.shortCode].analytics.byCity)}
                      </div>
                      <div className="detail-panel">
                        <h4>Devices</h4>
                        {formatMetricList(detailsByCode[url.shortCode].analytics.byDevice)}
                      </div>
                      <div className="detail-panel">
                        <h4>Browsers</h4>
                        {formatMetricList(detailsByCode[url.shortCode].analytics.byBrowser)}
                      </div>
                      <div className="detail-panel">
                        <h4>Operating Systems</h4>
                        {formatMetricList(detailsByCode[url.shortCode].analytics.byOs)}
                      </div>
                      <div className="detail-panel">
                        <h4>Referrers</h4>
                        {formatMetricList(detailsByCode[url.shortCode].analytics.byReferrer)}
                      </div>
                    </div>
                  )}

                  {detailsByCode[url.shortCode]?.analytics?.recentClicks && (
                    <div className="recent-clicks">
                      <h4>Recent Click History</h4>
                      {detailsByCode[url.shortCode].analytics.recentClicks.length > 0 ? (
                        detailsByCode[url.shortCode].analytics.recentClicks.map((click, index) => (
                          <div key={`${click.timestamp}-${index}`} className="recent-click-item">
                            <div>
                              <strong>{new Date(click.timestamp).toLocaleString()}</strong>
                              <p>{click.country} / {click.city}</p>
                            </div>
                            <div>
                              <p>{click.device} | {click.browser} | {click.os}</p>
                              <p>Referrer: {click.referrer}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="metric-empty">No click history yet.</p>
                      )}
                    </div>
                  )}
                  
                  {isPersonal && (
                    <div className="card-actions">
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(url.shortCode);
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{loading ? 'Loading...' : 'No analytics data yet. Create a short URL first!'}</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
