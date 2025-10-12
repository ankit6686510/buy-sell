import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/User.js';
import Message from './src/models/Message.js';
import ProductListing from './src/models/ProductListing.js';
import Chat from './src/models/Chat.js';

// Import socket.io initialization
import { initializeSocket } from './socket.js';

// Import services
import emailService from './src/services/emailService.js';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import productListingRoutes from './src/routes/productListingRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';
import ratingRoutes from './src/routes/ratingRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import onboardingRoutes from './src/routes/onboardingRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
const io = initializeSocket(httpServer);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure storage for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'budmatching_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Make io accessible to the routes
app.set('io', io);

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      logger.info('Connected to MongoDB');
      return;
    } catch (error) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries} failed:`, error);
      if (retries === maxRetries) {
        logger.error('Max retries reached. Could not connect to MongoDB');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectWithRetry();

// Configure JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'budmatching_jwt_secret'
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Modified upload handler for Cloudinary
const handleCloudinaryUpload = async (file) => {
  return new Promise((resolve, reject) => {
    // Create a buffer from the file data
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    cloudinary.uploader.upload(dataURI, {
      folder: 'SecondMarket'
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });
};

// Auth check middleware
const authCheck = passport.authenticate('jwt', { session: false });

// Add a verification endpoint for user's token
app.get('/api/auth/verify', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ valid: false, message: 'User not found' });
    }
    
    res.status(200).json({ valid: true, user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

// Add password reset routes
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });
    
    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetUrl, resetToken);
      
      res.status(200).json({ 
        message: 'Password reset email sent successfully'
      });
    } catch (emailError) {
      logger.error('Email sending error:', emailError);
      
      // Reset the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500).json({ 
        message: 'Email could not be sent. Please try again later.' 
      });
    }
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Hash token to compare with what's in the database
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/listings', productListingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/companies', companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Environment variable validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars);
    process.exit(1);
  }
  
  // Validate MongoDB URI format
  if (!process.env.MONGODB_URI.startsWith('mongodb://') && 
      !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    logger.error('Invalid MongoDB URI format');
    process.exit(1);
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }
};

// Validate environment variables before starting the server
validateEnvVars();

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Start server with port fallback
const startServer = async () => {
  try {
    const port = await findAvailablePort(parseInt(process.env.PORT) || 5000);
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
