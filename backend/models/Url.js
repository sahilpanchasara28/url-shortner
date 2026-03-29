const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    originalUrl: {
      type: String,
      required: true,
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customDomain: String,
    clicks: {
      type: Number,
      default: 0
    },
    password: String, // hashed password for protection
    tags: [String],
    collection: String,
    description: String,
    title: String,
    preview: {
      image: String,
      title: String,
      description: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    allowAnalyticsView: {
      type: Boolean,
      default: false
    },
    clickDetails: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Click'
    }],
    rateLimit: {
      enabled: Boolean,
      maxClicks: Number,
      windowMs: Number
    },
    customization: {
      bgColor: String,
      textColor: String,
      brandingText: String
    }
  },
  { 
    timestamps: true,
    suppressReservedKeysWarning: true
  }
);

// TTL index for automatic expiry
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
urlSchema.index({ user: 1, createdAt: -1 });
urlSchema.index({ tags: 1 });

module.exports = mongoose.model('Url', urlSchema);
