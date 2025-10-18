const User = require('../models/User');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private (Admin only)
const getSettings = asyncHandler(async (req, res) => {
  // Get user roles and counts
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: ['$isActive', 1, 0] } }
      }
    }
  ]);

  const settings = {
    userRoles: ['admin', 'staff', 'doctor'],
    userStats,
    systemInfo: {
      version: '1.0.0',
      lastBackup: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  };

  sendSuccess(res, settings, 'Settings fetched successfully');
});

// @desc    Get all users for management
// @route   GET /api/settings/users
// @access  Private (Admin only)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate('branch', 'name code')
    .select('-password')
    .sort({ createdAt: -1 });

  sendSuccess(res, users, 'Users fetched successfully');
});

// @desc    Get single user for editing
// @route   GET /api/settings/users/:id
// @access  Private (Admin only)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('branch', 'name code location')
    .select('-password');

  if (!user) {
    return sendNotFound(res, 'User');
  }

  sendSuccess(res, user, 'User fetched successfully');
});

// @desc    Update user role/status
// @route   PATCH /api/settings/users/:id
// @access  Private (Admin only)
const updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, branch, name, email, phone, specialization, newPassword } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return sendNotFound(res, 'User');
  }

  // تحديث البيانات
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (branch) user.branch = branch;
  if (specialization !== undefined) user.specialization = specialization;
  
  // تحديث كلمة المرور إذا تم توفيرها
  if (newPassword) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
  }

  const updatedUser = await user.save();
  
  // إزالة كلمة المرور من الاستجابة
  const userResponse = await User.findById(updatedUser._id)
    .populate('branch', 'name code')
    .select('-password');

  sendSuccess(res, userResponse, 'تم تحديث المستخدم بنجاح');
});

// @desc    Create new user
// @route   POST /api/settings/users
// @access  Private (Admin only)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, branch, specialization } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'المستخدم موجود بالفعل بهذا البريد الإلكتروني', 400);
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role,
    branch: branch || null,
    specialization: specialization || null,
    isActive: true
  });

  const userResponse = await User.findById(user._id)
    .populate('branch', 'name code')
    .select('-password');

  sendSuccess(res, userResponse, 'تم إضافة المستخدم بنجاح');
});

// @desc    Delete user
// @route   DELETE /api/settings/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendNotFound(res, 'User');
  }

  // Prevent deleting own account
  if (user._id.toString() === req.user._id.toString()) {
    return sendError(res, 'لا يمكنك حذف حسابك الخاص', 400);
  }

  // Check if user has active bookings or consultations
  const activeBookings = await require('../models/Booking').countDocuments({
    $or: [
      { assignedDoctor: user._id },
      { createdBy: user._id }
    ],
    status: { $in: ['pending', 'confirmed'] }
  });

  const activeConsultations = await require('../models/Consultation').countDocuments({
    doctor: user._id,
    status: { $in: ['scheduled', 'in_progress'] }
  });

  if (activeBookings > 0 || activeConsultations > 0) {
    return sendError(res, 'لا يمكن حذف المستخدم لوجود حجوزات أو استشارات نشطة', 400);
  }

  await User.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'تم حذف المستخدم بنجاح');
});

module.exports = {
  getSettings,
  getUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser
};