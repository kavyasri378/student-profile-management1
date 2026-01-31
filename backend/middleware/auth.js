const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Check if user has completed profile
const checkProfileCompletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.profileCompleted && req.user.role === 'student') {
      return res.status(403).json({ 
        message: 'Please complete your profile first',
        requiresProfileCompletion: true
      });
    }
    
    next();
  } catch (error) {
    console.error('Profile completion check error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  protect,
  authorize,
  checkProfileCompletion
};
