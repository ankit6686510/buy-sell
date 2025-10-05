import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema({
  // Buyer Information
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // RFQ Basic Details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Category & Product Details
  category: {
    type: String,
    required: true,
    enum: [
      'Consumer Electronics',
      'Home Appliances', 
      'Electrical Components',
      'Lighting',
      'Industrial Equipment',
      'Mobile & Accessories',
      'Computers & Laptops',
      'Audio & Video',
      'Kitchen Appliances',
      'Wires & Cables',
      'Switches & Sockets',
      'LED Lights',
      'Motors & Drives'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Quantity Requirements
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    enum: ['pieces', 'kg', 'boxes', 'meters', 'liters', 'sets', 'cartons', 'tons', 'grams'],
    default: 'pieces'
  },
  
  // Budget Information
  budgetRange: {
    min: {
      type: Number,
      required: true,
      min: 0
    },
    max: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Delivery Requirements
  deliveryLocation: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  expectedDelivery: {
    type: Date,
    required: true
  },
  
  // Technical Specifications (Electronics-focused)
  specifications: {
    voltage: String,
    wattage: String,
    frequency: String,
    warranty: String,
    certifications: [String],
    brand: String,
    model: String,
    color: String,
    size: String,
    features: [String],
    customSpecs: {
      type: Map,
      of: String,
      default: {}
    }
  },
  
  // Additional Requirements
  additionalRequirements: {
    packaging: String,
    labeling: String,
    testing: String,
    documentation: String,
    compliance: [String],
    customization: String
  },
  
  // Attachments
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'document', 'specification', 'drawing', 'other'],
      default: 'other'
    },
    size: Number, // in bytes
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // RFQ Settings
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited_only'],
    default: 'public'
  },
  invitedSuppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  maxQuotes: {
    type: Number,
    default: 10,
    min: 1,
    max: 50
  },
  
  // Timeline
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  autoCloseAfterExpiry: {
    type: Boolean,
    default: true
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'closed', 'awarded', 'cancelled', 'expired'],
    default: 'draft'
  },
  publishedAt: Date,
  closedAt: Date,
  
  // Quote Management
  quotes: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Quote Details
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    
    // Delivery & Terms
    deliveryTime: {
      type: String,
      required: true
    },
    deliveryTerms: String,
    paymentTerms: String,
    validityPeriod: {
      type: String,
      default: '30 days'
    },
    
    // Supplier Response
    message: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    
    // Product Variants/Options
    variants: [{
      description: String,
      pricePerUnit: Number,
      totalPrice: Number,
      deliveryTime: String
    }],
    
    // Quote Status
    status: {
      type: String,
      enum: ['submitted', 'shortlisted', 'rejected', 'accepted', 'awarded'],
      default: 'submitted'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    
    // Payment for Quote Access
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentAmount: {
      type: Number,
      default: 0
    },
    paymentId: String,
    
    // Interaction Tracking
    viewedByBuyer: {
      type: Boolean,
      default: false
    },
    viewedAt: Date,
    buyerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    buyerFeedback: String
  }],
  
  // Analytics & Metrics
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    quotesReceived: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageQuotePrice: {
      type: Number,
      default: 0
    },
    lowestQuote: {
      type: Number,
      default: 0
    },
    highestQuote: {
      type: Number,
      default: 0
    }
  },
  
  // Revenue Tracking
  revenue: {
    totalEarned: {
      type: Number,
      default: 0
    },
    quoteFees: {
      type: Number,
      default: 0
    },
    premiumFees: {
      type: Number,
      default: 0
    }
  },
  
  // Feedback & Communication
  buyerFeedback: {
    supplierQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    responseTime: {
      type: Number,
      min: 1,
      max: 5
    },
    overallExperience: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    wouldRecommend: Boolean
  },
  
  // Premium Features
  featured: {
    type: Boolean,
    default: false
  },
  urgent: {
    type: Boolean,
    default: false
  },
  
  // System Fields
  isActive: {
    type: Boolean,
    default: true
  },
  reportCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient searching and filtering
rfqSchema.index({ buyer: 1, status: 1 });
rfqSchema.index({ category: 1, status: 1 });
rfqSchema.index({ category: 1, subcategory: 1, status: 1 });
rfqSchema.index({ status: 1, publishedAt: -1 });
rfqSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
rfqSchema.index({ 'deliveryLocation.city': 1, status: 1 });
rfqSchema.index({ 'deliveryLocation.state': 1, status: 1 });
rfqSchema.index({ 'budgetRange.min': 1, 'budgetRange.max': 1 });
rfqSchema.index({ visibility: 1, status: 1 });
rfqSchema.index({ featured: -1, publishedAt: -1 });
rfqSchema.index({ urgent: -1, publishedAt: -1 });
rfqSchema.index({ title: 'text', description: 'text' });
rfqSchema.index({ 'quotes.supplier': 1 });
rfqSchema.index({ 'quotes.status': 1 });

// Virtual for quote count
rfqSchema.virtual('quoteCount').get(function() {
  return this.quotes ? this.quotes.length : 0;
});

// Virtual for active quote count
rfqSchema.virtual('activeQuoteCount').get(function() {
  return this.quotes ? this.quotes.filter(quote => quote.status === 'submitted').length : 0;
});

// Virtual for days remaining
rfqSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'closed' || this.status === 'expired') return 0;
  const now = new Date();
  const expiry = new Date(this.expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for budget range display
rfqSchema.virtual('budgetDisplay').get(function() {
  const { min, max, currency = 'INR' } = this.budgetRange;
  return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
});

// Virtual for best quote
rfqSchema.virtual('bestQuote').get(function() {
  if (!this.quotes || this.quotes.length === 0) return null;
  return this.quotes.reduce((best, current) => {
    if (!best || current.totalPrice < best.totalPrice) {
      return current;
    }
    return best;
  }, null);
});

// Methods
rfqSchema.methods.addQuote = function(quoteData) {
  // Check if supplier already quoted
  const existingQuote = this.quotes.find(quote => 
    quote.supplier.toString() === quoteData.supplier.toString()
  );
  
  if (existingQuote) {
    throw new Error('Supplier has already submitted a quote');
  }
  
  // Check if RFQ is still active
  if (this.status !== 'active') {
    throw new Error('RFQ is not accepting quotes');
  }
  
  // Check if max quotes reached
  if (this.quotes.length >= this.maxQuotes) {
    throw new Error('Maximum number of quotes reached');
  }
  
  // Add quote
  this.quotes.push(quoteData);
  this.metrics.quotesReceived += 1;
  
  // Update analytics
  this.updateAnalytics();
  
  return this.save();
};

rfqSchema.methods.updateAnalytics = function() {
  if (this.quotes.length === 0) return;
  
  const prices = this.quotes.map(quote => quote.totalPrice);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  this.metrics.averageQuotePrice = avgPrice;
  this.metrics.lowestQuote = Math.min(...prices);
  this.metrics.highestQuote = Math.max(...prices);
  this.metrics.responseRate = (this.metrics.quotesReceived / this.metrics.views) * 100;
};

rfqSchema.methods.incrementViews = function(isUnique = false) {
  this.metrics.views += 1;
  if (isUnique) {
    this.metrics.uniqueViews += 1;
  }
  return this.save();
};

rfqSchema.methods.publish = function() {
  this.status = 'active';
  this.publishedAt = new Date();
  return this.save();
};

rfqSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

rfqSchema.methods.awardToSupplier = function(supplierId) {
  const quote = this.quotes.find(q => q.supplier.toString() === supplierId.toString());
  if (!quote) {
    throw new Error('Quote not found for supplier');
  }
  
  quote.status = 'awarded';
  this.status = 'awarded';
  this.closedAt = new Date();
  
  return this.save();
};

// Static methods
rfqSchema.statics.findActiveRFQs = function(filters = {}) {
  return this.find({
    status: 'active',
    expiresAt: { $gte: new Date() },
    isActive: true,
    ...filters
  }).sort({ featured: -1, urgent: -1, publishedAt: -1 });
};

rfqSchema.statics.findByCategory = function(category) {
  return this.findActiveRFQs({ category });
};

rfqSchema.statics.findByLocation = function(city, state) {
  const locationFilter = {};
  if (city) locationFilter['deliveryLocation.city'] = new RegExp(city, 'i');
  if (state) locationFilter['deliveryLocation.state'] = new RegExp(state, 'i');
  
  return this.findActiveRFQs(locationFilter);
};

rfqSchema.statics.findByBudgetRange = function(minBudget, maxBudget) {
  return this.findActiveRFQs({
    'budgetRange.min': { $lte: maxBudget },
    'budgetRange.max': { $gte: minBudget }
  });
};

// Pre-save middleware
rfqSchema.pre('save', function(next) {
  // Auto-expire if past expiry date
  if (this.expiresAt < new Date() && this.status === 'active' && this.autoCloseAfterExpiry) {
    this.status = 'expired';
    this.closedAt = new Date();
  }
  
  // Auto-generate tags from title and category
  if (!this.tags || this.tags.length === 0) {
    const tags = [];
    
    // Add category and subcategory
    if (this.category) tags.push(this.category.toLowerCase());
    if (this.subcategory) tags.push(this.subcategory.toLowerCase());
    
    // Extract words from title
    const titleWords = this.title.toLowerCase().split(' ').filter(word => word.length > 2);
    tags.push(...titleWords);
    
    // Add specifications
    if (this.specifications.brand) tags.push(this.specifications.brand.toLowerCase());
    if (this.specifications.model) tags.push(this.specifications.model.toLowerCase());
    
    this.tags = [...new Set(tags)]; // remove duplicates
  }
  
  next();
});

const RFQ = mongoose.model('RFQ', rfqSchema);

export default RFQ;
