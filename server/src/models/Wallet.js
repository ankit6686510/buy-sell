import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  // Wallet owner
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Balance information
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  blockedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawals: {
    type: Number,
    default: 0,
    min: 0
  },

  // Currency
  currency: {
    type: String,
    default: 'INR'
  },

  // Wallet transactions history (embedded for quick access)
  recentTransactions: [{
    type: {
      type: String,
      enum: ['credit', 'debit', 'blocked', 'unblocked', 'withdrawal']
    },
    amount: Number,
    description: String,
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    balanceAfter: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Bank account details for withdrawals
  bankDetails: {
    accountNumber: {
      type: String,
      select: false // Don't include in regular queries
    },
    ifscCode: {
      type: String,
      select: false
    },
    accountHolderName: String,
    bankName: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },

  // UPI details for quick withdrawals
  upiDetails: {
    upiId: {
      type: String,
      select: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date
  },

  // Withdrawal settings
  withdrawalSettings: {
    minWithdrawalAmount: {
      type: Number,
      default: 100 // Minimum ₹100 withdrawal
    },
    autoWithdraw: {
      type: Boolean,
      default: false
    },
    autoWithdrawThreshold: {
      type: Number,
      default: 1000 // Auto withdraw when balance reaches ₹1000
    }
  },

  // Security and compliance
  kycStatus: {
    type: String,
    enum: ['pending', 'submitted', 'verified', 'rejected'],
    default: 'pending'
  },
  kycDetails: {
    panNumber: {
      type: String,
      select: false
    },
    aadhaarNumber: {
      type: String,
      select: false
    },
    verificationDocuments: [String], // URLs to uploaded documents
    verifiedAt: Date,
    rejectionReason: String
  },

  // Wallet status
  status: {
    type: String,
    enum: ['active', 'suspended', 'frozen', 'closed'],
    default: 'active'
  },
  statusReason: String,

  // Limits and restrictions
  limits: {
    dailyWithdrawalLimit: {
      type: Number,
      default: 25000 // ₹25,000 per day
    },
    monthlyWithdrawalLimit: {
      type: Number,
      default: 100000 // ₹1,00,000 per month
    },
    maxBalance: {
      type: Number,
      default: 200000 // ₹2,00,000 max balance
    }
  },

  // Tracking for limits
  dailyWithdrawn: {
    amount: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  monthlyWithdrawn: {
    amount: {
      type: Number,
      default: 0
    },
    month: {
      type: Number,
      default: () => new Date().getMonth()
    },
    year: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
walletSchema.index({ user: 1 }, { unique: true });
walletSchema.index({ status: 1 });
walletSchema.index({ 'recentTransactions.createdAt': -1 });
walletSchema.index({ kycStatus: 1 });

// Virtuals
walletSchema.virtual('availableBalance').get(function() {
  return this.balance - this.blockedAmount;
});

walletSchema.virtual('totalBalance').get(function() {
  return this.balance + this.pendingAmount;
});

walletSchema.virtual('canWithdraw').get(function() {
  return this.status === 'active' && 
         this.kycStatus === 'verified' && 
         this.availableBalance >= this.withdrawalSettings.minWithdrawalAmount;
});

// Instance methods
walletSchema.methods.credit = async function(amount, description, transactionId = null) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }

  this.balance += amount;
  this.totalEarnings += amount;

  // Add to recent transactions (keep only last 20)
  this.recentTransactions.unshift({
    type: 'credit',
    amount,
    description,
    transactionId,
    balanceAfter: this.balance
  });

  if (this.recentTransactions.length > 20) {
    this.recentTransactions = this.recentTransactions.slice(0, 20);
  }

  return await this.save();
};

walletSchema.methods.debit = async function(amount, description, transactionId = null) {
  if (amount <= 0) {
    throw new Error('Debit amount must be positive');
  }

  if (this.availableBalance < amount) {
    throw new Error('Insufficient balance');
  }

  this.balance -= amount;

  // Add to recent transactions
  this.recentTransactions.unshift({
    type: 'debit',
    amount,
    description,
    transactionId,
    balanceAfter: this.balance
  });

  if (this.recentTransactions.length > 20) {
    this.recentTransactions = this.recentTransactions.slice(0, 20);
  }

  return await this.save();
};

walletSchema.methods.blockAmount = async function(amount, description) {
  if (amount <= 0) {
    throw new Error('Block amount must be positive');
  }

  if (this.availableBalance < amount) {
    throw new Error('Insufficient available balance to block');
  }

  this.blockedAmount += amount;

  // Add to recent transactions
  this.recentTransactions.unshift({
    type: 'blocked',
    amount,
    description,
    balanceAfter: this.balance
  });

  return await this.save();
};

walletSchema.methods.unblockAmount = async function(amount, description) {
  if (amount <= 0) {
    throw new Error('Unblock amount must be positive');
  }

  if (this.blockedAmount < amount) {
    throw new Error('Cannot unblock more than blocked amount');
  }

  this.blockedAmount -= amount;

  // Add to recent transactions
  this.recentTransactions.unshift({
    type: 'unblocked',
    amount,
    description,
    balanceAfter: this.balance
  });

  return await this.save();
};

walletSchema.methods.canWithdrawAmount = function(amount) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Reset daily limit if new day
  if (this.dailyWithdrawn.date.toDateString() !== today.toDateString()) {
    this.dailyWithdrawn.amount = 0;
    this.dailyWithdrawn.date = today;
  }

  // Reset monthly limit if new month
  if (this.monthlyWithdrawn.month !== currentMonth || this.monthlyWithdrawn.year !== currentYear) {
    this.monthlyWithdrawn.amount = 0;
    this.monthlyWithdrawn.month = currentMonth;
    this.monthlyWithdrawn.year = currentYear;
  }

  // Check all conditions
  return {
    canWithdraw: this.canWithdraw &&
                 this.availableBalance >= amount &&
                 (this.dailyWithdrawn.amount + amount) <= this.limits.dailyWithdrawalLimit &&
                 (this.monthlyWithdrawn.amount + amount) <= this.limits.monthlyWithdrawalLimit,
    reasons: {
      insufficientBalance: this.availableBalance < amount,
      dailyLimitExceeded: (this.dailyWithdrawn.amount + amount) > this.limits.dailyWithdrawalLimit,
      monthlyLimitExceeded: (this.monthlyWithdrawn.amount + amount) > this.limits.monthlyWithdrawalLimit,
      walletNotActive: this.status !== 'active',
      kycNotVerified: this.kycStatus !== 'verified',
      belowMinAmount: amount < this.withdrawalSettings.minWithdrawalAmount
    },
    limits: {
      dailyRemaining: this.limits.dailyWithdrawalLimit - this.dailyWithdrawn.amount,
      monthlyRemaining: this.limits.monthlyWithdrawalLimit - this.monthlyWithdrawn.amount
    }
  };
};

walletSchema.methods.processWithdrawal = async function(amount, method = 'bank', details = {}) {
  const withdrawalCheck = this.canWithdrawAmount(amount);
  
  if (!withdrawalCheck.canWithdraw) {
    throw new Error(`Cannot withdraw: ${Object.keys(withdrawalCheck.reasons).filter(key => withdrawalCheck.reasons[key]).join(', ')}`);
  }

  // Debit the amount
  await this.debit(amount, `Withdrawal via ${method}`, null);

  // Update withdrawal tracking
  this.dailyWithdrawn.amount += amount;
  this.monthlyWithdrawn.amount += amount;
  this.totalWithdrawals += amount;

  return await this.save();
};

walletSchema.methods.addPendingAmount = async function(amount, description) {
  this.pendingAmount += amount;
  
  // Add to recent transactions
  this.recentTransactions.unshift({
    type: 'credit',
    amount,
    description: `Pending: ${description}`,
    balanceAfter: this.balance
  });

  return await this.save();
};

walletSchema.methods.releasePendingAmount = async function(amount, description) {
  if (this.pendingAmount < amount) {
    throw new Error('Cannot release more than pending amount');
  }

  this.pendingAmount -= amount;
  return await this.credit(amount, `Released: ${description}`);
};

// Static methods
walletSchema.statics.createWallet = async function(userId) {
  const existingWallet = await this.findOne({ user: userId });
  if (existingWallet) {
    return existingWallet;
  }

  return await this.create({
    user: userId,
    balance: 0,
    pendingAmount: 0,
    blockedAmount: 0
  });
};

walletSchema.statics.getTotalPlatformBalance = async function() {
  const result = await this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: null,
        totalBalance: { $sum: '$balance' },
        totalPending: { $sum: '$pendingAmount' },
        totalBlocked: { $sum: '$blockedAmount' },
        totalEarnings: { $sum: '$totalEarnings' },
        totalWithdrawals: { $sum: '$totalWithdrawals' },
        activeWallets: { $sum: 1 }
      }
    }
  ]);

  return result[0] || {
    totalBalance: 0,
    totalPending: 0,
    totalBlocked: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
    activeWallets: 0
  };
};

// Pre-save middleware
walletSchema.pre('save', function(next) {
  // Ensure balance never goes negative
  if (this.balance < 0) {
    return next(new Error('Wallet balance cannot be negative'));
  }

  // Check maximum balance limit
  if (this.balance > this.limits.maxBalance) {
    return next(new Error('Wallet balance exceeds maximum limit'));
  }

  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
