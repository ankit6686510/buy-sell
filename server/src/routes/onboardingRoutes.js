import express from 'express';
import {
  initializeOnboarding,
  getOnboardingProgress,
  completeOnboardingStep,
  getTutorial,
  getTutorials,
  completeTutorial,
  getFeatureTour,
  updateOnboardingPreferences,
  dismissTip,
  getOnboardingStats,
  initializeDefaultTutorials
} from '../controllers/onboardingController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/tutorials', getTutorials);
router.get('/tutorials/:tutorialId', getTutorial);
router.get('/tours/:tourId', getFeatureTour);

// Protected routes
router.post('/initialize', auth, initializeOnboarding);
router.get('/progress', auth, getOnboardingProgress);
router.post('/step/complete', auth, completeOnboardingStep);
router.post('/tutorials/:tutorialId/complete', auth, completeTutorial);
router.put('/preferences', auth, updateOnboardingPreferences);
router.delete('/tips/:tipId', auth, dismissTip);

// Admin routes (should add admin middleware in production)
router.get('/stats', auth, getOnboardingStats);
router.post('/init-tutorials', auth, initializeDefaultTutorials);

export default router;
