import express from 'express';
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  getSimilarListings,
  toggleFavorite,
  getUserFavorites,
  getRecommendations,
  uploadImages,
  markAsSold,
  reportListing
} from '../controllers/productListingController.js';
import { auth } from '../middleware/auth.js';
import upload from '../utils/fileUpload.js';

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListing);
router.get('/:id/similar', getSimilarListings);

// Protected routes
router.post('/', auth, createListing);
router.post('/upload', auth, upload.array('images', 10), uploadImages);
router.put('/:id', auth, updateListing);
router.delete('/:id', auth, deleteListing);

// Favorites
router.post('/:id/favorite', auth, toggleFavorite);
router.get('/favorites/mine', auth, getUserFavorites);

// Actions
router.post('/:id/sold', auth, markAsSold);
router.post('/:id/report', auth, reportListing);

// Recommendations
router.get('/recommendations/for-me', auth, getRecommendations);

export default router;
