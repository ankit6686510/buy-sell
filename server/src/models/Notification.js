import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'new_match', 'new_message', 'listing_expired', 'match_request', 
      'rating_received', 'verification_complete', 'system_update',
      'price_drop', 'nearby_listing', 'favorite_available'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    listingId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    messageId: mongoose.Schema.Types.ObjectId,
    matchId: mongoose.Schema.Types.ObjectId,
    url: String,
    actionType: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  channels: {
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      deviceTokens: [String],
      response: mongoose.Schema.Types.Mixed
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      emailAddress: String,
      response: mongoose.Schema.Types.Mixed
    },
    inApp: {
      read: { type: Boolean, default: false },
      readAt: Date,
      displayed: { type: Boolean, default: false },
      displayedAt: Date
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'expired'],
    default: 'pending'
  },
  scheduledFor: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  batchId: String, // For grouping related notifications
  metadata: {
    campaign: String,
    source: String,
    template: String,
    locale: String
  }
}, {
  timestamps: true
});

// User Device Tokens for Push Notifications
const deviceTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: true
  },
  deviceInfo: {
    deviceId: String,
    model: String,
    osVersion: String,
    appVersion: String,
    userAgent: String
  },
  preferences: {
    matches: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Notification Preferences
const notificationPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  channels: {
    push: {
      enabled: { type: Boolean, default: true },
      quiet_hours: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '22:00' }, // 24-hour format
        end: { type: String, default: '08:00' }
      }
    },
    email: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['immediate', 'daily', 'weekly'],
        default: 'immediate'
      }
    },
    inApp: {
      enabled: { type: Boolean, default: true }
    }
  },
  types: {
    new_match: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    new_message: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    },
    listing_expired: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    rating_received: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    },
    system_update: {
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true }
    }
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

deviceTokenSchema.index({ user: 1, platform: 1 });
deviceTokenSchema.index({ token: 1 }, { unique: true });
deviceTokenSchema.index({ isActive: 1, lastUsed: -1 });

// Methods for Notification
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsDisplayed = function() {
  this.channels.inApp.displayed = true;
  this.channels.inApp.displayedAt = new Date();
  return this.save();
};

notificationSchema.methods.updatePushStatus = function(status, response = null) {
  this.channels.push.sent = status === 'sent' || status === 'delivered';
  this.channels.push.sentAt = new Date();
  this.channels.push.response = response;
  this.status = status;
  return this.save();
};

// Static methods
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  
  // Here you would trigger the actual sending logic
  // This could be a queue job, webhook, etc.
  
  return notification;
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    user: userId,
    'channels.inApp.read': false,
    status: { $in: ['sent', 'delivered'] }
  });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    {
      user: userId,
      'channels.inApp.read': false
    },
    {
      $set: {
        'channels.inApp.read': true,
        'channels.inApp.readAt': new Date()
      }
    }
  );
};

// Device token methods
deviceTokenSchema.methods.updateLastUsed = function() {
  this.lastUsed = new Date();
  return this.save();
};

deviceTokenSchema.statics.getActiveTokensForUser = async function(userId, notificationType = null) {
  const query = { user: userId, isActive: true };
  
  const tokens = await this.find(query);
  
  if (notificationType) {
    // Filter based on user preferences for this notification type
    return tokens.filter(token => {
      return token.preferences[notificationType] !== false;
    });
  }
  
  return tokens;
};

export const Notification = mongoose.model('Notification', notificationSchema);
export const DeviceToken = mongoose.model('DeviceToken', deviceTokenSchema);
export const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);

// Helper function to create notification templates
export const NotificationTemplates = {
  NEW_MATCH: (listing, matchedListing) => ({
    type: 'new_match',
    title: '🎯 Perfect Match Found!',
    message: `Found a ${matchedListing.brand} ${matchedListing.model} ${matchedListing.side} earbud that matches your ${listing.side} one!`,
    data: {
      listingId: listing._id,
      matchId: matchedListing._id,
      url: `/listings/${matchedListing._id}`,
      actionType: 'view_match'
    },
    priority: 'high'
  }),
  
  NEW_MESSAGE: (sender, message) => ({
    type: 'new_message',
    title: `💬 Message from ${sender.name}`,
    message: message.content.length > 50 ? 
      message.content.substring(0, 50) + '...' : 
      message.content,
    data: {
      userId: sender._id,
      messageId: message._id,
      url: `/messages/${message.chat}`,
      actionType: 'view_message'
    },
    priority: 'medium'
  }),
  
  LISTING_EXPIRED: (listing) => ({
    type: 'listing_expired',
    title: '⏰ Listing Expired',
    message: `Your ${listing.brand} ${listing.model} listing has expired. Renew it to continue finding matches!`,
    data: {
      listingId: listing._id,
      url: `/listings/${listing._id}/edit`,
      actionType: 'renew_listing'
    },
    priority: 'medium'
  }),
  
  NEARBY_LISTING: (listing, distance) => ({
    type: 'nearby_listing',
    title: '📍 New Listing Nearby',
    message: `New ${listing.brand} ${listing.model} ${listing.side} earbud found ${distance}km away!`,
    data: {
      listingId: listing._id,
      url: `/listings/${listing._id}`,
      actionType: 'view_listing'
    },
    priority: 'low'
  }),
  
  VERIFICATION_COMPLETE: (verificationType) => ({
    type: 'verification_complete',
    title: '✅ Verification Complete',
    message: `Your ${verificationType} verification is now complete! Your trust score has been updated.`,
    data: {
      url: '/profile/verification',
      actionType: 'view_profile'
    },
    priority: 'low'
  })
};
