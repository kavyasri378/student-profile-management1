import axios from 'axios';

// API base URL - change this for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://spmbackend.onrender.com'
  : 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set auth token header
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
