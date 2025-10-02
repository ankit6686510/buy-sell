import api from './api';

// Login user (now uses HTTP-only cookies)
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/users/login', credentials);
    // Cookie is automatically set by the server
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.response && error.response.data) {
      throw { message: error.response.data.message || 'Login failed' };
    }
    
    throw { message: 'Login failed. Please check your connection and try again.' };
  }
};

// Register user (now uses HTTP-only cookies)
export const register = async (userData) => {
  try {
    const response = await api.post('/api/users/register', userData);
    // Cookie is automatically set by the server
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.response && error.response.data) {
      throw { message: error.response.data.message || 'Registration failed' };
    }
    
    throw { message: 'Registration failed. Please check your connection and try again.' };
  }
};

// Logout user (clears HTTP-only cookie)
export const logout = async () => {
  try {
    await api.post('/api/users/logout');
    // Cookie is automatically cleared by the server
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, we can still redirect user to login
  }
};

// Check if user is authenticated using the /me endpoint
export const checkAuth = async () => {
  try {
    const response = await api.get('/api/users/me');
    return response.data;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Profile update failed' };
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/users/password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password change failed' };
  }
};

// Request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Forgot password request failed' };
  }
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post('/api/auth/reset-password', { 
      token, 
      password: newPassword 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Password reset failed' };
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

// Update profile picture
export const updateProfilePicture = async (pictureData) => {
  try {
    const response = await api.post('/api/users/profile/picture', pictureData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile picture' };
  }
};
