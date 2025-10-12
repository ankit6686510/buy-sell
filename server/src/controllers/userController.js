import User from '../models/User.js';
import Company from '../models/Company.js';
import { generateTokens, verifyRefreshToken } from '../middleware/auth.js';
import { validationResult } from 'express-validator';
import { getUserFeatures, getLeadCreditLimit, getUpgradeOptions, SUBSCRIPTION_PRICING } from '../utils/featureAccess.js';

export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    console.log('Request body:', req.body);
    const { email, password, name, location, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    console.log('Creating new user with data:', {
      email,
      name,
      address: location,
      phoneNumber: phoneNumber || 'not provided'
    });

    // Create new user
    const user = new User({
      email,
      password,
      name,
      address: location,
      phoneNumber
    });

    console.log('User object created, attempting to save...');
    await user.save();
    console.log('User saved successfully');

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.address,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Registration error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    if (error.name === 'ValidationError') {
      console.log('Mongoose validation error:', error.errors);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    if (error.code === 11000) {
      console.log('Duplicate key error:', error.keyValue);
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating user',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.address,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, location, phoneNumber } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (location) user.address = location;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.address,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assuming the image URL is passed in the request body
    const { profilePicture } = req.body;
    user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: 'Profile picture updated successfully',
      profilePicture: user.profilePicture
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
};

// Verification endpoints
export const sendEmailVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verification.email.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const token = user.generateVerificationToken('email');
    await user.save();

    // TODO: In production, send actual email
    // For now, return token in response (remove in production)
    res.json({
      message: 'Verification email sent',
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = user.verifyToken('email', token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    await user.save();

    res.json({
      message: 'Email verified successfully',
      verification: user.verification,
      trustScore: user.trustScore,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

export const sendPhoneVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.phoneNumber) {
      return res.status(400).json({ message: 'Phone number not provided' });
    }

    if (user.verification.phone.verified) {
      return res.status(400).json({ message: 'Phone already verified' });
    }

    const token = user.generateVerificationToken('phone');
    await user.save();

    // TODO: In production, send actual SMS
    // For now, return token in response (remove in production)
    res.json({
      message: 'Verification SMS sent to your phone',
      token: process.env.NODE_ENV === 'development' ? token : undefined
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification SMS', error: error.message });
  }
};

export const verifyPhone = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValid = user.verifyToken('phone', token);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    await user.save();

    res.json({
      message: 'Phone verified successfully',
      verification: user.verification,
      trustScore: user.trustScore,
      badges: user.badges
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying phone', error: error.message });
  }
};

// Trust and safety endpoints
export const reportUser = async (req, res) => {
  try {
    const { userId, reason, description } = req.body;
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already reported this person
    const existingReport = reportedUser.safetyReports.find(
      report => report.reportedBy.toString() === req.user.id
    );

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this user' });
    }

    reportedUser.safetyReports.push({
      reportedBy: req.user.id,
      reason,
      description
    });

    // Recalculate trust score
    reportedUser.calculateTrustScore();
    await reportedUser.save();

    res.json({
      message: 'User reported successfully',
      reportId: reportedUser.safetyReports[reportedUser.safetyReports.length - 1]._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error reporting user', error: error.message });
  }
};

export const blockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const user = await User.findById(req.user.id);
    const userToBlock = await User.findById(userId);

    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.blockUser(userId);
    await user.save();

    res.json({
      message: 'User blocked successfully',
      blockedUsers: user.blockedUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error blocking user', error: error.message });
  }
};

export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(req.user.id);
    user.unblockUser(userId);
    await user.save();

    res.json({
      message: 'User unblocked successfully',
      blockedUsers: user.blockedUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error unblocking user', error: error.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('blockedUsers', 'name avatar');

    res.json({
      blockedUsers: user.blockedUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blocked users', error: error.message });
  }
};

export const getTrustInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('name avatar rating totalRatings verification trustScore badges joinedAt lastActive');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate days since joined
    const daysSinceJoined = Math.floor((Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24));
    const daysSinceActive = Math.floor((Date.now() - user.lastActive) / (1000 * 60 * 60 * 24));

    res.json({
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        rating: user.rating,
        totalRatings: user.totalRatings,
        trustScore: user.trustScore,
        badges: user.badges,
        verification: {
          email: user.verification.email.verified,
          phone: user.verification.phone.verified,
          identity: user.verification.identity.verified
        },
        memberSince: user.joinedAt,
        daysSinceJoined,
        daysSinceActive,
        isActive: daysSinceActive <= 7
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trust info', error: error.message });
  }
};

export const updateLastActive = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.lastActive = new Date();
    user.calculateTrustScore();
    await user.save();

    res.json({ message: 'Activity updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating activity', error: error.message });
  }
};

// Get current user from cookie (for authentication verification)
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.address,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        verification: user.verification,
        trustScore: user.trustScore,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Refresh access token using refresh token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not provided' });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Set new HTTP-only cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        location: user.address,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token', error: error.message });
  }
};

// Logout user (clear both cookies)
export const logout = async (req, res) => {
  try {
    // Clear both HTTP-only cookies
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax"
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};

// Get user features and subscription information
export const getUserSubscriptionInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a company profile
    const company = await Company.findOne({ user: user._id });

    // Get available features
    const features = getUserFeatures(user, company);
    const leadCreditLimit = getLeadCreditLimit(user);
    const upgradeOptions = getUpgradeOptions(user);

    // Get current subscription pricing
    const currentPricing = SUBSCRIPTION_PRICING[user.accountType]?.[user.subscriptionTier] || null;

    res.json({
      success: true,
      user: {
        id: user._id,
        accountType: user.accountType,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry
      },
      company: company ? {
        id: company._id,
        companyName: company.companyName,
        leadCredits: company.leadCredits || 0,
        verificationStatus: company.verificationStatus
      } : null,
      features,
      limits: {
        leadCredits: leadCreditLimit
      },
      subscription: {
        current: {
          tier: user.subscriptionTier,
          accountType: user.accountType,
          pricing: currentPricing
        },
        upgradeOptions
      }
    });
  } catch (error) {
    console.error('Get user features error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user features', 
      error: error.message 
    });
  }
};

// Upgrade user subscription
export const upgradeSubscription = async (req, res) => {
  try {
    const { targetTier } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Validate upgrade path
    const upgradeOptions = getUpgradeOptions(user);
    const validUpgrade = upgradeOptions.find(option => option.tier === targetTier);
    
    if (!validUpgrade) {
      return res.status(400).json({
        success: false,
        message: 'Invalid upgrade tier',
        availableUpgrades: upgradeOptions
      });
    }

    // Update user subscription
    user.subscriptionTier = targetTier;
    
    // Set subscription expiry (monthly billing)
    const now = new Date();
    user.subscriptionExpiry = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    
    await user.save();

    // Get updated features
    const company = await Company.findOne({ user: user._id });
    const features = getUserFeatures(user, company);
    const leadCreditLimit = getLeadCreditLimit(user);

    res.json({
      success: true,
      message: `Successfully upgraded to ${validUpgrade.name} tier`,
      user: {
        id: user._id,
        accountType: user.accountType,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry
      },
      features,
      limits: {
        leadCredits: leadCreditLimit
      }
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error upgrading subscription', 
      error: error.message 
    });
  }
};
