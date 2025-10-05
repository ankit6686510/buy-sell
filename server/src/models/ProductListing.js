import mongoose from 'mongoose';

const productListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    enum: [
      'electronics',
      'fashion',
      'home_garden',
      'sports',
      'vehicles',
      'books_media',
      'toys_games',
      'health_beauty',
      'others'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like_new', 'good', 'fair', 'poor']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'India'
    },
    pincode: {
      type: String,
      trim: true
    }
  },
  preferences: {
    negotiable: {
      type: Boolean,
      default: true
    },
    homeDelivery: {
      type: Boolean,
      default: false
    },
    exchange: {
      type: Boolean,
      default: false
    }
  },
  // B2B Enhancement: Enhanced specifications for electronics
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  
  // B2B Enhancement: Minimum Order Quantity and Bulk Pricing
  moq: {
    type: Number,
    default: 1,
    min: 1
  },
  moqUnit: {
    type: String,
    enum: ['pieces', 'kg', 'boxes', 'meters', 'liters', 'sets', 'cartons'],
    default: 'pieces'
  },
  bulkPricing: [{
    minQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    maxQuantity: {
      type: Number,
      required: true
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  
  // B2B Enhancement: Product variants (color, size, voltage, etc.)
  variants: [{
    name: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    priceModifier: {
      type: Number,
      default: 0
    }
  }],
  
  // B2B Enhancement: Extended image gallery
  imageGallery: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // B2B Enhancement: Technical documents
  technicalDocs: [{
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
      enum: ['datasheet', 'manual', 'certificate', 'warranty', 'other'],
      default: 'other'
    },
    size: Number, // in bytes
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // B2B Enhancement: Electronics-specific fields
  electronicsSpecs: {
    voltage: String,
    wattage: String,
    frequency: String,
    warranty: String,
    certifications: [{
      type: String,
      enum: ['CE', 'ISI', 'BIS', 'FCC', 'RoHS', 'ISO', 'UL', 'other']
    }],
    connectorType: String,
    inputOutput: String,
    operatingTemp: String,
    dimensions: String,
    weight: String
  },
  
  // B2B Enhancement: Business account type
  isB2B: {
    type: Boolean,
    default: false
  },
  
  // B2B Enhancement: Company listing (if posted by business)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'expired'],
    default: 'available'
  },
  priority: {
    type: Number,
    default: 0 // higher number = higher priority in search results
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  inquiries: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date
  },
  boost: {
    type: Number,
    default: 0 // for premium boosts
  },
  promotion: {
    type: {
      type: String,
      enum: ['none', 'spotlight', 'top_ads', 'urgent', 'featured_plus'],
      default: 'none'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    price: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    orderId: {
      type: String
    },
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  },
  reportCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
productListingSchema.index({ category: 1, status: 1 });
productListingSchema.index({ category: 1, subcategory: 1, status: 1 });
productListingSchema.index({ 'location.coordinates': '2dsphere' });
productListingSchema.index({ 'location.city': 1, status: 1 });
productListingSchema.index({ 'location.state': 1, status: 1 });
productListingSchema.index({ price: 1, status: 1 });
productListingSchema.index({ condition: 1, status: 1 });
productListingSchema.index({ createdAt: -1, status: 1 });
productListingSchema.index({ priority: -1, createdAt: -1 });
productListingSchema.index({ featured: -1, priority: -1, createdAt: -1 });
productListingSchema.index({ boost: -1, createdAt: -1 });
productListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
productListingSchema.index({ title: 'text', description: 'text', brand: 'text', tags: 'text' });

// B2B Enhancement: Additional indexes for business features
productListingSchema.index({ isB2B: 1, category: 1, status: 1 });
productListingSchema.index({ company: 1, status: 1 });
productListingSchema.index({ moq: 1, status: 1 });
productListingSchema.index({ 'bulkPricing.minQuantity': 1 });
productListingSchema.index({ 'electronicsSpecs.voltage': 1 });
productListingSchema.index({ 'electronicsSpecs.certifications': 1 });
productListingSchema.index({ isB2B: 1, 'location.city': 1, status: 1 });

// Virtual for condition priority
productListingSchema.virtual('conditionPriority').get(function() {
  const conditionMap = {
    'new': 5,
    'like_new': 4,
    'good': 3,
    'fair': 2,
    'poor': 1
  };
  return conditionMap[this.condition] || 0;
});

// Virtual for favorites count
productListingSchema.virtual('favoritesCount').get(function() {
  return this.favorites ? this.favorites.length : 0;
});

// Virtual for age in days
productListingSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for discount percentage
productListingSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to calculate relevance score for search
productListingSchema.methods.calculateRelevanceScore = function(searchParams = {}) {
  let score = 0;
  
  // Base score
  score += 10;
  
  // Category match
  if (searchParams.category && this.category === searchParams.category) {
    score += 20;
  }
  
  // Subcategory match
  if (searchParams.subcategory && this.subcategory === searchParams.subcategory) {
    score += 15;
  }
  
  // Brand match
  if (searchParams.brand && this.brand && 
      this.brand.toLowerCase().includes(searchParams.brand.toLowerCase())) {
    score += 10;
  }
  
  // Price range match
  if (searchParams.minPrice && searchParams.maxPrice) {
    if (this.price >= searchParams.minPrice && this.price <= searchParams.maxPrice) {
      score += 15;
    }
  }
  
  // Condition preference
  if (searchParams.condition && this.condition === searchParams.condition) {
    score += 10;
  }
  
  // Recency bonus (newer listings get boost)
  const daysSinceCreated = this.ageInDays;
  if (daysSinceCreated <= 7) score += 10;
  else if (daysSinceCreated <= 14) score += 7;
  else if (daysSinceCreated <= 30) score += 5;
  
  // Quality indicators
  if (this.images && this.images.length >= 3) score += 5;
  if (this.description && this.description.length >= 100) score += 3;
  if (this.originalPrice) score += 2; // has original price info
  
  // User reputation (if available)
  if (this.user && this.user.rating) {
    if (this.user.rating >= 4.5) score += 8;
    else if (this.user.rating >= 4.0) score += 5;
    else if (this.user.rating >= 3.5) score += 3;
    else if (this.user.rating < 3.0) score -= 5;
  }
  
  // Engagement metrics
  if (this.views > 50) score += 3;
  if (this.favoritesCount > 5) score += 3;
  if (this.inquiries > 3) score += 2;
  
  // Premium features
  if (this.featured) score += 25;
  if (this.boost > 0) score += this.boost;
  
  // Penalties
  if (this.reportCount > 0) score -= (this.reportCount * 5);
  if (!this.isActive) score -= 20;
  
  return Math.max(0, score);
};

// Method to increment view count
productListingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add to favorites
productListingSchema.methods.addToFavorites = function(userId) {
  if (!this.favorites.includes(userId)) {
    this.favorites.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove from favorites
productListingSchema.methods.removeFromFavorites = function(userId) {
  this.favorites = this.favorites.filter(id => !id.equals(userId));
  return this.save();
};

// Pre-save middleware to set subcategory based on category if not provided
productListingSchema.pre('save', function(next) {
  // Auto-set some common subcategories
  if (!this.subcategory && this.category) {
    const defaultSubcategories = {
      'electronics': 'mobile_accessories',
      'fashion': 'clothing',
      'home_garden': 'furniture',
      'sports': 'fitness',
      'vehicles': 'cars',
      'books_media': 'books',
      'toys_games': 'toys',
      'health_beauty': 'health'
    };
    this.subcategory = defaultSubcategories[this.category] || 'general';
  }
  
  // Auto-generate tags from title and brand
  if (!this.tags || this.tags.length === 0) {
    const tags = [];
    if (this.brand) tags.push(this.brand.toLowerCase());
    if (this.model) tags.push(this.model.toLowerCase());
    
    // Extract words from title
    const titleWords = this.title.toLowerCase().split(' ').filter(word => word.length > 2);
    tags.push(...titleWords);
    
    this.tags = [...new Set(tags)]; // remove duplicates
  }
  
  next();
});

const ProductListing = mongoose.model('ProductListing', productListingSchema);

export default ProductListing;
