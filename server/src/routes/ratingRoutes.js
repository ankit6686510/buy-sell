import express from 'express';
import {
  createRating,
  getUserRatings,
  getRatingsGiven,
  updateRating,
  addRatingResponse,
  voteOnRating,
  removeVoteFromRating,
  flagRating,
  getRatingSummary
} from '../controllers/ratingController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/user/:userId', getUserRatings);
router.get('/user/:userId/summary', getRatingSummary);

// Protected routes
router.post('/', auth, createRating);
router.get('/given/:userId', auth, getRatingsGiven);
router.put('/:ratingId', auth, updateRating);
router.post('/:ratingId/response', auth, addRatingResponse);
router.post('/:ratingId/vote', auth, voteOnRating);
router.delete('/:ratingId/vote', auth, removeVoteFromRating);
router.post('/:ratingId/flag', auth, flagRating);

export default router;
