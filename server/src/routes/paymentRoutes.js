import express from 'express';
import {
  createPromotionPayment,
  createTransactionPayment,
  verifyPayment,
  handleWebhook,
  getWallet,
  initiateWithdrawal,
  getTransactionHistory,
  getPaymentStats,
  processRefund,
  updateBankDetails,
  updateUpiDetails
} from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Webhook endpoint (no auth required)
router.post('/webhook', handleWebhook);

// All other routes require authentication
router.use(auth);

// Payment creation endpoints
router.post('/promotion', createPromotionPayment);
router.post('/transaction', createTransactionPayment);

// Payment verification endpoint
router.post('/verify', verifyPayment);

// Wallet management endpoints
router.get('/wallet', getWallet);
router.post('/withdraw', initiateWithdrawal);

// Transaction management endpoints
router.get('/transactions', getTransactionHistory);
router.get('/stats', getPaymentStats);
router.post('/refund', processRefund);

// Bank and UPI details endpoints
router.post('/bank-details', updateBankDetails);
router.post('/upi-details', updateUpiDetails);

export default router;
