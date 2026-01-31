import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAIL = 'AUTH_FAIL';
const LOGOUT = 'LOGOUT';
const LOAD_USER = 'LOAD_USER';
const CLEAR_ERRORS = 'CLEAR_ERRORS';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_FAIL:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token header
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setAuthToken(token);
      try {
        const res = await axios.get('/api/auth/me');
        dispatch({
          type: LOAD_USER,
          payload: res.data.user,
        });
      } catch (error) {
        console.error('Load user error:', error);
        dispatch({
          type: AUTH_FAIL,
        });
      }
    } else {
      dispatch({
        type: AUTH_FAIL,
      });
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: res.data,
      });

      setAuthToken(res.data.token);
      toast.success('Registration successful!');
      
      return res.data;
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      dispatch({
        type: AUTH_FAIL,
      });
      throw error;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: res.data,
      });

      setAuthToken(res.data.token);
      toast.success('Login successful!');
      
      return res.data;
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      dispatch({
        type: AUTH_FAIL,
      });
      throw error;
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    dispatch({
      type: LOGOUT,
    });
    toast.success('Logged out successfully');
  };

  // Update profile completion
  const updateProfileCompletion = async () => {
    try {
      await axios.put('/api/auth/profile-completed');
      dispatch({
        type: LOAD_USER,
        payload: { ...state.user, profileCompleted: true },
      });
    } catch (error) {
      console.error('Update profile completion error:', error);
      toast.error('Failed to update profile status');
    }
  };

  // Clear errors
  const clearErrors = () => {
    dispatch({
      type: CLEAR_ERRORS,
    });
  };

  // Load user on initial render
  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    ...state,
    register,
    login,
    logout,
    loadUser,
    updateProfileCompletion,
    clearErrors,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
