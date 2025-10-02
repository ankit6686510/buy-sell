import express from 'express';
import userRoutes from './userRoutes.js';
import productListingRoutes from './productListingRoutes.js';
import messageRoutes from './messageRoutes.js';
import paymentRoutes from './paymentRoutes.js';

const router = express.Router();

// API routes
router.use('/api/users', userRoutes);
router.use('/api/listings', productListingRoutes);
router.use('/api/messages', messageRoutes);
router.use('/api/payments', paymentRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
