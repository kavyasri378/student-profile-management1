// Helper functions to make code more human-readable

/**
 * Format date to readable string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format currency to Indian Rupees
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Calculate fees pending
 * @param {number} totalFees - Total fees amount
 * @param {number} feesPaid - Amount already paid
 * @returns {number} Pending fees amount
 */
export const calculatePendingFees = (totalFees, feesPaid) => {
  const total = parseFloat(totalFees) || 0;
  const paid = parseFloat(feesPaid) || 0;
  return Math.max(0, total - paid);
};

/**
 * Get status badge color based on fees status
 * @param {number} totalFees - Total fees amount
 * @param {number} feesPaid - Amount already paid
 * @returns {object} Object with color and text
 */
export const getFeeStatus = (totalFees, feesPaid) => {
  const pending = calculatePendingFees(totalFees, feesPaid);
  
  if (pending === 0) {
    return {
      color: 'green',
      text: 'Fully Paid',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    };
  } else if (pending > 0 && pending < totalFees * 0.5) {
    return {
      color: 'yellow',
      text: 'Partially Paid',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    };
  } else {
    return {
      color: 'red',
      text: 'Pending',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800'
    };
  }
};

/**
 * Debounce function to limit API calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Get year from graduation year
 * @param {number} year - Academic year
 * @returns {string} Readable year string
 */
export const getAcademicYear = (year) => {
  const yearMap = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year'
  };
  return yearMap[year] || `${year}th Year`;
};

/**
 * Get semester text
 * @param {number} semester - Semester number
 * @returns {string} Readable semester string
 */
export const getSemesterText = (semester) => {
  return `Semester ${semester}`;
};

/**
 * Generate random color for avatar
 * @param {string} name - Name to generate color from
 * @returns {string} CSS color class
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};
