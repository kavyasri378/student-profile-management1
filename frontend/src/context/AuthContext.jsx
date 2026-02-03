import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api, { setAuthToken } from '../utils/api';
import toast from 'react-hot-toast';

// Create our authentication context
const AuthContext = createContext();

// Initial state for authentication
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

// Action types for our reducer
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAIL = 'AUTH_FAIL';
const LOGOUT = 'LOGOUT';
const LOAD_USER = 'LOAD_USER';
const CLEAR_ERRORS = 'CLEAR_ERRORS';

// Reducer function to handle state changes
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case AUTH_FAIL:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case LOGOUT:
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

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to set auth token in headers
  const setAuthTokenLocal = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Load user data from server
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setAuthTokenLocal(token);
      try {
        const res = await api.get('/api/auth/me');
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

  // Register new user
  const register = async (formData) => {
    try {
      const res = await api.post('/api/auth/register', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: res.data,
      });

      setAuthTokenLocal(res.data.token);
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
      const res = await api.post('/api/auth/login', formData);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: res.data,
      });

      setAuthTokenLocal(res.data.token);
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

  // Logout user
  const logout = () => {
    setAuthTokenLocal(null);
    dispatch({
      type: LOGOUT,
    });
    toast.success('Logged out successfully');
  };

  // Update profile completion status
  const updateProfileCompletion = async () => {
    try {
      await api.put('/api/auth/profile-completed');
      dispatch({
        type: LOAD_USER,
        payload: { ...state.user, profileCompleted: true },
      });
    } catch (error) {
      console.error('Update profile completion error:', error);
      toast.error('Failed to update profile status');
    }
  };

  // Clear any errors
  const clearErrors = () => {
    dispatch({
      type: CLEAR_ERRORS,
    });
  };

  // Load user data when component mounts
  useEffect(() => {
    loadUser();
  }, []);

  // Provide context value to children
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
