import api from './api';

// Get all listings
export const getListings = async (filters = {}) => {
  try {
    const response = await api.get('/api/listings', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch listings' };
  }
};

// Alias for getListings to maintain backward compatibility
export const fetchListings = getListings;

// Get a specific listing by ID
export const getListingById = async (id) => {
  try {
    const response = await api.get(`/api/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch listing' };
  }
};

// Create a new listing
export const createListing = async (listingData) => {
  try {
    const response = await api.post('/api/listings', listingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create listing' };
  }
};

// Update an existing listing
export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/api/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update listing' };
  }
};

// Delete a listing
export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete listing' };
  }
};

// Toggle favorite status
export const toggleFavorite = async (id) => {
  try {
    const response = await api.post(`/api/listings/${id}/favorite`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to toggle favorite' };
  }
};

// Add a listing to favorites (backward compatibility)
export const addFavorite = async (id) => {
  return toggleFavorite(id);
};

// Remove a listing from favorites (backward compatibility)
export const removeFavorite = async (id) => {
  return toggleFavorite(id);
};

// Get user's favorite listings
export const getUserFavorites = async (page = 1, limit = 20) => {
  try {
    const response = await api.get('/api/listings/favorites/mine', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch favorites' };
  }
};

// Search listings with filters
export const searchListings = async (filters) => {
  try {
    const response = await api.get('/api/listings/search', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search listings' };
  }
};

// Get listings for a specific user
export const getUserListings = async (userId) => {
  try {
    const response = await api.get('/api/listings', { 
      params: { 
        user: userId,
        status: '' // Include all statuses for user's own listings
      } 
    });
    return response.data.listings || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user listings' };
  }
};

// Get similar listings
export const getSimilarListings = async (listingId, limit = 10) => {
  try {
    const response = await api.get(`/api/listings/${listingId}/similar`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch similar listings' };
  }
};

// Get personalized recommendations
export const getRecommendations = async (limit = 10) => {
  try {
    const response = await api.get('/api/listings/recommendations/for-me', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch recommendations' };
  }
};

// Mark listing as sold
export const markAsSold = async (id) => {
  try {
    const response = await api.post(`/api/listings/${id}/sold`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to mark as sold' };
  }
};

// Report a listing
export const reportListing = async (id, reason = '') => {
  try {
    const response = await api.post(`/api/listings/${id}/report`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to report listing' };
  }
};

// Upload images for listings
export const uploadImages = async (files) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await api.post('/api/listings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload images' };
  }
};

// Backward compatibility functions for earbud-specific features
// These can be removed once frontend is fully updated

// Find potential matches for a listing (backward compatibility)
export const findMatches = async (listingId) => {
  return getSimilarListings(listingId);
};

// Mark listings as matched (backward compatibility)
export const markAsMatched = async (listingId, matchedListingId) => {
  // For marketplace, this is equivalent to marking as sold
  return markAsSold(listingId);
};
