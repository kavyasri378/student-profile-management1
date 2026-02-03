import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Users, 
  User, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

// Main layout component with sidebar navigation
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // State for mobile menu toggle
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Navigation menu items for students
  const studentMenuItems = [
    {
      path: '/student-dashboard',
      label: 'My Dashboard',
      icon: Home,
      description: 'View my profile information'
    },
    {
      path: '/student-dashboard',
      label: 'Profile',
      icon: User,
      description: 'Personal and academic details'
    },
  ];

  // Navigation menu items for admins
  const adminMenuItems = [
    {
      path: '/admin-dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      path: '/admin-dashboard',
      label: 'Students',
      icon: Users,
      description: 'Manage student records'
    },
  ];

  // Choose menu items based on user role
  const menuItems = user?.role === 'admin' ? adminMenuItems : studentMenuItems;

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle mobile sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Check if menu item is currently active
  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Navigation */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Student Portal</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
          </p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = isActivePath(item.path);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <div className="flex-1">
                  <div>{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h2>
                <p className="text-sm text-gray-600">
                  {user?.role === 'admin' 
                    ? 'Manage student records and view statistics' 
                    : 'View your academic profile and fee information'
                  }
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
