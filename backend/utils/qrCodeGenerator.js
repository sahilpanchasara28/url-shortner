const QRCode = require('qrcode');

const generateQRCode = async (url) => {
  try {
    const qrCode = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCode;
  } catch (err) {
    console.error('QR code generation error:', err);
    return null;
  }
};

module.exports = { generateQRCode };
