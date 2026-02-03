import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, DollarSign, Save, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProfileForm = () => {
  const navigate = useNavigate();
  const { user, updateProfileCompletion } = useAuth();
  
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India'
      }
    },
    academicDetails: {
      studentId: '',
      course: '',
      department: '',
      year: '',
      semester: '',
      enrollmentDate: '',
      gpa: ''
    },
    feeDetails: {
      totalFees: '',
      feesPaid: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Redirect if profile is already completed
  useEffect(() => {
    if (user?.profileCompleted) {
      navigate('/student-dashboard');
    }
  }, [user, navigate]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    // Clear errors when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ''
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        address: {
          ...prev.personalInfo.address,
          [field]: value
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Info Validation
    if (!formData.personalInfo.firstName.trim()) {
      newErrors['personalInfo.firstName'] = 'First name is required';
    }
    if (!formData.personalInfo.lastName.trim()) {
      newErrors['personalInfo.lastName'] = 'Last name is required';
    }
    if (!formData.personalInfo.dateOfBirth) {
      newErrors['personalInfo.dateOfBirth'] = 'Date of birth is required';
    }
    if (!formData.personalInfo.gender) {
      newErrors['personalInfo.gender'] = 'Gender is required';
    }
    if (!formData.personalInfo.phone.trim()) {
      newErrors['personalInfo.phone'] = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.personalInfo.phone)) {
      newErrors['personalInfo.phone'] = 'Phone number must be 10 digits';
    }

    // Address Validation
    if (!formData.personalInfo.address.street.trim()) {
      newErrors['personalInfo.address.street'] = 'Street address is required';
    }
    if (!formData.personalInfo.address.city.trim()) {
      newErrors['personalInfo.address.city'] = 'City is required';
    }
    if (!formData.personalInfo.address.state.trim()) {
      newErrors['personalInfo.address.state'] = 'State is required';
    }
    if (!formData.personalInfo.address.postalCode.trim()) {
      newErrors['personalInfo.address.postalCode'] = 'Postal code is required';
    }

    // Academic Details Validation
    if (!formData.academicDetails.studentId.trim()) {
      newErrors['academicDetails.studentId'] = 'Student ID is required';
    }
    if (!formData.academicDetails.course.trim()) {
      newErrors['academicDetails.course'] = 'Course is required';
    }
    if (!formData.academicDetails.department.trim()) {
      newErrors['academicDetails.department'] = 'Department is required';
    }
    if (!formData.academicDetails.year) {
      newErrors['academicDetails.year'] = 'Year is required';
    }
    if (!formData.academicDetails.semester) {
      newErrors['academicDetails.semester'] = 'Semester is required';
    }
    if (!formData.academicDetails.enrollmentDate) {
      newErrors['academicDetails.enrollmentDate'] = 'Enrollment date is required';
    }

    // Fee Details Validation
    if (!formData.feeDetails.totalFees || formData.feeDetails.totalFees <= 0) {
      newErrors['feeDetails.totalFees'] = 'Total fees must be greater than 0';
    }
    if (!formData.feeDetails.feesPaid || formData.feeDetails.feesPaid < 0) {
      newErrors['feeDetails.feesPaid'] = 'Fees paid must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        academicDetails: {
          ...formData.academicDetails,
          year: parseInt(formData.academicDetails.year),
          semester: parseInt(formData.academicDetails.semester),
          gpa: parseFloat(formData.academicDetails.gpa) || 0
        },
        feeDetails: {
          totalFees: parseFloat(formData.feeDetails.totalFees),
          feesPaid: parseFloat(formData.feeDetails.feesPaid)
        }
      };

      await api.post('/api/profile', submitData);
      await updateProfileCompletion();
      
      toast.success('Profile created successfully!');
      navigate('/student-dashboard');
    } catch (error) {
      console.error('Profile creation error:', error);
      const message = error.response?.data?.message || 'Failed to create profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Please provide your personal, academic, and fee details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div>
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  className={`input-field ${errors['personalInfo.firstName'] ? 'border-red-500' : ''}`}
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleChange('personalInfo', 'firstName', e.target.value)}
                />
                {errors['personalInfo.firstName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.firstName']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  className={`input-field ${errors['personalInfo.lastName'] ? 'border-red-500' : ''}`}
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleChange('personalInfo', 'lastName', e.target.value)}
                />
                {errors['personalInfo.lastName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.lastName']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  className={`input-field ${errors['personalInfo.dateOfBirth'] ? 'border-red-500' : ''}`}
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleChange('personalInfo', 'dateOfBirth', e.target.value)}
                />
                {errors['personalInfo.dateOfBirth'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.dateOfBirth']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  className={`input-field ${errors['personalInfo.gender'] ? 'border-red-500' : ''}`}
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleChange('personalInfo', 'gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors['personalInfo.gender'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.gender']}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  className={`input-field ${errors['personalInfo.phone'] ? 'border-red-500' : ''}`}
                  value={formData.personalInfo.phone}
                  onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                  placeholder="10-digit phone number"
                />
                {errors['personalInfo.phone'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['personalInfo.phone']}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors['personalInfo.address.street'] ? 'border-red-500' : ''}`}
                    value={formData.personalInfo.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                  />
                  {errors['personalInfo.address.street'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.address.street']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors['personalInfo.address.city'] ? 'border-red-500' : ''}`}
                    value={formData.personalInfo.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                  />
                  {errors['personalInfo.address.city'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.address.city']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors['personalInfo.address.state'] ? 'border-red-500' : ''}`}
                    value={formData.personalInfo.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                  />
                  {errors['personalInfo.address.state'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.address.state']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors['personalInfo.address.postalCode'] ? 'border-red-500' : ''}`}
                    value={formData.personalInfo.address.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                  />
                  {errors['personalInfo.address.postalCode'] && (
                    <p className="text-red-500 text-sm mt-1">{errors['personalInfo.address.postalCode']}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.personalInfo.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Academic Details */}
          <div>
            <div className="flex items-center mb-4">
              <BookOpen className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Academic Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  className={`input-field ${errors['academicDetails.studentId'] ? 'border-red-500' : ''}`}
                  value={formData.academicDetails.studentId}
                  onChange={(e) => handleChange('academicDetails', 'studentId', e.target.value)}
                />
                {errors['academicDetails.studentId'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['academicDetails.studentId']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course *
                </label>
                <input
                  type="text"
                  className={`input-field ${errors['academicDetails.course'] ? 'border-red-500' : ''}`}
                  value={formData.academicDetails.course}
                  onChange={(e) => handleChange('academicDetails', 'course', e.target.value)}
                />
                {errors['academicDetails.course'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['academicDetails.course']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  className={`input-field ${errors['academicDetails.department'] ? 'border-red-500' : ''}`}
                  value={formData.academicDetails.department}
                  onChange={(e) => handleChange('academicDetails', 'department', e.target.value)}
                />
                {errors['academicDetails.department'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['academicDetails.department']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <select
                  className={`input-field ${errors['academicDetails.year'] ? 'border-red-500' : ''}`}
                  value={formData.academicDetails.year}
                  onChange={(e) => handleChange('academicDetails', 'year', e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
                {errors['academicDetails.year'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['academicDetails.year']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <select
                  className={`input-field ${errors['academicDetails.semester'] ? 'border-red-500' : ''}`}
                  value={formData.academicDetails.semester}
                  onChange={(e) => handleChange('academicDetails', 'semester', e.target.value)}
                >
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Semester
                    </option>
                  ))}
                </select>
                {errors['academicDetails.semester'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['academicDetails.semester']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Date *
                </label>
                <input
                  type="date"
                  className={`input-field ${errors['academicDetails.enrollmentDate'] ? 'border-red-500' : ''}`}
                  value={formData.academicDetails.enrollmentDate}
                  onChange={(e) => handleChange('academicDetails', 'enrollmentDate', e.target.value)}
                />
                {errors['academicDetails.enrollmentDate'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['academicDetails.enrollmentDate']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GPA (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="input-field"
                  value={formData.academicDetails.gpa}
                  onChange={(e) => handleChange('academicDetails', 'gpa', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Fee Details */}
          <div>
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Fee Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Fees *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-field ${errors['feeDetails.totalFees'] ? 'border-red-500' : ''}`}
                  value={formData.feeDetails.totalFees}
                  onChange={(e) => handleChange('feeDetails', 'totalFees', e.target.value)}
                />
                {errors['feeDetails.totalFees'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['feeDetails.totalFees']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fees Paid *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`input-field ${errors['feeDetails.feesPaid'] ? 'border-red-500' : ''}`}
                  value={formData.feeDetails.feesPaid}
                  onChange={(e) => handleChange('feeDetails', 'feesPaid', e.target.value)}
                />
                {errors['feeDetails.feesPaid'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['feeDetails.feesPaid']}</p>
                )}
              </div>
            </div>

            {formData.feeDetails.totalFees && formData.feeDetails.feesPaid && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Fees Pending:</span> ₹
                  {parseFloat(formData.feeDetails.totalFees) - parseFloat(formData.feeDetails.feesPaid)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center px-6 py-3"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
