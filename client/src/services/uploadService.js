import api from './api';

/**
 * Upload a single image to Cloudinary
 * 
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} - Response with URL and public ID
 */
export const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload image' };
  }
};

/**
 * Upload multiple images to Cloudinary
 * 
 * @param {File[]} imageFiles - Array of image files to upload
 * @returns {Promise<Object>} - Response with array of URLs and public IDs
 */
export const uploadMultipleImages = async (imageFiles) => {
  try {
    const formData = new FormData();
    
    imageFiles.forEach((file) => {
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

/**
 * Upload a profile picture to Cloudinary
 * 
 * @param {File} imageFile - The profile image file to upload
 * @returns {Promise<Object>} - Response with profile picture URL
 */
export const uploadProfilePicture = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    const response = await api.put('/api/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload profile picture' };
  }
}; 