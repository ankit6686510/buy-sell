import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  getMe,
  updateProfile,
  updateProfilePicture,
  sendEmailVerification,
  verifyEmail,
  sendPhoneVerification,
  verifyPhone,
  reportUser,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getTrustInfo,
  updateLastActive,
  getUserSubscriptionInfo,
  upgradeSubscription
} from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { userValidationRules } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', userValidationRules.register, register);
router.post('/login', userValidationRules.login, login);
router.post('/logout', logout); // Logout doesn't need authentication
router.post('/refresh-token', refreshToken); // Refresh token endpoint

// Public trust info endpoint
router.get('/trust/:userId', getTrustInfo);

// Authentication verification endpoint
router.get('/me', auth, getMe);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.put('/profile/picture', auth, updateProfilePicture);

// Verification routes
router.post('/verify/email/send', auth, sendEmailVerification);
router.post('/verify/email/confirm', auth, verifyEmail);
router.post('/verify/phone/send', auth, sendPhoneVerification);
router.post('/verify/phone/confirm', auth, verifyPhone);

// Safety and trust routes
router.post('/report', auth, reportUser);
router.post('/block', auth, blockUser);
router.post('/unblock', auth, unblockUser);
router.get('/blocked', auth, getBlockedUsers);

// Activity tracking
router.post('/activity', auth, updateLastActive);

// Subscription and features
router.get('/subscription', auth, getUserSubscriptionInfo);
router.post('/upgrade', auth, upgradeSubscription);

export default router;
