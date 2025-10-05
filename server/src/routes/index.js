import express from 'express';
import userRoutes from './userRoutes.js';
import productListingRoutes from './productListingRoutes.js';
import messageRoutes from './messageRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import companyRoutes from './companyRoutes.js';
import rfqRoutes from './rfqRoutes.js';

const router = express.Router();

// API routes
router.use('/api/users', userRoutes);
router.use('/api/listings', productListingRoutes);
router.use('/api/messages', messageRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/companies', companyRoutes);
router.use('/api/rfqs', rfqRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
