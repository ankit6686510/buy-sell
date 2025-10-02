import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  bio: {
    type: String,
    trim: true
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EarbudListing'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  verification: {
    email: {
      verified: {
        type: Boolean,
        default: false
      },
      token: String,
      tokenExpires: Date
    },
    phone: {
      verified: {
        type: Boolean,
        default: false
      },
      token: String,
      tokenExpires: Date
    },
    identity: {
      verified: {
        type: Boolean,
        default: false
      },
      documentType: {
        type: String,
        enum: ['drivers_license', 'passport', 'national_id']
      },
      documentNumber: String,
      verifiedAt: Date,
      verifiedBy: String
    }
  },
  trustScore: {
    type: Number,
    default: 50, // Start with neutral trust score
    min: 0,
    max: 100
  },
  badges: [{
    type: {
      type: String,
      enum: ['verified_email', 'verified_phone', 'verified_id', 'trusted_seller', 'super_seller', 'new_member']
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  safetyReports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'fake_listing', 'inappropriate_behavior', 'scam', 'no_show', 'other']
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Wallet and payment related fields
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet'
  },
  subscriptionTier: {
    type: String,
    enum: ['basic', 'pro', 'business'],
    default: 'basic'
  },
  subscriptionExpiry: Date,
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpire;
  return userObject;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Calculate and update trust score
userSchema.methods.calculateTrustScore = function() {
  let score = 50; // Base score
  
  // Verification bonuses
  if (this.verification.email.verified) score += 10;
  if (this.verification.phone.verified) score += 15;
  if (this.verification.identity.verified) score += 20;
  
  // Rating bonus
  if (this.totalRatings > 0) {
    const ratingBonus = Math.min(20, (this.rating - 3) * 10); // Max 20 bonus for 5-star
    score += ratingBonus;
  }
  
  // Activity bonuses
  const daysSinceJoined = (Date.now() - this.joinedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceJoined > 30) score += 5; // 30+ days member
  if (daysSinceJoined > 90) score += 5; // 90+ days member
  
  // Safety reports penalty
  const activeSafetyReports = this.safetyReports.filter(report => 
    report.status === 'pending' || report.status === 'reviewed'
  ).length;
  score -= activeSafetyReports * 10;
  
  // Recent activity bonus
  const daysSinceActive = (Date.now() - this.lastActive) / (1000 * 60 * 60 * 24);
  if (daysSinceActive <= 7) score += 5;
  
  // Ensure score is within bounds
  this.trustScore = Math.max(0, Math.min(100, score));
  return this.trustScore;
};

// Add a badge to user
userSchema.methods.addBadge = function(badgeType) {
  const existingBadge = this.badges.find(badge => badge.type === badgeType);
  if (!existingBadge) {
    this.badges.push({ type: badgeType });
  }
};

// Remove a badge from user
userSchema.methods.removeBadge = function(badgeType) {
  this.badges = this.badges.filter(badge => badge.type !== badgeType);
};

// Check if user has a specific badge
userSchema.methods.hasBadge = function(badgeType) {
  return this.badges.some(badge => badge.type === badgeType);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function(type) {
  const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  if (type === 'email') {
    this.verification.email.token = token;
    this.verification.email.tokenExpires = expiry;
  } else if (type === 'phone') {
    this.verification.phone.token = token;
    this.verification.phone.tokenExpires = expiry;
  }
  
  return token;
};

// Verify token
userSchema.methods.verifyToken = function(type, token) {
  const verification = this.verification[type];
  
  if (!verification.token || verification.token !== token) {
    return false;
  }
  
  if (verification.tokenExpires < new Date()) {
    return false;
  }
  
  // Mark as verified
  verification.verified = true;
  verification.token = undefined;
  verification.tokenExpires = undefined;
  
  // Add appropriate badge
  if (type === 'email') {
    this.addBadge('verified_email');
  } else if (type === 'phone') {
    this.addBadge('verified_phone');
  }
  
  // Recalculate trust score
  this.calculateTrustScore();
  
  return true;
};

// Check if user is blocked by another user
userSchema.methods.isBlockedBy = function(userId) {
  return this.blockedUsers.includes(userId);
};

// Block a user
userSchema.methods.blockUser = function(userId) {
  if (!this.blockedUsers.includes(userId)) {
    this.blockedUsers.push(userId);
  }
};

// Unblock a user
userSchema.methods.unblockUser = function(userId) {
  this.blockedUsers = this.blockedUsers.filter(id => !id.equals(userId));
};

// Virtual for overall verification status
userSchema.virtual('isVerified').get(function() {
  return this.verification.email.verified || this.verification.phone.verified;
});

// Virtual for full verification status
userSchema.virtual('isFullyVerified').get(function() {
  return this.verification.email.verified && 
         this.verification.phone.verified && 
         this.verification.identity.verified;
});

// Pre-save middleware to update badges based on conditions
userSchema.pre('save', function(next) {
  // Add new member badge if just joined
  const daysSinceJoined = (Date.now() - this.joinedAt) / (1000 * 60 * 60 * 24);
  if (daysSinceJoined <= 30 && !this.hasBadge('new_member')) {
    this.addBadge('new_member');
  } else if (daysSinceJoined > 30 && this.hasBadge('new_member')) {
    this.removeBadge('new_member');
  }
  
  // Add trusted seller badge
  if (this.rating >= 4.5 && this.totalRatings >= 10 && !this.hasBadge('trusted_seller')) {
    this.addBadge('trusted_seller');
  }
  
  // Add super seller badge
  if (this.rating >= 4.8 && this.totalRatings >= 50 && this.isFullyVerified && !this.hasBadge('super_seller')) {
    this.addBadge('super_seller');
  }
  
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
