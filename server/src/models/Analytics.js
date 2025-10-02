import mongoose from 'mongoose';

// User Activity Tracking
const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 'register', 'view_listing', 'create_listing', 'edit_listing', 
      'delete_listing', 'search', 'filter', 'contact_seller', 'send_message', 
      'view_profile', 'verify_email', 'verify_phone', 'create_rating', 'view_matches',
      'favorite_listing', 'unfavorite_listing', 'report_user', 'block_user'
    ]
  },
  metadata: {
    listingId: mongoose.Schema.Types.ObjectId,
    targetUserId: mongoose.Schema.Types.ObjectId,
    searchQuery: String,
    filters: mongoose.Schema.Types.Mixed,
    userAgent: String,
    ipAddress: String,
    referrer: String,
    pageUrl: String,
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    },
    browser: String,
    platform: String,
    location: {
      country: String,
      region: String,
      city: String
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Page View Tracking
const pageViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true
  },
  page: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  referrer: String,
  duration: Number, // Time spent on page in seconds
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String,
    browser: String,
    platform: String,
    screenResolution: String,
    location: {
      country: String,
      region: String,
      city: String
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Conversion Tracking
const conversionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  conversionType: {
    type: String,
    required: true,
    enum: [
      'registration', 'email_verification', 'phone_verification', 'first_listing',
      'first_message', 'first_match', 'first_rating', 'successful_transaction'
    ]
  },
  value: Number, // Monetary value if applicable
  metadata: {
    source: String, // How they found the platform
    medium: String, // organic, paid, social, etc.
    campaign: String,
    funnel_step: Number,
    time_to_convert: Number // Days from registration
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// A/B Test Tracking
const abTestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  testName: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    required: true
  },
  conversion: {
    type: Boolean,
    default: false
  },
  conversionType: String,
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Performance Metrics
const performanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  page: String,
  metrics: {
    loadTime: Number,
    firstContentfulPaint: Number,
    largestContentfulPaint: Number,
    timeToInteractive: Number,
    cumulativeLayoutShift: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Error Tracking
const errorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  errorType: {
    type: String,
    required: true,
    enum: ['javascript', 'api', 'network', 'validation', 'server']
  },
  errorMessage: {
    type: String,
    required: true
  },
  errorStack: String,
  page: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
userActivitySchema.index({ user: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });
userActivitySchema.index({ sessionId: 1, timestamp: -1 });

pageViewSchema.index({ user: 1, timestamp: -1 });
pageViewSchema.index({ page: 1, timestamp: -1 });
pageViewSchema.index({ sessionId: 1, timestamp: -1 });

conversionSchema.index({ user: 1, timestamp: -1 });
conversionSchema.index({ conversionType: 1, timestamp: -1 });

abTestSchema.index({ testName: 1, variant: 1 });
abTestSchema.index({ user: 1, timestamp: -1 });

performanceSchema.index({ page: 1, timestamp: -1 });
errorSchema.index({ errorType: 1, timestamp: -1 });
errorSchema.index({ resolved: 1, severity: 1 });

// Models
export const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export const PageView = mongoose.model('PageView', pageViewSchema);
export const Conversion = mongoose.model('Conversion', conversionSchema);
export const ABTest = mongoose.model('ABTest', abTestSchema);
export const Performance = mongoose.model('Performance', performanceSchema);
export const ErrorLog = mongoose.model('ErrorLog', errorSchema);

// Helper function to get device type from user agent
export const getDeviceType = (userAgent) => {
  if (!userAgent) return 'unknown';
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Helper function to get browser info
export const getBrowserInfo = (userAgent) => {
  if (!userAgent) return { browser: 'unknown', platform: 'unknown' };
  
  let browser = 'unknown';
  let platform = 'unknown';
  
  // Detect browser
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';
  
  // Detect platform
  if (userAgent.includes('Windows')) platform = 'Windows';
  else if (userAgent.includes('Mac')) platform = 'macOS';
  else if (userAgent.includes('Linux')) platform = 'Linux';
  else if (userAgent.includes('Android')) platform = 'Android';
  else if (userAgent.includes('iOS')) platform = 'iOS';
  
  return { browser, platform };
};
