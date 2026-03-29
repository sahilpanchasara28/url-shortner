const express = require('express');
const router = express.Router();
const redirectController = require('../controllers/redirectController');

// Redirect to original URL and track click
router.get('/:shortCode', redirectController.redirect);
router.post('/:shortCode', redirectController.redirect);

module.exports = router;
