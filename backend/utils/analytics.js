const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

const getClientInfo = (req) => {
  const ip = req.ip || req.connection.remoteAddress;
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
