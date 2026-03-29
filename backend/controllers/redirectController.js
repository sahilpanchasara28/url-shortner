const Url = require('../models/Url');
const Click = require('../models/Click');
const User = require('../models/User');
const { getClientInfo } = require('../utils/analytics');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PROTECTED_URL_COOKIE = 'protected_url_access';

const getCookieValue = (req, cookieName) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${cookieName}=`));

  return targetCookie ? decodeURIComponent(targetCookie.split('=').slice(1).join('=')) : null;
};

const hasProtectedAccess = (req, shortCode) => {
  try {
    const token = getCookieValue(req, PROTECTED_URL_COOKIE);

    if (!token) {
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.shortCode === shortCode;
  } catch (err) {
    return false;
  }
};

// Redirect and track click
exports.redirect = async (req, res) => {
  try {
    const shortCode = req.params.shortCode;
    const { password } = req.body || {};

    if (!shortCode) {
      return res.status(400).json({ error: 'Short code is required' });
    }

    const url = await Url.findOne({ shortCode, isActive: true })
      .populate('user', '_id');

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'URL has expired' });
    }

    // Check password protection before exposing the destination URL
    if (url.password) {
      const hasAccessCookie = hasProtectedAccess(req, shortCode);

      if (req.method === 'GET' && !hasAccessCookie) {
        // Redirect to frontend password page
        return res.redirect(`${process.env.BASE_URL_FRONTEND || 'http://localhost:3000'}/u/${shortCode}`);
      }

      if (req.method === 'POST') {
        if (!password || !(await bcrypt.compare(password, url.password))) {
          return res.status(401).json({ error: 'Invalid password' });
        }

        const accessToken = jwt.sign({ shortCode }, process.env.JWT_SECRET, {
          expiresIn: '5m'
        });

        res.cookie(PROTECTED_URL_COOKIE, accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 5 * 60 * 1000
        });

        return res.json({ success: true });
      }

      if (!hasAccessCookie) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    if (req.method === 'POST') {
      return res.json({ success: true });
    }

    // Get client info
    const clientInfo = getClientInfo(req);

    // Create click record
    const click = new Click({
      url: url._id,
      ...clientInfo
    });

    await click.save();

    // Increment click count
    url.clicks += 1;
    url.clickDetails.push(click._id);
    
    // Keep only last 1000 click details for performance
    if (url.clickDetails.length > 1000) {
      url.clickDetails = url.clickDetails.slice(-1000);
    }

    await url.save();

    // Update user total clicks
    if (url.user) {
      await User.findByIdAndUpdate(url.user._id || url.user, { $inc: { totalClicks: 1 } });
    }

    if (url.password) {
      res.clearCookie(PROTECTED_URL_COOKIE, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    }

    // Redirect to original URL
    res.redirect(url.originalUrl);
  } catch (err) {
    console.error('Error redirecting:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
