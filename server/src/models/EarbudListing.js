import mongoose from 'mongoose';

const earbudListingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  serialNumber: {
    type: String,
    trim: true
  },
  side: {
    type: String,
    required: true,
    enum: ['left', 'right']
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
  description: {
    type: String,
    trim: true
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
    country: {
      type: String,
      trim: true
    }
  },
  preferences: {
    maxDistance: {
      type: Number,
      default: 50, // kilometers
      min: 1,
      max: 500
    },
    priceFlexibility: {
      type: Number,
      default: 20, // percentage
      min: 0,
      max: 100
    },
    conditionFlexibility: {
      type: Boolean,
      default: true // accept different conditions
    }
  },
  status: {
    type: String,
    enum: ['available', 'matched', 'sold', 'expired'],
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
  matchedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EarbudListing'
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
earbudListingSchema.index({ brand: 1, model: 1, side: 1, status: 1 });
earbudListingSchema.index({ 'location.coordinates': '2dsphere' });
earbudListingSchema.index({ 'location.city': 1, status: 1 });
earbudListingSchema.index({ price: 1, status: 1 });
earbudListingSchema.index({ condition: 1, status: 1 });
earbudListingSchema.index({ createdAt: -1, status: 1 });
earbudListingSchema.index({ priority: -1, createdAt: -1 });
earbudListingSchema.index({ featured: -1, priority: -1 });
earbudListingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for condition priority (for matching algorithm)
earbudListingSchema.virtual('conditionPriority').get(function() {
  const conditionMap = {
    'new': 5,
    'like_new': 4,
    'good': 3,
    'fair': 2,
    'poor': 1
  };
  return conditionMap[this.condition] || 0;
});

// Method to calculate match score with another listing
earbudListingSchema.methods.calculateMatchScore = function(otherListing, distance = 0) {
  let score = 0;
  
  // Brand and model must match (base requirement)
  if (this.brand.toLowerCase() !== otherListing.brand.toLowerCase() || 
      this.model.toLowerCase() !== otherListing.model.toLowerCase()) {
    return 0;
  }
  
  // Opposite side requirement
  if (this.side === otherListing.side) {
    return 0;
  }
  
  // Base score for matching brand/model
  score += 50;
  
  // Distance factor (closer = better)
  if (distance <= 5) score += 25;
  else if (distance <= 15) score += 20;
  else if (distance <= 30) score += 15;
  else if (distance <= 50) score += 10;
  else if (distance <= 100) score += 5;
  
  // Price compatibility
  const priceDiff = Math.abs(this.price - otherListing.price);
  const avgPrice = (this.price + otherListing.price) / 2;
  const priceFlexibility = Math.max(this.preferences?.priceFlexibility || 20, 
                                   otherListing.preferences?.priceFlexibility || 20);
  
  if (priceDiff <= (avgPrice * priceFlexibility / 100)) {
    score += 15;
  } else {
    score -= 10;
  }
  
  // Condition compatibility
  const conditionDiff = Math.abs(this.conditionPriority - otherListing.conditionPriority);
  if (conditionDiff === 0) score += 10;
  else if (conditionDiff === 1) score += 5;
  else if (conditionDiff === 2 && (this.preferences?.conditionFlexibility || otherListing.preferences?.conditionFlexibility)) score += 2;
  
  // Recency bonus (newer listings get slight boost)
  const daysSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= 7) score += 5;
  else if (daysSinceCreated <= 14) score += 3;
  
  // User rating factor (if available)
  if (otherListing.user?.rating) {
    if (otherListing.user.rating >= 4.5) score += 5;
    else if (otherListing.user.rating >= 4.0) score += 3;
    else if (otherListing.user.rating >= 3.5) score += 1;
    else if (otherListing.user.rating < 3.0) score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
};

const EarbudListing = mongoose.model('EarbudListing', earbudListingSchema);

export default EarbudListing;
