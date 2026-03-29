const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema(
  {
    url: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    referrer: String,
    userAgent: String,
    ip: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String
  },
  { timestamps: false }
);

// TTL index to auto-delete clicks after 90 days
clickSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Click', clickSchema);
