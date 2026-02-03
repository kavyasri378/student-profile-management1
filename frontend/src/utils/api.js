import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production environment
  if (process.env.NODE_ENV === 'production') {
    return 'https://spmbackend.onrender.com';
  }
  // Default to localhost for development
  return 'http://localhost:5000';
};

// Create and configure axios instance
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Function to set authentication token
export const setAuthToken = (token) => {
  if (token) {
    // Set token for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Remove token from headers
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log request details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      setAuthToken(null);
      window.location.href = '/login';
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
