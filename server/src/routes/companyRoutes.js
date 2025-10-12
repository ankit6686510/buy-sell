import express from 'express';
import multer from 'multer';
import {
  createCompanyProfile,
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyImage,
  uploadCompanyDocument,
  getMyCompanyProfile,
  searchCompanies,
  getCompaniesByCategory,
  addLeadCredits,
  getCompanyAnalytics
} from '../controllers/companyController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDF/DOC files are allowed.'), false);
    }
  }
});

// Public routes
router.get('/search', searchCompanies);
router.get('/category/:category', getCompaniesByCategory);
router.get('/:id', getCompanyProfile);

// Protected routes (require authentication)
router.use(auth);

// Company profile management
router.post('/', createCompanyProfile);
router.get('/me/profile', getMyCompanyProfile);
router.put('/me/profile', updateCompanyProfile);

// Image uploads
router.post('/me/upload/:type', upload.single('image'), uploadCompanyImage);

// Document uploads
router.post('/me/documents', upload.single('document'), uploadCompanyDocument);

// Lead credits management
router.post('/me/credits', addLeadCredits);

// Analytics
router.get('/me/analytics', getCompanyAnalytics);

export default router;
