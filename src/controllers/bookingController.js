const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination } = require('../utils/pagination');
const APIFilters = require('../utils/filters');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  let query = Booking.find();

  // Apply role-based filtering
  if (req.user.role === 'doctor') {
    query = query.find({ doctor: req.user.id });
  } else if (req.user.role === 'staff' && req.user.branch) {
    query = query.find({ branch: req.user.branch });
  }

  // Apply filters
  const filters = new APIFilters(query, req.query)
    .applyBookingFilters();

  // Apply pagination and search
  const pagination = new Pagination(filters.query, req.query)
    .filter()
    .search(['bookingNumber', 'animal.name'])
    .sort()
    .limitFields()
    .paginate();

  // Populate related data
  pagination.query = pagination.query
    .populate('customer', 'name phone email')
    .populate('branch', 'name code city')
    .populate('doctor', 'name specialization')
    .populate('vaccination', 'name price')
    .populate('createdBy', 'name');

  const result = await pagination.execute();

  sendSuccess(res, { bookings: result.docs, pagination: result.pagination }, 'Bookings fetched successfully');
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = asyncHandler(async (req, res) => {
  let query = Booking.findById(req.params.id);

  // Apply role-based filtering
  if (req.user.role === 'doctor') {
    query = query.find({ doctor: req.user.id });
  } else if (req.user.role === 'staff' && req.user.branch) {
    query = query.find({ branch: req.user.branch });
  }

  const booking = await query
    .populate('customer', 'name phone email address city animals')
    .populate('branch', 'name code address city phone')
    .populate('doctor', 'name phone specialization')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (!booking) {
    return sendNotFound(res, 'Booking');
  }

  sendSuccess(res, booking, 'Booking details fetched successfully');
});

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  // Check if customer exists
  const customer = await Customer.findById(req.body.customer);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Check for conflicting appointments
  const conflictingBooking = await Booking.findOne({
    branch: req.body.branch,
    appointmentDate: req.body.appointmentDate,
    appointmentTime: req.body.appointmentTime,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (conflictingBooking) {
    return sendError(res, 'Time slot is already booked', 400);
  }

  // Add created by user
  req.body.createdBy = req.user.id;

  const booking = await Booking.create(req.body);

  // Update customer's booking count
  await customer.incrementBookings();

  // Populate the created booking
  await booking.populate([
    { path: 'customer', select: 'name phone email' },
    { path: 'branch', select: 'name code city' },
    { path: 'doctor', select: 'name specialization' },
    { path: 'createdBy', select: 'name' }
  ]);

  sendSuccess(res, booking, 'Booking created successfully', 201);
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = asyncHandler(async (req, res) => {
  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendNotFound(res, 'Booking');
  }

  // Check permissions
  if (req.user.role === 'doctor' && booking.doctor.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this booking', 403);
  }

  if (req.user.role === 'staff' && req.user.branch && 
      booking.branch.toString() !== req.user.branch.toString()) {
    return sendError(res, 'Not authorized to update this booking', 403);
  }

  // Check if booking can be updated
  if (booking.status === 'completed') {
    return sendError(res, 'Cannot update completed booking', 400);
  }

  // Check for conflicts if appointment time is being changed
  if (req.body.appointmentDate || req.body.appointmentTime) {
    const appointmentDate = req.body.appointmentDate || booking.appointmentDate;
    const appointmentTime = req.body.appointmentTime || booking.appointmentTime;
    const branch = req.body.branch || booking.branch;

    const conflictingBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      branch,
      appointmentDate,
      appointmentTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictingBooking) {
      return sendError(res, 'Time slot is already booked', 400);
    }
  }

  // Add updated by user
  req.body.updatedBy = req.user.id;

  booking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'customer', select: 'name phone email' },
    { path: 'branch', select: 'name code city' },
    { path: 'doctor', select: 'name specialization' },
    { path: 'updatedBy', select: 'name' }
  ]);

  sendSuccess(res, booking, 'Booking updated successfully');
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, cancelReason } = req.body;

  let booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendNotFound(res, 'Booking');
  }

  // Check permissions
  if (req.user.role === 'doctor' && booking.doctor.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this booking', 403);
  }

  // Validate status transitions
  const allowedTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!allowedTransitions[booking.status].includes(status)) {
    return sendError(res, `Cannot change status from ${booking.status} to ${status}`, 400);
  }

  // Update booking
  booking.status = status;
  booking.updatedBy = req.user.id;

  if (status === 'cancelled' && cancelReason) {
    booking.cancelReason = cancelReason;
  }

  await booking.save();

  await booking.populate([
    { path: 'customer', select: 'name phone email' },
    { path: 'branch', select: 'name code city' },
    { path: 'doctor', select: 'name specialization' }
  ]);

  sendSuccess(res, booking, `Booking ${status} successfully`);
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return sendNotFound(res, 'Booking');
  }

  // Only allow deletion of pending or cancelled bookings
  if (!['pending', 'cancelled'].includes(booking.status)) {
    return sendError(res, 'Can only delete pending or cancelled bookings', 400);
  }

  await Booking.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Booking deleted successfully');
});

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
const getBookingStats = asyncHandler(async (req, res) => {
  let matchStage = {};

  // Apply role-based filtering
  if (req.user.role === 'doctor') {
    matchStage.doctor = req.user.id;
  } else if (req.user.role === 'staff' && req.user.branch) {
    matchStage.branch = req.user.branch;
  }

  const stats = await Booking.aggregate([
    { $match: matchStage },
    {
      $facet: {
        statusStats: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: { $cond: ['$paid', '$price', 0] } }
            }
          }
        ],
        animalTypeStats: [
          {
            $group: {
              _id: '$animal.type',
              count: { $sum: 1 },
              revenue: { $sum: '$price' }
            }
          },
          { $sort: { count: -1 } }
        ],
        branchStats: [
          {
            $group: {
              _id: '$branch',
              count: { $sum: 1 },
              revenue: { $sum: '$price' }
            }
          },
          {
            $lookup: {
              from: 'branches',
              localField: '_id',
              foreignField: '_id',
              as: 'branchInfo'
            }
          },
          { $unwind: '$branchInfo' },
          {
            $project: {
              name: '$branchInfo.name',
              code: '$branchInfo.code',
              count: 1,
              revenue: 1
            }
          },
          { $sort: { count: -1 } }
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
        totalStats: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalRevenue: { $sum: '$price' },
              paidRevenue: { $sum: { $cond: ['$paid', '$price', 0] } },
              averagePrice: { $avg: '$price' }
            }
          }
        ]
      }
    }
  ]);

  const result = {
    total: stats[0].totalStats[0] || { total: 0, totalRevenue: 0, paidRevenue: 0, averagePrice: 0 },
    statusDistribution: stats[0].statusStats,
    animalTypes: stats[0].animalTypeStats,
    branches: stats[0].branchStats,
    monthlyTrend: stats[0].monthlyStats
  };

  sendSuccess(res, result, 'Booking statistics fetched successfully');
});

// @desc    Get available time slots
// @route   GET /api/bookings/available-slots
// @access  Private
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { branch, date, doctor } = req.query;

  if (!branch || !date) {
    return sendError(res, 'Branch and date are required', 400);
  }

  // Get branch working hours
  const Branch = require('../models/Branch');
  const branchInfo = await Branch.findById(branch);
  
  if (!branchInfo) {
    return sendError(res, 'Branch not found', 404);
  }

  // Generate time slots based on working hours
  const startTime = branchInfo.workingHours.start; // e.g., "08:00"
  const endTime = branchInfo.workingHours.end; // e.g., "18:00"
  const slotDuration = 30; // 30 minutes per slot

  const timeSlots = generateTimeSlots(startTime, endTime, slotDuration);

  // Get booked slots for the date
  let bookedQuery = {
    branch,
    appointmentDate: new Date(date),
    status: { $in: ['pending', 'confirmed'] }
  };

  if (doctor) {
    bookedQuery.doctor = doctor;
  }

  const bookedSlots = await Booking.find(bookedQuery).select('appointmentTime');
  const bookedTimes = bookedSlots.map(booking => booking.appointmentTime);

  // Filter available slots
  const availableSlots = timeSlots.filter(slot => !bookedTimes.includes(slot));

  sendSuccess(res, {
    date,
    branch: branchInfo.name,
    totalSlots: timeSlots.length,
    availableSlots,
    bookedSlots: bookedTimes
  }, 'Available time slots fetched successfully');
});

// Helper function to generate time slots
const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    slots.push(timeSlot);
    
    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
};

module.exports = {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  getAvailableSlots
};