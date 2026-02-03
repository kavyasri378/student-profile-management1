import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  UserCheck,
  UserX
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/profile/stats/dashboard');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterCourse) params.append('course', filterCourse);
      if (filterYear) params.append('year', filterYear);

      const res = await api.get(`/api/profile/all?${params}`);
      setStudents(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterCourse, filterYear]);

  useEffect(() => {
    fetchStats();
    fetchStudents();
  }, [currentPage, searchTerm, filterCourse, filterYear, fetchStudents]);

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student profile?')) {
      return;
    }

    try {
      await api.delete(`/api/profile/${studentId}`);
      toast.success('Student profile deleted successfully');
      fetchStudents();
      fetchStats();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student profile');
    }
  };

  const handleEdit = (studentId) => {
    navigate(`/edit-student/${studentId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCourse('');
    setFilterYear('');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage student profiles and view statistics</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.feeStats.totalFees)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <UserCheck className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fees Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.feeStats.totalPaid)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fees Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.feeStats.totalPending)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or student ID..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            
            <select
              className="input-field lg:w-48"
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Courses</option>
              {stats?.courseStats?.map((course) => (
                <option key={course._id} value={course._id}>
                  {course._id}
                </option>
              ))}
            </select>

            <select
              className="input-field lg:w-48"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Student Profiles</h2>
            </div>
            <span className="text-sm text-gray-600">
              {students.length} students found
            </span>
          </div>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.personalInfo.firstName} {student.personalInfo.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.userId.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.academicDetails.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.academicDetails.course}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.academicDetails.year}{student.academicDetails.year === 1 ? 'st' : 
                         student.academicDetails.year === 2 ? 'nd' : 
                         student.academicDetails.year === 3 ? 'rd' : 'th'} Year
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.feeDetails.feesPending > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {student.feeDetails.feesPending > 0 ? 'Pending' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student._id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
