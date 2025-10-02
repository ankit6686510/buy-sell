import axios from 'axios';

// Use proxy for development, direct URL for production
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5001');

console.log('API base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection and make sure the server is running.',
      });
    }
    
    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        // Don't log 401 errors for auth check endpoints - they're expected when not logged in
        const isAuthCheckEndpoint = error.config?.url?.includes('/api/users/me');
        
        if (!isAuthCheckEndpoint) {
          console.error('Authentication failed:', error.response.data);
          
          // Only redirect if not already on login page and not an auth check
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        break;
      case 403:
        console.error('Forbidden:', error.response.data);
        break;
      case 500:
        console.error('Server Error:', error.response.data);
        break;
      default:
        console.error(`Error (${error.response.status}):`, error.response.data);
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
