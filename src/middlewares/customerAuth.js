const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../utils/AppError');
const { sendError } = require('../utils/helpers');

// Middleware to protect customer routes
const customerAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return sendError(res, 'Access denied. Please login first.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure this is a customer token
    if (decoded.type !== 'customer') {
      return sendError(res, 'Invalid token type. Customer access required.', 401);
    }

    // Find customer
    const Customer = require('../models/Customer');
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return sendError(res, 'Customer not found. Please login again.', 401);
    }

    // Add customer to request object
    req.customer = {
      id: customer._id,
      phone: customer.phone,
      name: customer.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please login again.', 401);
    } else if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired. Please login again.', 401);
    } else {
      return sendError(res, 'Token verification failed.', 401);
    }
  }
});

module.exports = customerAuth;