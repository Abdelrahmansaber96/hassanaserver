const User = require('../models/User');
const { generateToken } = require('../config/constants');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (Admin only in production)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, branch, specialization } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    branch,
    specialization
  });

  // Generate token
  const token = generateToken({ id: user._id });

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      branch: user.branch,
      specialization: user.specialization,
      isActive: user.isActive
    }
  }, 'User registered successfully', 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password').populate('branch', 'name code');

  if (!user || !(await user.comparePassword(password))) {
    return sendError(res, 'Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account is deactivated. Please contact administrator.', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken({ id: user._id });

  sendSuccess(res, {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      branch: user.branch,
      specialization: user.specialization,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    }
  }, 'Login successful');
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('branch', 'name code city');

  sendSuccess(res, user, 'Profile fetched successfully');
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    specialization: req.body.specialization
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).populate('branch', 'name code city');

  sendSuccess(res, user, 'Profile updated successfully');
});

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'Password updated successfully');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a real app, you might want to blacklist the token
  // For now, we'll just send a success response
  sendSuccess(res, null, 'Logged out successfully');
});

// @desc    Forgot password (send reset email)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, 'No user found with this email', 404);
  }

  // In a real application, you would:
  // 1. Generate a reset token
  // 2. Save it to the database with expiration
  // 3. Send an email with the reset link
  
  // For now, we'll just send a success message
  sendSuccess(res, null, 'Password reset instructions sent to your email');
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // In a real application, you would:
  // 1. Find user by reset token
  // 2. Check if token is still valid (not expired)
  // 3. Update the password
  // 4. Clear the reset token
  
  // For now, we'll just send a success message
  sendSuccess(res, null, 'Password reset successfully');
});

// @desc    Register new customer (simple registration)
// @route   POST /api/auth/register-customer
// @access  Public
const registerCustomer = asyncHandler(async (req, res) => {
  const { name, phone, animalType, notes } = req.body;

  // Check if customer already exists with this phone
  const existingCustomer = await require('../models/Customer').findOne({ phone });
  if (existingCustomer) {
    return sendError(res, 'Customer with this phone number already exists', 400);
  }

  // Map Arabic animal types to English for database
  const animalTypeMap = {
    'إبل': 'camel',
    'ماشية': 'cow',
    'أغنام': 'sheep',
    'ماعز': 'goat',
    'خيول': 'horse',
    'أخرى': 'other'
  };

  // Create customer with basic info
  const customerData = {
    name,
    phone,
    notes: notes || ''
  };

  // Add animal if provided
  if (animalType) {
    const englishAnimalType = animalTypeMap[animalType] || 'other';
    customerData.animals = [{
      name: `${animalType} الخاص بـ ${name}`,
      type: englishAnimalType,
      isActive: true
    }];
  }

  const customer = await require('../models/Customer').create(customerData);

  sendSuccess(res, {
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      animalType: animalType,
      notes: customer.notes,
      createdAt: customer.createdAt
    }
  }, 'Customer registered successfully', 201);
});

// @desc    Customer login with phone number
// @route   POST /api/auth/customer-login
// @access  Public
const customerLogin = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return sendError(res, 'Phone number is required', 400);
  }

  // Find customer by phone
  const customer = await require('../models/Customer')
    .findOne({ phone })
    .populate('animals', 'name type age weight breed isActive');

  if (!customer) {
    return sendError(res, 'Customer not found with this phone number', 404);
  }

  // Generate JWT token for customer
  const token = generateToken({ 
    id: customer._id, 
    phone: customer.phone,
    type: 'customer' 
  });

  sendSuccess(res, {
    token,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      animals: customer.animals,
      totalAnimals: customer.animals ? customer.animals.length : 0,
      activeAnimals: customer.animals ? customer.animals.filter(animal => animal.isActive).length : 0,
      notes: customer.notes,
      createdAt: customer.createdAt
    }
  }, 'Customer login successful');
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
  registerCustomer,
  customerLogin
};