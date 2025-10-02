import express from 'express';
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  findMatches,
  markAsMatched,
  getRecommendations,
  uploadImages
} from '../controllers/earbudListingController.js';
import { auth } from '../middleware/auth.js';
import upload from '../utils/fileUpload.js';

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListing);

// Protected routes
router.post('/', auth, createListing);
router.post('/upload', auth, upload.array('images', 5), uploadImages);
router.put('/:id', auth, updateListing);
router.delete('/:id', auth, deleteListing);
router.get('/:id/matches', auth, findMatches);
router.post('/match', auth, markAsMatched);
router.get('/recommendations/for-me', auth, getRecommendations);

export default router;
