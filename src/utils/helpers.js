// Response helper functions
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

const sendNotFound = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  });
};

const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message
  });
};

const sendForbidden = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message
  });
};

// Date helper functions
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  if (format === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  }
  
  if (format === 'DD/MM/YYYY') {
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }
  
  return d.toLocaleDateString();
};

const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.setHours(0, 0, 0, 0));
      endDate = new Date(yesterday.setHours(23, 59, 59, 999));
      break;
    
    case 'thisWeek':
      startDate = new Date(now.setDate(now.getDate() - now.getDay()));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    case 'lastWeek':
      const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay() - 1));
      endDate = new Date(lastWeekEnd.setHours(23, 59, 59, 999));
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    
    case 'last30Days':
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
  }

  return { startDate, endDate };
};

// String helper functions
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Number helper functions
const formatCurrency = (amount, currency = 'SAR') => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatNumber = (number) => {
  return new Intl.NumberFormat('ar-SA').format(number);
};

const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

// Array helper functions
const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    const groupKey = currentValue[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(currentValue);
    return result;
  }, {});
};

const sortBy = (array, key, direction = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Object helper functions
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

// Validation helpers
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  const phoneRegex = /^(\+966|966|0)?[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

module.exports = {
  // Response helpers
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  
  // Date helpers
  formatDate,
  getDateRange,
  
  // String helpers
  capitalize,
  slugify,
  generateRandomString,
  
  // Number helpers
  formatCurrency,
  formatNumber,
  calculatePercentage,
  
  // Array helpers
  groupBy,
  sortBy,
  
  // Object helpers
  pick,
  omit,
  
  // Validation helpers
  isValidObjectId,
  isValidEmail,
  isValidPhone
};