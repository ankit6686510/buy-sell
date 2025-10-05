import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    enum: ['manufacturer', 'wholesaler', 'distributor', 'retailer', 'service_provider'],
    required: true
  },
  categories: [{
    type: String,
    required: true
  }],
  subcategories: [{
    type: String
  }],
  yearEstablished: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  annualTurnover: {
    type: String,
    enum: ['Under 25 Lakh', '25 Lakh - 1 Crore', '1-5 Crore', '5-25 Crore', '25-100 Crore', '100+ Crore']
  },
  businessAddress: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    email: {
      type: String,
      required: true
    },
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String
    }
  },
  gstNumber: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GST number format'
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['gst', 'pan', 'trade_license', 'incorporation_certificate', 'msme', 'iso_certificate'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    documentNumber: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'in_review', 'verified', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationNote: String,
  verifiedAt: Date,
  certifications: [{
    name: String,
    issuedBy: String,
    certificateNumber: String,
    validUntil: Date,
    documentUrl: String
  }],
  
  // Business Performance Metrics
  metrics: {
    profileViews: {
      type: Number,
      default: 0
    },
    productViews: {
      type: Number,
      default: 0
    },
    catalogViews: {
      type: Number,
      default: 0
    },
    totalInquiries: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageResponseTime: {
      type: Number, // in hours
      default: 24
    },
    successfulDeals: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  // Lead & Subscription Management
  leadCredits: {
    type: Number,
    default: 0
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'starter', 'growth', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiry: Date,
  
  // Status flags
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // Analytics
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingStep: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for product count
companySchema.virtual('productCount', {
  ref: 'ProductListing',
  localField: 'user',
  foreignField: 'user',
  count: true
});

// Virtual for catalog count
companySchema.virtual('catalogCount', {
  ref: 'ProductCatalog',
  localField: '_id',
  foreignField: 'company',
  count: true
});

// Indexes for better performance
companySchema.index({ user: 1 });
companySchema.index({ companyName: 'text', description: 'text' });
companySchema.index({ categories: 1 });
companySchema.index({ verificationStatus: 1 });
companySchema.index({ 'businessAddress.city': 1 });
companySchema.index({ 'businessAddress.state': 1 });
companySchema.index({ businessType: 1 });
companySchema.index({ subscriptionTier: 1 });
companySchema.index({ isActive: 1, verificationStatus: 1 });

// Pre-save middleware
companySchema.pre('save', function(next) {
  if (this.isModified('lastActiveAt')) {
    this.lastActiveAt = new Date();
  }
  next();
});

// Static methods
companySchema.statics.findByGST = function(gstNumber) {
  return this.findOne({ gstNumber: gstNumber.toUpperCase() });
};

companySchema.statics.findVerified = function() {
  return this.find({ verificationStatus: 'verified', isActive: true });
};

companySchema.statics.findByCategory = function(category) {
  return this.find({ 
    categories: { $in: [category] },
    verificationStatus: 'verified',
    isActive: true
  });
};

// Instance methods
companySchema.methods.updateMetrics = function(type, value = 1) {
  if (this.metrics[type] !== undefined) {
    this.metrics[type] += value;
    return this.save();
  }
};

companySchema.methods.calculateResponseRate = function() {
  // This would be calculated based on actual inquiry responses
  // For now, return current value
  return this.metrics.responseRate;
};

companySchema.methods.addLeadCredits = function(credits) {
  this.leadCredits += credits;
  return this.save();
};

companySchema.methods.deductLeadCredits = function(credits) {
  if (this.leadCredits >= credits) {
    this.leadCredits -= credits;
    return this.save();
  }
  throw new Error('Insufficient lead credits');
};

export default mongoose.model('Company', companySchema);
