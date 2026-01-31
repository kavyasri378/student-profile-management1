const express = require('express');
const { body, validationResult } = require('express-validator');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { protect, authorize, checkProfileCompletion } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/profile
// @desc    Create student profile
// @access  Private (Student only)
router.post('/', protect, authorize('student'), [
  // Personal Info Validation
  body('personalInfo.firstName').trim().notEmpty().withMessage('First name is required'),
  body('personalInfo.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('personalInfo.dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('personalInfo.gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('personalInfo.phone').matches(/^\d{10}$/).withMessage('Valid 10-digit phone number is required'),
  body('personalInfo.address.street').notEmpty().withMessage('Street address is required'),
  body('personalInfo.address.city').notEmpty().withMessage('City is required'),
  body('personalInfo.address.state').notEmpty().withMessage('State is required'),
  body('personalInfo.address.postalCode').notEmpty().withMessage('Postal code is required'),
  
  // Academic Details Validation
  body('academicDetails.studentId').notEmpty().withMessage('Student ID is required'),
  body('academicDetails.course').notEmpty().withMessage('Course is required'),
  body('academicDetails.department').notEmpty().withMessage('Department is required'),
  body('academicDetails.year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('academicDetails.semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('academicDetails.enrollmentDate').isISO8601().withMessage('Valid enrollment date is required'),
  
  // Fee Details Validation
  body('feeDetails.totalFees').isFloat({ min: 0 }).withMessage('Total fees must be a positive number'),
  body('feeDetails.feesPaid').isFloat({ min: 0 }).withMessage('Fees paid must be a positive number')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists for this user' });
    }

    const profileData = {
      userId: req.user.id,
      personalInfo: req.body.personalInfo,
      academicDetails: req.body.academicDetails,
      feeDetails: req.body.feeDetails
    };

    const profile = await StudentProfile.create(profileData);

    // Update user profile completion status
    await User.findByIdAndUpdate(req.user.id, { profileCompleted: true });

    // Populate user data
    await profile.populate('userId', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Profile creation error:', error);
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists. Please use a different value.` 
      });
    }
    res.status(500).json({ message: 'Server error during profile creation' });
  }
});

// @route   GET /api/profile/me
// @desc    Get current student's profile
// @access  Private (Student only)
router.get('/me', protect, authorize('student'), checkProfileCompletion, async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id })
      .populate('userId', 'name email role');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/all
// @desc    Get all student profiles
// @access  Private (Admin only)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, course, department, year } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'academicDetails.studentId': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (course) {
      query['academicDetails.course'] = course;
    }
    
    if (department) {
      query['academicDetails.department'] = department;
    }
    
    if (year) {
      query['academicDetails.year'] = parseInt(year);
    }

    const profiles = await StudentProfile.find(query)
      .populate('userId', 'name email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await StudentProfile.countDocuments(query);

    res.json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile/:id
// @desc    Get single student profile
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id)
      .populate('userId', 'name email role');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/profile/:id
// @desc    Update student profile
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('personalInfo.firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('personalInfo.lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('academicDetails.studentId').optional().notEmpty().withMessage('Student ID cannot be empty'),
  body('feeDetails.totalFees').optional().isFloat({ min: 0 }).withMessage('Total fees must be positive'),
  body('feeDetails.feesPaid').optional().isFloat({ min: 0 }).withMessage('Fees paid must be positive')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    let profile = await StudentProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update profile
    profile = await StudentProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email role');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field} already exists. Please use a different value.` 
      });
    }
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   DELETE /api/profile/:id
// @desc    Delete student profile
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const profile = await StudentProfile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Delete the profile
    await profile.deleteOne();

    // Optionally, you might want to delete or update the associated user
    // await User.findByIdAndDelete(profile.userId);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ message: 'Server error during profile deletion' });
  }
});

// @route   GET /api/profile/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    
    const feeStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$feeDetails.totalFees' },
          totalPaid: { $sum: '$feeDetails.feesPaid' },
          totalPending: { $sum: '$feeDetails.feesPending' }
        }
      }
    ]);

    const courseStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$academicDetails.course',
          count: { $sum: 1 }
        }
      }
    ]);

    const yearStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$academicDetails.year',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        feeStats: feeStats[0] || { totalFees: 0, totalPaid: 0, totalPending: 0 },
        courseStats,
        yearStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
