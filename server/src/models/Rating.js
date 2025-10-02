import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EarbudListing',
    required: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },
  categories: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    itemCondition: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    helpful: {
      type: Boolean,
      default: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    content: {
      type: String,
      trim: true,
      maxlength: 300
    },
    respondedAt: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['active', 'flagged', 'removed'],
    default: 'active'
  },
  flagReports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate_content', 'fake_review', 'spam', 'harassment', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    photos: [String], // URLs to photos of the transaction/item
    tags: [String], // e.g., ['fast_delivery', 'great_communication', 'as_described']
    transactionValue: Number,
    meetupLocation: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ratingSchema.index({ ratee: 1, createdAt: -1 });
ratingSchema.index({ rater: 1, createdAt: -1 });
ratingSchema.index({ listing: 1 });
ratingSchema.index({ rating: -1, createdAt: -1 });
ratingSchema.index({ status: 1, createdAt: -1 });

// Compound index to prevent duplicate ratings
ratingSchema.index({ rater: 1, ratee: 1, listing: 1 }, { unique: true });

// Virtual for helpful votes count
ratingSchema.virtual('helpfulCount').get(function() {
  return this.helpfulVotes.filter(vote => vote.helpful).length;
});

// Virtual for not helpful votes count
ratingSchema.virtual('notHelpfulCount').get(function() {
  return this.helpfulVotes.filter(vote => !vote.helpful).length;
});

// Virtual for overall helpfulness ratio
ratingSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulVotes.length;
  if (total === 0) return 0;
  return this.helpfulCount / total;
});

// Method to check if user has voted on this review
ratingSchema.methods.hasUserVoted = function(userId) {
  return this.helpfulVotes.some(vote => vote.user.toString() === userId.toString());
};

// Method to add or update a helpful vote
ratingSchema.methods.addHelpfulVote = function(userId, isHelpful) {
  const existingVote = this.helpfulVotes.find(vote => 
    vote.user.toString() === userId.toString()
  );
  
  if (existingVote) {
    existingVote.helpful = isHelpful;
    existingVote.votedAt = new Date();
  } else {
    this.helpfulVotes.push({
      user: userId,
      helpful: isHelpful
    });
  }
};

// Method to remove a helpful vote
ratingSchema.methods.removeHelpfulVote = function(userId) {
  this.helpfulVotes = this.helpfulVotes.filter(vote => 
    vote.user.toString() !== userId.toString()
  );
};

// Method to add a response from the rated user
ratingSchema.methods.addResponse = function(content) {
  this.response = {
    content,
    respondedAt: new Date()
  };
};

// Method to flag this review
ratingSchema.methods.flagReview = function(reportedBy, reason, description) {
  this.flagReports.push({
    reportedBy,
    reason,
    description
  });
  
  // Auto-flag if multiple reports
  if (this.flagReports.length >= 3) {
    this.status = 'flagged';
  }
};

// Static method to calculate user's overall rating
ratingSchema.statics.calculateUserRating = async function(userId) {
  const pipeline = [
    { $match: { ratee: new mongoose.Types.ObjectId(userId), status: 'active' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        communicationAvg: { $avg: '$categories.communication' },
        reliabilityAvg: { $avg: '$categories.reliability' },
        itemConditionAvg: { $avg: '$categories.itemCondition' },
        overallAvg: { $avg: '$categories.overall' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      categories: {
        communication: 0,
        reliability: 0,
        itemCondition: 0,
        overall: 0
      }
    };
  }
  
  const stats = result[0];
  return {
    averageRating: Math.round(stats.averageRating * 10) / 10,
    totalRatings: stats.totalRatings,
    categories: {
      communication: Math.round((stats.communicationAvg || 0) * 10) / 10,
      reliability: Math.round((stats.reliabilityAvg || 0) * 10) / 10,
      itemCondition: Math.round((stats.itemConditionAvg || 0) * 10) / 10,
      overall: Math.round((stats.overallAvg || 0) * 10) / 10
    }
  };
};

// Static method to get rating distribution
ratingSchema.statics.getRatingDistribution = async function(userId) {
  const pipeline = [
    { $match: { ratee: new mongoose.Types.ObjectId(userId), status: 'active' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ];
  
  const result = await this.aggregate(pipeline);
  
  // Create distribution object with all ratings 1-5
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  result.forEach(item => {
    distribution[item._id] = item.count;
  });
  
  return distribution;
};

// Pre-save middleware to validate categories
ratingSchema.pre('save', function(next) {
  // Ensure categories average matches overall rating if not provided
  if (this.categories.communication && this.categories.reliability && this.categories.itemCondition) {
    if (!this.categories.overall) {
      this.categories.overall = Math.round(
        (this.categories.communication + this.categories.reliability + this.categories.itemCondition) / 3
      );
    }
  }
  
  next();
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
