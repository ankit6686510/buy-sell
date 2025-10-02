import express from 'express';
import {
  trackActivity,
  trackPageView,
  trackConversion,
  trackError,
  getDashboardData,
  getUserJourney,
  getFunnelAnalysis,
  trackABTest,
  getABTestResults
} from '../controllers/analyticsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public tracking endpoints (no auth required for basic tracking)
router.post('/track/activity', trackActivity);
router.post('/track/pageview', trackPageView);
router.post('/track/conversion', trackConversion);
router.post('/track/error', trackError);
router.post('/track/abtest', trackABTest);

// Protected analytics endpoints (admin only would be ideal)
router.get('/dashboard', auth, getDashboardData);
router.get('/user/:userId/journey', auth, getUserJourney);
router.get('/funnel', auth, getFunnelAnalysis);
router.get('/abtest/:testName/results', auth, getABTestResults);

export default router;
