import api from './api';

// --- Helper function for consistent error throwing ---
const throwServiceError = (error, defaultMessage) => {
    // Check if the error is from Axios (it will have a 'response' object)
    if (error.response && error.response.data && error.response.data.message) {
        // Throw a standard Error object with the backend message
        throw new Error(error.response.data.message);
    }
    // Check for other types of errors (e.g., network timeout, CORS issues)
    if (error.message) {
        throw new Error(`Connection Error: ${error.message}`);
    }
    // Fallback error
    throw new Error(defaultMessage);
};

// ==========================================================
// 1. Authentication Services (Login, Register, Logout)
// ==========================================================

/**
 * Logs in the user and relies on the server to set an HTTP-only cookie.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} The user data returned by the server on successful login.
 */
export const login = async (credentials) => {
    try {
        const response = await api.post('/api/users/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Login service error:', error);
        throwServiceError(error, 'Login failed. Invalid credentials or connection issue.');
    }
};

/**
 * Registers a new user and relies on the server to set an HTTP-only cookie.
 * @param {object} userData - User registration details
 * @returns {Promise<object>} The user data returned by the server on successful registration.
 */
export const register = async (userData) => {
    try {
        const response = await api.post('/api/users/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration service error:', error);
        throwServiceError(error, 'Registration failed. Please check your data and try again.');
    }
};

/**
 * Logs out the user and relies on the server to clear the HTTP-only cookie.
 */
export const logout = async () => {
    try {
        await api.post('/api/users/logout');
    } catch (error) {
        console.error('Logout service error (silently ignoring, as the client needs to proceed with state change anyway):', error);
        // We generally suppress errors here because even if the server fails to 
        // clear the cookie, the client must still clear its local Redux state.
    }
};

// ==========================================================
// 2. Utility & Profile Services
// ==========================================================

/**
 * Checks if the user is authenticated by hitting a protected endpoint.
 * @returns {Promise<object|null>} The user data if authenticated, otherwise null.
 */
export const checkAuth = async () => {
    try {
        const response = await api.get('/api/users/me');
        return response.data;
    } catch (error) {
        // An expected error (e.g., 401) on this endpoint simply means unauthenticated.
        return null;
    }
};

/**
 * Fetches the current user's profile data.
 * @returns {Promise<object>} The user profile data.
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/api/users/profile');
        return response.data;
    } catch (error) {
        throwServiceError(error, 'Failed to fetch user profile.');
    }
};

/**
 * Updates the current user's profile details.
 * @param {object} userData - Data to update the profile with.
 * @returns {Promise<object>} The updated user data.
 */
export const updateProfile = async (userData) => {
    try {
        const response = await api.put('/api/users/profile', userData);
        return response.data;
    } catch (error) {
        throwServiceError(error, 'Profile update failed.');
    }
};

/**
 * Updates the user's password.
 * @param {object} passwordData - { oldPassword, newPassword }
 * @returns {Promise<object>} Success message data.
 */
export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/api/users/password', passwordData);
        return response.data;
    } catch (error) {
        throwServiceError(error, 'Password change failed.');
    }
};

/**
 * Updates the user's profile picture.
 * @param {FormData} pictureData - FormData containing the image file.
 * @returns {Promise<object>} The updated user data.
 */
export const updateProfilePicture = async (pictureData) => {
    try {
        const response = await api.post('/api/users/profile/picture', pictureData);
        return response.data;
    } catch (error) {
        throwServiceError(error, 'Failed to update profile picture.');
    }
};

// ==========================================================
// 3. Password Reset Services
// ==========================================================

/**
 * Sends a password reset email request.
 * @param {string} email - User's email address.
 * @returns {Promise<object>} Success message data.
 */
export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        throwServiceError(error, 'Forgot password request failed.');
    }
};

/**
 * Resets the password using a token.
 * @param {string} token - The password reset token.
 * @param {string} newPassword - The new password.
 * @returns {Promise<object>} Success message data.
 */
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/api/auth/reset-password', { 
            token, 
            password: newPassword 
        });
        return response.data;
    } catch (error) {
        throwServiceError(error, 'Password reset failed.');
    }
};