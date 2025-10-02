import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // Long-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Legacy function for backward compatibility
export const generateToken = (user) => {
  return generateTokens(user).accessToken;
};

export const auth = async (req, res, next) => {
  try {
    // Get access token from HTTP-only cookie
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify access token
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
