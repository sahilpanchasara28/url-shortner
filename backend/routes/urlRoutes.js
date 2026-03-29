const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const authMiddleware = require('../middleware/auth');
const { optionalAuthMiddleware } = require('../middleware/auth');
const { createUrlLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/shorten', optionalAuthMiddleware, createUrlLimiter, urlController.createShortUrl);
router.get('/public/:shortCode', urlController.getPublicUrlInfo);
router.post('/analytics/:shortCode', optionalAuthMiddleware, urlController.getAnalytics);

// Protected routes (require authentication)
router.get('/user/urls', authMiddleware, urlController.getUserUrls);
router.put('/:shortCode', authMiddleware, urlController.updateUrl);
router.delete('/:shortCode', authMiddleware, urlController.deleteUrl);
router.get('/user/export', authMiddleware, urlController.exportUrls);

module.exports = router;
