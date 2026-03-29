const shortid = require('shortid');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Url = require('../models/Url');
const Click = require('../models/Click');
const User = require('../models/User');
const { generateQRCode } = require('../utils/qrCodeGenerator');

const generateShortCode = () => {
  return shortid.generate();
};

const incrementCount = (bucket, key) => {
  const normalizedKey = key || 'unknown';
  bucket[normalizedKey] = (bucket[normalizedKey] || 0) + 1;
};

const summarizeClicks = (clickDetails = []) => {
  const clicksByCountry = {};
  const clicksByCity = {};
  const clicksByDevice = {};
  const clicksByBrowser = {};
  const clicksByOs = {};
  const clicksByReferrer = {};
  const clicksByHour = {};

  const recentClicks = [...clickDetails]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10)
    .map((click) => ({
      timestamp: click.timestamp,
      country: click.country || 'unknown',
      city: click.city || 'unknown',
      device: click.device || 'unknown',
      browser: click.browser || 'unknown',
      os: click.os || 'unknown',
      referrer: click.referrer || 'direct'
    }));

  clickDetails.forEach((click) => {
    incrementCount(clicksByCountry, click.country);
    incrementCount(clicksByCity, click.city);
    incrementCount(clicksByDevice, click.device);
    incrementCount(clicksByBrowser, click.browser);
    incrementCount(clicksByOs, click.os);
    incrementCount(clicksByReferrer, click.referrer || 'direct');

    const hour = new Date(click.timestamp).getHours();
    clicksByHour[hour] = (clicksByHour[hour] || 0) + 1;
  });

  return {
    byCountry: clicksByCountry,
    byCity: clicksByCity,
    byDevice: clicksByDevice,
    byBrowser: clicksByBrowser,
    byOs: clicksByOs,
    byReferrer: clicksByReferrer,
    byHour: clicksByHour,
    recentClicks
  };
};

const sanitizeUrl = (url) => ({
  id: url._id,
  originalUrl: url.originalUrl,
  shortCode: url.shortCode,
  clicks: url.clicks,
  tags: url.tags,
  collection: url.collection,
  description: url.description,
  title: url.title,
  createdAt: url.createdAt,
  expiresAt: url.expiresAt,
  isActive: url.isActive,
  isPublic: url.isPublic,
  isPasswordProtected: !!url.password
});

// Create shortened URL
exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl, customCode, password, tags, collection, expiresAt, isPublic, description, title } = req.body;

    console.log('📥 Received request:', { originalUrl, customCode, password: password ? '***' : 'none', tags, expiresAt });

    if (!originalUrl || !validator.isURL(originalUrl)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    let shortCode = customCode;

    // Generate short code if not provided
    if (!shortCode) {
      shortCode = generateShortCode();
      while (await Url.findOne({ shortCode })) {
        shortCode = generateShortCode();
      }
    } else {
      const existing = await Url.findOne({ shortCode });
      if (existing) {
        return res.status(400).json({ error: 'Custom code already taken' });
      }
    }

    const urlData = {
      originalUrl,
      shortCode,
      tags: tags || [],
      isPublic: isPublic !== false,
      description,
      title
    };

    if (req.userId) {
      urlData.user = req.userId;
    }

    if (password) {
      console.log('🔐 Password provided, hashing:', password);
      const salt = await bcrypt.genSalt(10);
      urlData.password = await bcrypt.hash(password, salt);
      console.log('✅ Password hashed successfully');
    } else {
      console.log('⚠️ No password provided');
    }

    if (expiresAt) {
      urlData.expiresAt = new Date(expiresAt);
    }

    if (collection) {
      urlData.collection = collection;
    }

    const url = new Url(urlData);
    await url.save();

    console.log('💾 URL saved with isPasswordProtected:', !!url.password);

    // Generate QR code
    const qrCode = await generateQRCode(`${process.env.BASE_URL}/${url.shortCode}`);

    // Update user stats
    if (req.userId) {
      await User.findByIdAndUpdate(req.userId, { $inc: { totalUrls: 1 } });
    }

    res.status(201).json({
      id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
      qrCode,
      clicks: url.clicks,
      createdAt: url.createdAt,
      tags: url.tags,
      collection: url.collection,
      description: url.description,
      isPublic: url.isPublic,
      isPasswordProtected: !!url.password,
      message: password ? '🔐 Password protection enabled!' : 'URL created successfully'
    });
  } catch (err) {
    console.error('Error creating short URL:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get analytics for a short URL
exports.getAnalytics = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { password } = req.body;

    const url = await Url.findOne({ shortCode })
      .populate('clickDetails')
      .populate('user', 'email');

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const isOwner = req.userId && url.user && url.user._id.toString() === req.userId;

    // Check password protection
    if (url.password && !isOwner) {
      if (!password || !(await bcrypt.compare(password, url.password))) {
        return res.status(401).json({ error: 'Password required' });
      }
    }

    // Check permission
    if (!url.isPublic && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const analyticsSummary = summarizeClicks(url.clickDetails || []);

    res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      isActive: url.isActive,
      tags: url.tags,
      collection: url.collection,
      description: url.description,
      isPublic: url.isPublic,
      isPasswordProtected: !!url.password,
      analytics: {
        ...analyticsSummary,
        totalClicks: url.clicks
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get public info for a short URL without exposing sensitive fields
exports.getPublicUrlInfo = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ error: 'URL has expired' });
    }

    res.json({
      shortCode: url.shortCode,
      isPasswordProtected: !!url.password,
      expiresAt: url.expiresAt
    });
  } catch (err) {
    console.error('Error fetching public URL info:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's URLs
exports.getUserUrls = async (req, res) => {
  try {
    const { tags, collection, search } = req.query;

    let query = { user: req.userId };

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (collection) {
      query.collection = collection;
    }

    if (search) {
      query.$or = [
        { shortCode: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { originalUrl: new RegExp(search, 'i') }
      ];
    }

    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(urls.map(sanitizeUrl));
  } catch (err) {
    console.error('Error fetching user URLs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update URL
exports.updateUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { description, tags, collection, isPublic } = req.body;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (url.user && url.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (description !== undefined) url.description = description;
    if (tags !== undefined) url.tags = tags;
    if (collection !== undefined) url.collection = collection;
    if (isPublic !== undefined) url.isPublic = isPublic;

    await url.save();

    res.json({ message: 'URL updated', url });
  } catch (err) {
    console.error('Error updating URL:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete URL
exports.deleteUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (url.user && url.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Url.deleteOne({ shortCode });
    await Click.deleteMany({ url: url._id });

    if (url.user) {
      await User.findByIdAndUpdate(url.user, { $inc: { totalUrls: -1 } });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (err) {
    console.error('Error deleting URL:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export URLs as CSV
exports.exportUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.userId }).populate('clickDetails');

    let csv = 'Short Code,Original URL,Clicks,Password Protected,Public,Collection,Description,Created At,Expires At,Tags,Top Country,Top Device,Top Browser,Top OS,Top Referrer,Recent Clicks\n';

    urls.forEach(url => {
      const analyticsSummary = summarizeClicks(url.clickDetails || []);
      const pickTopMetric = (metrics) => Object.entries(metrics).sort((a, b) => b[1] - a[1])[0]?.[0] || 'n/a';
      const recentClicks = analyticsSummary.recentClicks
        .map((click) => `${new Date(click.timestamp).toISOString()} ${click.country}/${click.city} ${click.device} ${click.browser} ${click.os} ${click.referrer}`)
        .join(' | ');

      csv += `${url.shortCode},"${url.originalUrl}",${url.clicks},${!!url.password},${url.isPublic},"${url.collection || ''}","${url.description || ''}","${url.createdAt.toISOString()}","${url.expiresAt ? url.expiresAt.toISOString() : ''}","${url.tags.join(', ')}","${pickTopMetric(analyticsSummary.byCountry)}","${pickTopMetric(analyticsSummary.byDevice)}","${pickTopMetric(analyticsSummary.byBrowser)}","${pickTopMetric(analyticsSummary.byOs)}","${pickTopMetric(analyticsSummary.byReferrer)}","${recentClicks}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=urls.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error exporting URLs:', err);
    res.status(500).json({ error: 'Error exporting URLs' });
  }
};
