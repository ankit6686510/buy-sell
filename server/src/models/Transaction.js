import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Transaction participants
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductListing',
    required: true
  },

  // Transaction details
  type: {
    type: String,
    enum: ['promotion', 'transaction_fee', 'subscription', 'escrow'],
    required: true
  },
  
  // Financial details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  sellerAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Payment method
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'wallet', 'cod', 'bank_transfer'],
    required: true
  },

  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'disputed', 'refunded', 'cancelled'],
    default: 'pending'
  },

  // Razorpay integration data
  razorpayData: {
    orderId: String,
    paymentId: String,
    signature: String,
    receipt: String,
    attemptId: String
  },

  // Promotion specific data
  promotionData: {
    packageId: String,
    packageName: String,
    duration: Number, // days
    boost: Number,
    startDate: Date,
    endDate: Date
  },

  // Escrow specific data
  escrowData: {
    releaseDate: Date,
    disputeReason: String,
    disputeStatus: {
      type: String,
      enum: ['none', 'raised', 'investigating', 'resolved']
    },
    releaseCondition: {
      type: String,
      enum: ['auto', 'manual', 'dispute_resolution']
    }
  },

  // Transaction metadata
  description: String,
  notes: String,
  ipAddress: String,
  userAgent: String,

  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,

  // Webhook and notification tracking
  webhookReceived: {
    type: Boolean,
    default: false
  },
  notificationsSent: [{
    type: String,
    sentAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
transactionSchema.index({ buyer: 1, createdAt: -1 });
transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ listing: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ 'razorpayData.orderId': 1 });
transactionSchema.index({ 'razorpayData.paymentId': 1 });
transactionSchema.index({ type: 1, status: 1 });

// Virtual for total amount including platform fee
transactionSchema.virtual('totalAmount').get(function() {
  return this.amount + this.platformFee;
});

// Virtual for transaction age
transactionSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.initiatedAt) / (1000 * 60 * 60));
});

// Instance methods
transactionSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

transactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.notes = reason || this.notes;
  return this.save();
};

transactionSchema.methods.initiateRefund = function(reason) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.notes = `Refunded: ${reason}`;
  return this.save();
};

transactionSchema.methods.calculatePlatformFee = function(feePercentage = 2.9, fixedFee = 0) {
  // Calculate Razorpay + platform fee
  const razorpayFee = (this.amount * 0.029) + 2; // Razorpay standard fees
  const platformFee = (this.amount * feePercentage / 100) + fixedFee;
  this.platformFee = Math.round((razorpayFee + platformFee) * 100) / 100;
  this.sellerAmount = this.amount - this.platformFee;
  return this.platformFee;
};

// Static methods for analytics
transactionSchema.statics.getRevenueStats = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$platformFee' },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' },
        totalVolume: { $sum: '$amount' }
      }
    }
  ]);
};

transactionSchema.statics.getRevenueByType = async function(startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$type',
        revenue: { $sum: '$platformFee' },
        count: { $sum: 1 },
        volume: { $sum: '$amount' }
      }
    }
  ]);
};

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Auto-calculate seller amount if not set
  if (this.isModified('amount') || this.isModified('platformFee')) {
    this.sellerAmount = this.amount - this.platformFee;
  }

  // Set promotion end date if promotion transaction
  if (this.type === 'promotion' && this.promotionData && this.promotionData.duration) {
    if (!this.promotionData.startDate) {
      this.promotionData.startDate = new Date();
    }
    this.promotionData.endDate = new Date(
      this.promotionData.startDate.getTime() + 
      (this.promotionData.duration * 24 * 60 * 60 * 1000)
    );
  }

  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
