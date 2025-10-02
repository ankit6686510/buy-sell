import razorpayService from '../services/razorpayService.js';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import ProductListing from '../models/ProductListing.js';
import User from '../models/User.js';
import { PROMOTION_PACKAGES } from '../../client/src/components/promotions/PromotionPackages.jsx';

/**
 * Create a promotion payment order
 * POST /api/payments/promotion
 */
export const createPromotionPayment = async (req, res) => {
  try {
    const {
      listingId,
      packageId,
      duration
    } = req.body;

    // Validate required fields
    if (!listingId || !packageId || !duration) {
      return res.status(400).json({
        message: 'Missing required fields: listingId, packageId, duration'
      });
    }

    // Find the listing
    const listing = await ProductListing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if user owns the listing
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to promote this listing' });
    }

    // Get promotion package details
    const promotionPackage = Object.values(PROMOTION_PACKAGES).find(pkg => pkg.id === packageId);
    if (!promotionPackage) {
      return res.status(400).json({ message: 'Invalid promotion package' });
    }

    // Get pricing for the duration
    const pricing = promotionPackage.pricing[`${duration}_days`];
    if (!pricing) {
      return res.status(400).json({ message: 'Invalid duration for this package' });
    }

    // Create promotion payment data
    const promotionData = {
      packageId: promotionPackage.id,
      packageName: promotionPackage.name,
      duration: pricing.duration,
      price: pricing.price,
      boost: promotionPackage.boost
    };

    // Create Razorpay order
    const { transaction, order, paymentData } = await razorpayService.createPromotionPayment(
      promotionData,
      req.user,
      listing
    );

    res.status(201).json({
      success: true,
      message: 'Promotion payment order created successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status
      },
      paymentData,
      promotionDetails: {
        packageName: promotionPackage.name,
        duration: pricing.duration,
        price: pricing.price,
        features: promotionPackage.features
      }
    });
  } catch (error) {
    console.error('Create promotion payment error:', error);
    res.status(500).json({
      message: 'Failed to create promotion payment',
      error: error.message
    });
  }
};

/**
 * Create a transaction fee payment order
 * POST /api/payments/transaction
 */
export const createTransactionPayment = async (req, res) => {
  try {
    const {
      listingId,
      amount,
      description = 'Product purchase'
    } = req.body;

    // Validate required fields
    if (!listingId || !amount) {
      return res.status(400).json({
        message: 'Missing required fields: listingId, amount'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    // Find the listing
    const listing = await ProductListing.findById(listingId).populate('user');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check if listing is available
    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'Listing is not available for purchase' });
    }

    // Check if buyer is not the seller
    if (listing.user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot buy your own listing' });
    }

    // Create transaction payment
    const transactionData = {
      amount: parseFloat(amount),
      feePercentage: 3, // 3% platform fee
      description
    };

    const { transaction, order, paymentData } = await razorpayService.createTransactionFeePayment(
      transactionData,
      req.user,
      listing.user,
      listing
    );

    res.status(201).json({
      success: true,
      message: 'Transaction payment order created successfully',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        platformFee: transaction.platformFee,
        sellerAmount: transaction.sellerAmount,
        type: transaction.type,
        status: transaction.status
      },
      paymentData,
      listingDetails: {
        title: listing.title,
        price: listing.price,
        seller: {
          name: listing.user.name,
          rating: listing.user.rating
        }
      }
    });
  } catch (error) {
    console.error('Create transaction payment error:', error);
    res.status(500).json({
      message: 'Failed to create transaction payment',
      error: error.message
    });
  }
};

/**
 * Verify payment and complete transaction
 * POST /api/payments/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: 'Missing required payment verification data'
      });
    }

    // Process the payment
    const transaction = await razorpayService.processSuccessfulPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    // Populate transaction details
    await transaction.populate(['buyer', 'seller', 'listing']);

    res.json({
      success: true,
      message: 'Payment verified and processed successfully',
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        completedAt: transaction.completedAt
      },
      result: {
        type: transaction.type,
        details: transaction.type === 'promotion' ? {
          listingId: transaction.listing._id,
          promotionApplied: true,
          boost: transaction.promotionData.boost,
          endDate: transaction.promotionData.endDate
        } : {
          listingId: transaction.listing._id,
          sellerCredited: transaction.sellerAmount,
          listingMarkedSold: true
        }
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(400).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

/**
 * Handle Razorpay webhooks
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!razorpayService.verifyWebhookSignature(body, signature)) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;

    // Process webhook event
    const result = await razorpayService.handleWebhook(event, payload);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      result
    });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

/**
 * Get user's wallet details
 * GET /api/payments/wallet
 */
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    
    if (!wallet) {
      wallet = await Wallet.createWallet(req.user.id);
    }

    res.json({
      success: true,
      wallet: {
        balance: wallet.balance,
        pendingAmount: wallet.pendingAmount,
        availableBalance: wallet.availableBalance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawals: wallet.totalWithdrawals,
        currency: wallet.currency,
        recentTransactions: wallet.recentTransactions.slice(0, 10), // Last 10 transactions
        canWithdraw: wallet.canWithdraw,
        limits: wallet.limits,
        kycStatus: wallet.kycStatus
      }
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      message: 'Failed to fetch wallet details',
      error: error.message
    });
  }
};

/**
 * Initiate wallet withdrawal
 * POST /api/payments/withdraw
 */
export const initiateWithdrawal = async (req, res) => {
  try {
    const {
      amount,
      method = 'bank', // 'bank' or 'upi'
      details = {}
    } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Get user's wallet
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if withdrawal is possible
    const withdrawalCheck = wallet.canWithdrawAmount(amount);
    if (!withdrawalCheck.canWithdraw) {
      return res.status(400).json({
        message: 'Withdrawal not allowed',
        reasons: withdrawalCheck.reasons,
        limits: withdrawalCheck.limits
      });
    }

    // Process withdrawal
    await wallet.processWithdrawal(amount, method, details);

    // Create transaction record for withdrawal
    const transaction = new Transaction({
      buyer: req.user.id,
      seller: req.user.id,
      listing: null, // No listing for withdrawals
      type: 'withdrawal',
      amount,
      platformFee: 0,
      sellerAmount: amount,
      paymentMethod: method,
      status: 'completed',
      description: `Wallet withdrawal via ${method}`,
      completedAt: new Date()
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal processed successfully',
      withdrawal: {
        amount,
        method,
        transactionId: transaction._id,
        newBalance: wallet.balance
      }
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(400).json({
      message: 'Withdrawal failed',
      error: error.message
    });
  }
};

/**
 * Get user's transaction history
 * GET /api/payments/transactions
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status
    } = req.query;

    const query = {
      $or: [
        { buyer: req.user.id },
        { seller: req.user.id }
      ]
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .populate('listing', 'title price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions: transactions.map(txn => ({
        id: txn._id,
        type: txn.type,
        amount: txn.amount,
        platformFee: txn.platformFee,
        status: txn.status,
        description: txn.description,
        buyer: txn.buyer,
        seller: txn.seller,
        listing: txn.listing,
        createdAt: txn.createdAt,
        completedAt: txn.completedAt,
        isUserBuyer: txn.buyer._id.toString() === req.user.id
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      message: 'Failed to fetch transaction history',
      error: error.message
    });
  }
};

/**
 * Get payment statistics for user
 * GET /api/payments/stats
 */
export const getPaymentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // Days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get user's transaction statistics
    const stats = await Transaction.aggregate([
      {
        $match: {
          $or: [{ buyer: userId }, { seller: userId }],
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$platformFee' }
        }
      }
    ]);

    // Get wallet balance
    const wallet = await Wallet.findOne({ user: userId });

    // Calculate totals
    const totals = stats.reduce((acc, stat) => {
      acc.totalTransactions += stat.count;
      acc.totalVolume += stat.totalAmount;
      acc.totalFees += stat.totalFees;
      return acc;
    }, { totalTransactions: 0, totalVolume: 0, totalFees: 0 });

    res.json({
      success: true,
      stats: {
        period: `${period} days`,
        wallet: {
          balance: wallet?.balance || 0,
          pendingAmount: wallet?.pendingAmount || 0,
          totalEarnings: wallet?.totalEarnings || 0
        },
        transactions: {
          total: totals.totalTransactions,
          volume: totals.totalVolume,
          fees: totals.totalFees,
          byType: stats
        }
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

/**
 * Process refund request
 * POST /api/payments/refund
 */
export const processRefund = async (req, res) => {
  try {
    const {
      transactionId,
      reason,
      amount // Optional partial refund amount
    } = req.body;

    // Find the transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('buyer seller listing');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is authorized to request refund
    if (transaction.buyer._id.toString() !== req.user.id &&
        transaction.seller._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to refund this transaction' });
    }

    // Check if transaction can be refunded
    if (transaction.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed transactions can be refunded' });
    }

    if (!transaction.razorpayData.paymentId) {
      return res.status(400).json({ message: 'No payment ID found for refund' });
    }

    // Determine refund amount
    const refundAmount = amount || transaction.amount;

    // Process refund through Razorpay
    const refund = await razorpayService.processRefund(
      transaction.razorpayData.paymentId,
      refundAmount,
      reason
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refundAmount,
        status: refund.status,
        reason
      },
      transaction: {
        id: transaction._id,
        status: transaction.status
      }
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(400).json({
      message: 'Refund processing failed',
      error: error.message
    });
  }
};

/**
 * Update bank details for withdrawals
 * POST /api/payments/bank-details
 */
export const updateBankDetails = async (req, res) => {
  try {
    const {
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName
    } = req.body;

    // Validate required fields
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
      return res.status(400).json({
        message: 'All bank details are required'
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.createWallet(req.user.id);
    }

    // Update bank details
    wallet.bankDetails = {
      accountNumber,
      ifscCode,
      accountHolderName,
      bankName,
      isVerified: false, // Will be verified separately
      verifiedAt: null
    };

    await wallet.save();

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      bankDetails: {
        accountHolderName: wallet.bankDetails.accountHolderName,
        bankName: wallet.bankDetails.bankName,
        isVerified: wallet.bankDetails.isVerified
      }
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      message: 'Failed to update bank details',
      error: error.message
    });
  }
};

/**
 * Update UPI details for withdrawals
 * POST /api/payments/upi-details
 */
export const updateUpiDetails = async (req, res) => {
  try {
    const { upiId } = req.body;

    // Validate UPI ID format (basic validation)
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ message: 'Valid UPI ID is required' });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.createWallet(req.user.id);
    }

    // Update UPI details
    wallet.upiDetails = {
      upiId,
      isVerified: false, // Will be verified separately
      verifiedAt: null
    };

    await wallet.save();

    res.json({
      success: true,
      message: 'UPI details updated successfully',
      upiDetails: {
        upiId: wallet.upiDetails.upiId,
        isVerified: wallet.upiDetails.isVerified
      }
    });
  } catch (error) {
    console.error('Update UPI details error:', error);
    res.status(500).json({
      message: 'Failed to update UPI details',
      error: error.message
    });
  }
};
