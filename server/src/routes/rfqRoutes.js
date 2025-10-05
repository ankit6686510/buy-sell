import express from 'express';
import multer from 'multer';
import {
  createRFQ,
  getRFQ,
  searchRFQs,
  submitQuote,
  getMyRFQs,
  getMyQuotes,
  publishRFQ,
  uploadRFQAttachment,
  awardRFQ,
  getRFQAnalytics
} from '../controllers/rfqController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for RFQ attachments
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and technical files
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, DOC, XLS, and archive files are allowed.'), false);
    }
  }
});

// Public routes (no authentication required)
router.get('/search', searchRFQs);
router.get('/:id', getRFQ);

// Protected routes (require authentication)
router.use(protect);

// RFQ management routes
router.post('/', createRFQ);
router.get('/me/rfqs', getMyRFQs);
router.get('/me/quotes', getMyQuotes);
router.post('/:id/publish', publishRFQ);
router.post('/:rfqId/attachments', upload.single('attachment'), uploadRFQAttachment);

// Quote management routes
router.post('/:rfqId/quotes', submitQuote);
router.post('/:rfqId/award/:supplierId', awardRFQ);

// Analytics routes
router.get('/me/analytics', getRFQAnalytics);

export default router;
