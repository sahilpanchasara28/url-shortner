const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy - fix for rate limiting with X-Forwarded-For header
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.BASE_URL_FRONTEND || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(generalLimiter); // Apply rate limiting to all routes

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/url-shortener')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Suppress Mongoose warning about reserved field names

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/urls', require('./routes/urlRoutes'));
app.use('/', require('./routes/redirectRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
