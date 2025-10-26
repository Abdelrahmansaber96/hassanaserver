const Branch = require('../models/Branch');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination } = require('../utils/pagination');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Public (No authentication required)
const getBranches = asyncHandler(async (req, res) => {
  let query = Branch.find();

  // Apply role-based filtering only if user is authenticated
  if (req.user && req.user.role === 'staff' && req.user.branch) {
    query = query.find({ _id: req.user.branch });
  }

  const pagination = new Pagination(query, req.query)
    .filter()
    .search(['name', 'location', 'city', 'province'])
    .sort()
    .limitFields()
    .paginate();

  const result = await pagination.execute();

  sendSuccess(res, result.docs, 'Branches fetched successfully', 200, { pagination: result.pagination });
});

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Public (No authentication required)
const getBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id)
    .populate('manager', 'name email phone specialization');

  if (!branch) {
    return sendNotFound(res, 'Branch');
  }

  // Get branch statistics
  const Booking = require('../models/Booking');
  const User = require('../models/User');

  const [totalBookings, totalStaff, totalDoctors] = await Promise.all([
    Booking.countDocuments({ branch: branch._id }),
    User.countDocuments({ branch: branch._id, role: 'staff', isActive: true }),
    User.countDocuments({ branch: branch._id, role: 'doctor', isActive: true })
  ]);

  sendSuccess(res, {
    branch,
    stats: {
      totalBookings,
      totalStaff,
      totalDoctors
    }
  }, 'Branch details fetched successfully');
});

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private (Admin only)
const createBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.create(req.body);

  sendSuccess(res, branch, 'Branch created successfully', 201);
});

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (Admin only)
const updateBranch = asyncHandler(async (req, res) => {
  let branch = await Branch.findById(req.params.id);

  if (!branch) {
    return sendNotFound(res, 'Branch');
  }

  branch = await Branch.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('manager', 'name email phone');

  sendSuccess(res, branch, 'Branch updated successfully');
});

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (Admin only)
const deleteBranch = asyncHandler(async (req, res) => {
  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    return sendNotFound(res, 'Branch');
  }

  // Check if branch has any bookings
  const Booking = require('../models/Booking');
  const bookingsCount = await Booking.countDocuments({ branch: branch._id });

  if (bookingsCount > 0) {
    return sendError(res, 'Cannot delete branch with existing bookings', 400);
  }

  // Check if branch has any users
  const User = require('../models/User');
  const usersCount = await User.countDocuments({ branch: branch._id });

  if (usersCount > 0) {
    return sendError(res, 'Cannot delete branch with assigned users', 400);
  }

  await Branch.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Branch deleted successfully');
});

// @desc    Get branch statistics
// @route   GET /api/branches/:id/stats
// @access  Private
const getBranchStats = asyncHandler(async (req, res) => {
  const Booking = require('../models/Booking');
  
  const stats = await Booking.aggregate([
    { $match: { branch: require('mongoose').Types.ObjectId(req.params.id) } },
    {
      $facet: {
        statusStats: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: '$price' }
            }
          }
        ],
        monthlyStats: [
          {
            $group: {
              _id: {
                year: { $year: '$appointmentDate' },
                month: { $month: '$appointmentDate' }
              },
              count: { $sum: 1 },
              revenue: { $sum: '$price' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
          { $limit: 12 }
        ],
        animalTypeStats: [
          {
            $group: {
              _id: '$animal.type',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]
      }
    }
  ]);

  sendSuccess(res, {
    statusDistribution: stats[0].statusStats,
    monthlyTrend: stats[0].monthlyStats,
    animalTypes: stats[0].animalTypeStats
  }, 'Branch statistics fetched successfully');
});

module.exports = {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getBranchStats
};