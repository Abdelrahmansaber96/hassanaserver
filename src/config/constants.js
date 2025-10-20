const jwt = require('jsonwebtoken');

module.exports = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/animal_vaccination_db',
  
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Pagination Configuration
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // Animal Types
  ANIMAL_TYPES: ['camel', 'sheep', 'goat', 'cow', 'other'],
  
  // Booking Status
  BOOKING_STATUS: ['pending', 'confirmed', 'completed', 'cancelled'],
  
  // User Roles
  USER_ROLES: ['admin', 'staff', 'doctor'],
  
  // Consultation Status
  CONSULTATION_STATUS: ['scheduled', 'in_progress', 'completed', 'cancelled'],
  
  // Notification Types
  NOTIFICATION_TYPES: [
    'general',
    'booking',
    'booking_reminder',
    'booking_confirmed',
    'consultation',
    'consultation_scheduled',
    'payment_received',
    'offer',
    'reminder',
    'system'
  ],
  
  // Generate JWT Token
  generateToken: (payload) => {
    return jwt.sign(payload, module.exports.JWT_SECRET, {
      expiresIn: module.exports.JWT_EXPIRES_IN
    });
  },
  
  // Verify JWT Token
  verifyToken: (token) => {
    return jwt.verify(token, module.exports.JWT_SECRET);
  }
};