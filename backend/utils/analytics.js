const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const normalizeIp = (rawIp) => {
  if (!rawIp) {
    return '';
  }

  const firstIp = rawIp.split(',')[0].trim();

  if (firstIp.startsWith('::ffff:')) {
    return firstIp.replace('::ffff:', '');
  }

  return firstIp;
};

const getClientInfo = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = normalizeIp(forwardedFor || req.ip || req.connection.remoteAddress);
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const ua = parser.getResult();

  const geo = geoip.lookup(ip);

  return {
    ip,
    userAgent,
    device: ua.device?.type || 'desktop',
    browser: ua.browser?.name || 'unknown',
    os: ua.os?.name || 'unknown',
    country: geo?.country || 'unknown',
    city: geo?.city || 'unknown',
    referrer: req.headers['referer'] || 'direct'
  };
};

module.exports = { getClientInfo };
