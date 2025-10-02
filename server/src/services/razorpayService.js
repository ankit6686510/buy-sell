import Razorpay from 'razorpay';
import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import ProductListing from '../models/ProductListing.js';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class RazorpayService {
  constructor() {
    this.razorpay = razorpay;
  }

  /**
   * Create a Razorpay order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Razorpay order object
   */
  async createOrder(orderData) {
    try {
      const {
        amount, // Amount in paise (multiply by 100)
        currency = 'INR',
        receipt,
        notes = {}
      } = orderData;

      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
        payment_capture: 1 // Auto capture payment
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   * @param {Object} paymentData - Payment verification data
   * @returns {boolean} True if signature is valid
   */
  verifyPaymentSignature(paymentData) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = paymentData;

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error('Payment signature verification error:', error);
      return false;
    }
  }

  /**
   * Create promotion payment order
   * @param {Object} promotionData - Promotion package details
   * @param {Object} user - User object
   * @param {Object} listing - Listing object
   * @returns {Promise<Object>} Order and transaction details
   */
  async createPromotionPayment(promotionData, user, listing) {
    try {
      const {
        packageId,
        packageName,
        duration,
        price,
        boost
      } = promotionData;

      // Create transaction record
      const transaction = new Transaction({
        buyer: user._id,
        seller: user._id, // For promotions, buyer and seller are same
        listing: listing._id,
        type: 'promotion',
        amount: price,
        platformFee: 0, // No platform fee for promotions
        sellerAmount: price,
        paymentMethod: 'razorpay',
        status: 'pending',
        promotionData: {
          packageId,
          packageName,
          duration,
          boost,
          startDate: new Date(),
          endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
        },
        description: `${packageName} promotion for ${duration} days`
      });

      await transaction.save();

      // Create Razorpay order
      const order = await this.createOrder({
        amount: price,
        receipt: `promo_${transaction._id}`,
        notes: {
          transaction_id: transaction._id.toString(),
          user_id: user._id.toString(),
          listing_id: listing._id.toString(),
          package_id: packageId,
          type: 'promotion'
        }
      });

      // Update transaction with Razorpay order details
      transaction.razorpayData.orderId = order.id;
      transaction.razorpayData.receipt = order.receipt;
      await transaction.save();

      return {
        transaction,
        order,
        paymentData: {
          key: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'SecondMarket',
          description: `${packageName} Promotion`,
          order_id: order.id,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phoneNumber || ''
          },
          theme: {
            color: '#3b82f6'
          }
        }
      };
    } catch (error) {
      console.error('Promotion payment creation error:', error);
      throw new Error(`Failed to create promotion payment: ${error.message}`);
    }
  }

  /**
   * Create transaction fee payment order
   * @param {Object} transactionData - Transaction details
   * @param {Object} buyer - Buyer user object
   * @param {Object} seller - Seller user object
   * @param {Object} listing - Listing object
   * @returns {Promise<Object>} Order and transaction details
   */
  async createTransactionFeePayment(transactionData, buyer, seller, listing) {
    try {
      const {
        amount,
        feePercentage = 3, // 3% platform fee
        description = 'Product purchase'
      } = transactionData;

      // Calculate platform fee
      const platformFee = Math.round(amount * feePercentage / 100);
      const sellerAmount = amount - platformFee;

      // Create transaction record
      const transaction = new Transaction({
        buyer: buyer._id,
        seller: seller._id,
        listing: listing._id,
        type: 'transaction_fee',
        amount,
        platformFee,
        sellerAmount,
        paymentMethod: 'razorpay',
        status: 'pending',
        description
      });

      await transaction.save();

      // Create Razorpay order
      const order = await this.createOrder({
        amount,
        receipt: `txn_${transaction._id}`,
        notes: {
          transaction_id: transaction._id.toString(),
          buyer_id: buyer._id.toString(),
          seller_id: seller._id.toString(),
          listing_id: listing._id.toString(),
          type: 'transaction_fee'
        }
      });

      // Update transaction with Razorpay order details
      transaction.razorpayData.orderId = order.id;
      transaction.razorpayData.receipt = order.receipt;
      await transaction.save();

      return {
        transaction,
        order,
        paymentData: {
          key: process.env.RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'SecondMarket',
          description: description,
          order_id: order.id,
          prefill: {
            name: buyer.name,
            email: buyer.email,
            contact: buyer.phoneNumber || ''
          },
          theme: {
            color: '#3b82f6'
          }
        }
      };
    } catch (error) {
      console.error('Transaction fee payment creation error:', error);
      throw new Error(`Failed to create transaction payment: ${error.message}`);
    }
  }

  /**
   * Process successful payment
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise<Object>} Updated transaction
   */
  async processSuccessfulPayment(paymentData) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = paymentData;

      // Verify payment signature
      if (!this.verifyPaymentSignature(paymentData)) {
        throw new Error('Invalid payment signature');
      }

      // Find transaction by order ID
      const transaction = await Transaction.findOne({
        'razorpayData.orderId': razorpay_order_id
      }).populate('buyer seller listing');

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Update transaction with payment details
      transaction.razorpayData.paymentId = razorpay_payment_id;
      transaction.razorpayData.signature = razorpay_signature;
      transaction.status = 'completed';
      transaction.completedAt = new Date();

      await transaction.save();

      // Process based on transaction type
      switch (transaction.type) {
        case 'promotion':
          await this.processPromotionPayment(transaction);
          break;
        case 'transaction_fee':
          await this.processTransactionFeePayment(transaction);
          break;
        case 'subscription':
          await this.processSubscriptionPayment(transaction);
          break;
        default:
          console.warn(`Unknown transaction type: ${transaction.type}`);
      }

      return transaction;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  /**
   * Process promotion payment
   * @param {Object} transaction - Transaction object
   */
  async processPromotionPayment(transaction) {
    try {
      // Update listing with promotion
      const listing = await ProductListing.findById(transaction.listing);
      if (listing) {
        listing.promotion = {
          type: transaction.promotionData.packageId,
          startDate: transaction.promotionData.startDate,
          endDate: transaction.promotionData.endDate,
          boost: transaction.promotionData.boost
        };
        listing.featured = true;
        listing.priority = transaction.promotionData.boost;
        
        await listing.save();
      }

      console.log(`Promotion applied to listing ${transaction.listing}: ${transaction.promotionData.packageName}`);
    } catch (error) {
      console.error('Promotion processing error:', error);
      throw error;
    }
  }

  /**
   * Process transaction fee payment
   * @param {Object} transaction - Transaction object
   */
  async processTransactionFeePayment(transaction) {
    try {
      // Credit seller's wallet
      let sellerWallet = await Wallet.findOne({ user: transaction.seller });
      if (!sellerWallet) {
        sellerWallet = await Wallet.createWallet(transaction.seller);
      }

      await sellerWallet.credit(
        transaction.sellerAmount,
        `Payment for listing: ${transaction.listing.title || 'Product'}`,
        transaction._id
      );

      // Mark listing as sold
      const listing = await ProductListing.findById(transaction.listing);
      if (listing) {
        listing.status = 'sold';
        listing.soldAt = new Date();
        await listing.save();
      }

      console.log(`Transaction fee processed: ₹${transaction.amount}, Seller gets: ₹${transaction.sellerAmount}`);
    } catch (error) {
      console.error('Transaction fee processing error:', error);
      throw error;
    }
  }

  /**
   * Process subscription payment
   * @param {Object} transaction - Transaction object
   */
  async processSubscriptionPayment(transaction) {
    try {
      // Update user subscription status
      // This will be implemented when subscription model is created
      console.log(`Subscription payment processed for user: ${transaction.buyer}`);
    } catch (error) {
      console.error('Subscription processing error:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   * @param {string} orderId - Razorpay order ID
   * @param {string} reason - Failure reason
   * @returns {Promise<Object>} Updated transaction
   */
  async handlePaymentFailure(orderId, reason = 'Payment failed') {
    try {
      const transaction = await Transaction.findOne({
        'razorpayData.orderId': orderId
      });

      if (transaction) {
        await transaction.markAsFailed(reason);
      }

      return transaction;
    } catch (error) {
      console.error('Payment failure handling error:', error);
      throw error;
    }
  }

  /**
   * Process refund
   * @param {string} paymentId - Razorpay payment ID
   * @param {number} amount - Refund amount in rupees
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund details
   */
  async processRefund(paymentId, amount, reason = 'Refund requested') {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // Convert to paise
        notes: {
          reason,
          refund_date: new Date().toISOString()
        }
      });

      // Update transaction status
      const transaction = await Transaction.findOne({
        'razorpayData.paymentId': paymentId
      });

      if (transaction) {
        await transaction.initiateRefund(reason);
      }

      return refund;
    } catch (error) {
      console.error('Refund processing error:', error);
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * @param {string} body - Webhook body
   * @param {string} signature - Webhook signature
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body, 'utf8')
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Handle webhook events
   * @param {string} event - Event type
   * @param {Object} payload - Event payload
   * @returns {Promise<Object>} Processing result
   */
  async handleWebhook(event, payload) {
    try {
      console.log(`Processing webhook event: ${event}`);

      switch (event) {
        case 'payment.captured':
          return await this.handlePaymentCaptured(payload.payment.entity);
        
        case 'payment.failed':
          return await this.handlePaymentFailed(payload.payment.entity);
        
        case 'order.paid':
          return await this.handleOrderPaid(payload.order.entity);
        
        case 'refund.created':
          return await this.handleRefundCreated(payload.refund.entity);
        
        default:
          console.log(`Unhandled webhook event: ${event}`);
          return { status: 'ignored', event };
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle payment captured webhook
   * @param {Object} payment - Payment entity
   */
  async handlePaymentCaptured(payment) {
    try {
      const transaction = await Transaction.findOne({
        'razorpayData.orderId': payment.order_id
      });

      if (transaction && transaction.status === 'pending') {
        transaction.razorpayData.paymentId = payment.id;
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        transaction.webhookReceived = true;

        await transaction.save();

        // Process payment based on type
        await this.processPaymentByType(transaction);
      }

      return { status: 'processed', transaction_id: transaction?._id };
    } catch (error) {
      console.error('Payment captured webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed webhook
   * @param {Object} payment - Payment entity
   */
  async handlePaymentFailed(payment) {
    try {
      const transaction = await Transaction.findOne({
        'razorpayData.orderId': payment.order_id
      });

      if (transaction) {
        await transaction.markAsFailed(`Payment failed: ${payment.error_description || 'Unknown error'}`);
      }

      return { status: 'failed', transaction_id: transaction?._id };
    } catch (error) {
      console.error('Payment failed webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle order paid webhook
   * @param {Object} order - Order entity
   */
  async handleOrderPaid(order) {
    // This is usually handled by payment.captured event
    console.log(`Order paid webhook received for order: ${order.id}`);
    return { status: 'acknowledged', order_id: order.id };
  }

  /**
   * Handle refund created webhook
   * @param {Object} refund - Refund entity
   */
  async handleRefundCreated(refund) {
    try {
      const transaction = await Transaction.findOne({
        'razorpayData.paymentId': refund.payment_id
      });

      if (transaction) {
        transaction.status = 'refunded';
        transaction.refundedAt = new Date();
        transaction.notes = `Refunded: ${refund.notes?.reason || 'Refund processed'}`;
        await transaction.save();

        // Handle refund based on transaction type
        if (transaction.type === 'transaction_fee') {
          // Debit from seller's wallet if applicable
          const sellerWallet = await Wallet.findOne({ user: transaction.seller });
          if (sellerWallet && sellerWallet.balance >= transaction.sellerAmount) {
            await sellerWallet.debit(
              transaction.sellerAmount,
              `Refund for transaction: ${transaction._id}`,
              transaction._id
            );
          }
        }
      }

      return { status: 'refunded', transaction_id: transaction?._id };
    } catch (error) {
      console.error('Refund created webhook error:', error);
      throw error;
    }
  }

  /**
   * Process payment based on transaction type
   * @param {Object} transaction - Transaction object
   */
  async processPaymentByType(transaction) {
    switch (transaction.type) {
      case 'promotion':
        await this.processPromotionPayment(transaction);
        break;
      case 'transaction_fee':
        await this.processTransactionFeePayment(transaction);
        break;
      case 'subscription':
        await this.processSubscriptionPayment(transaction);
        break;
      default:
        console.warn(`Unknown transaction type: ${transaction.type}`);
    }
  }

  /**
   * Get payment details
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPaymentDetails(paymentId) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Get payment details error:', error);
      throw new Error(`Failed to get payment details: ${error.message}`);
    }
  }

  /**
   * Get order details
   * @param {string} orderId - Razorpay order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      return await this.razorpay.orders.fetch(orderId);
    } catch (error) {
      console.error('Get order details error:', error);
      throw new Error(`Failed to get order details: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new RazorpayService();
