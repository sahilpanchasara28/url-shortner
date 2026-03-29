const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      // Use IP address from X-Forwarded-For if available, otherwise use remote IP
      return req.ip || req.connection.remoteAddress;
    },
    skip: (req, res) => {
      // Skip rate limiting for health check
      return req.path === '/health';
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 requests per 15 minutes

// URL creation limiter
const createUrlLimiter = createRateLimiter(60 * 60 * 1000, 50); // 50 per hour

module.exports = {
  generalLimiter,
  authLimiter,
  createUrlLimiter,
  createRateLimiter
};
