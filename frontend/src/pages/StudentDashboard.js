import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  BookOpen, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  CreditCard
} from 'lucide-react';
import api from '../utils/api';
import { formatDate, formatCurrency, calculatePendingFees, getFeeStatus } from '../utils/helpers';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch student profile data from server
  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/api/profile/me');
      setProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If profile doesn't exist, redirect to profile form
      if (error.response?.status === 404) {
        navigate('/profile-form');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Load profile data when component mounts
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <button
          onClick={() => navigate('/profile-form')}
          className="btn-primary"
        >
          Complete Your Profile
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const feeStatus = profile.feeDetails.feesPending > 0 ? 'pending' : 'paid';
  const feeStatusColor = feeStatus === 'paid' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {profile.personalInfo.firstName}!</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Course</p>
                <p className="text-lg font-semibold text-gray-900">{profile.academicDetails.course}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Year</p>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.academicDetails.year}{profile.academicDetails.year === 1 ? 'st' : 
                   profile.academicDetails.year === 2 ? 'nd' : 
                   profile.academicDetails.year === 3 ? 'rd' : 'th'} Year
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fee Status</p>
                <p className={`text-lg font-semibold capitalize ${feeStatusColor}`}>
                  {feeStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <User className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">
                  {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium text-gray-900">{formatDate(profile.personalInfo.dateOfBirth)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium text-gray-900 capitalize">{profile.personalInfo.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{profile.personalInfo.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Address</p>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1 flex-shrink-0" />
                <p className="text-gray-900">
                  {profile.personalInfo.address.street}, {profile.personalInfo.address.city}, 
                  {profile.personalInfo.address.state} - {profile.personalInfo.address.postalCode}, 
                  {profile.personalInfo.address.country}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Academic Details</h2>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium text-gray-900">{profile.academicDetails.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium text-gray-900">{profile.academicDetails.course}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-gray-900">{profile.academicDetails.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-medium text-gray-900">
                  {profile.academicDetails.year}{profile.academicDetails.year === 1 ? 'st' : 
                   profile.academicDetails.year === 2 ? 'nd' : 
                   profile.academicDetails.year === 3 ? 'rd' : 'th'} Year
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Semester</p>
                <p className="font-medium text-gray-900">
                  {profile.academicDetails.semester}{profile.academicDetails.semester === 1 ? 'st' : 
                   profile.academicDetails.semester === 2 ? 'nd' : 
                   profile.academicDetails.semester === 3 ? 'rd' : 'th'} Semester
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">GPA</p>
                <p className="font-medium text-gray-900">
                  {profile.academicDetails.gpa || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Enrollment Date</p>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <p className="font-medium text-gray-900">{formatDate(profile.academicDetails.enrollmentDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Details */}
        <div className="card lg:col-span-2">
          <div className="card-header">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Fee Details</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(profile.feeDetails.totalFees)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Fees Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(profile.feeDetails.feesPaid)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Fees Pending</p>
                <p className={`text-2xl font-bold ${feeStatusColor}`}>
                  {formatCurrency(profile.feeDetails.feesPending)}
                </p>
              </div>
            </div>

            {profile.feeDetails.paymentHistory && profile.feeDetails.paymentHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Payment History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.feeDetails.paymentHistory.map((payment, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(payment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {payment.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.transactionId || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
