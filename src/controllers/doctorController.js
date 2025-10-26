const User = require('../models/User');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination } = require('../utils/pagination');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = asyncHandler(async (req, res) => {
  let query = User.find({ role: 'doctor' });

  const pagination = new Pagination(query, req.query)
    .filter()
    .search(['name', 'email', 'phone', 'specialization'])
    .sort()
    .limitFields()
    .paginate();

  pagination.query = pagination.query.populate('branch', 'name code city');

  const result = await pagination.execute();

  sendSuccess(res, result.docs, 'Doctors fetched successfully', 200, { pagination: result.pagination });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctor = asyncHandler(async (req, res) => {
  let doctorQuery = User.findOne({ _id: req.params.id, role: 'doctor' })
    .populate('branch', 'name code city address');

  // إذا كان المستخدم أدمن، أضف التقييمات
  if (req.user.role === 'admin') {
    doctorQuery = doctorQuery.populate('reviews.customer', 'name phone');
    doctorQuery = doctorQuery.populate('reviews.consultation', 'consultationNumber');
  }

  const doctor = await doctorQuery;

  if (!doctor) {
    return sendNotFound(res, 'Doctor');
  }

  // Get doctor statistics
  const Booking = require('../models/Booking');
  const Consultation = require('../models/Consultation');

  const [totalBookings, totalConsultations, todayBookings] = await Promise.all([
    Booking.countDocuments({ doctor: doctor._id }),
    Consultation.countDocuments({ doctor: doctor._id }),
    Booking.countDocuments({ 
      doctor: doctor._id,
      appointmentDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lte: new Date().setHours(23, 59, 59, 999)
      }
    })
  ]);

  // إزالة التقييمات إذا لم يكن المستخدم أدمن
  let doctorData = doctor.toObject();
  if (req.user.role !== 'admin') {
    delete doctorData.reviews;
  }

  sendSuccess(res, {
    doctor: doctorData,
    stats: {
      totalBookings,
      totalConsultations,
      todayBookings,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews
    }
  }, 'Doctor details fetched successfully');
});

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private (Admin only)
const createDoctor = asyncHandler(async (req, res) => {
  const doctorData = {
    ...req.body,
    role: 'doctor'
  };

  // Check if email already exists
  const existingUser = await User.findOne({ email: doctorData.email });
  if (existingUser) {
    return sendError(res, 'Email already registered', 400);
  }

  const doctor = await User.create(doctorData);

  sendSuccess(res, doctor, 'Doctor created successfully', 201);
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin only)
const updateDoctor = asyncHandler(async (req, res) => {
  let doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });

  if (!doctor) {
    return sendNotFound(res, 'Doctor');
  }

  // Check if email is being changed and if it's already taken
  if (req.body.email && req.body.email !== doctor.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return sendError(res, 'Email already registered', 400);
    }
  }

  doctor = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('branch', 'name code city');

  sendSuccess(res, doctor, 'Doctor updated successfully');
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });

  if (!doctor) {
    return sendNotFound(res, 'Doctor');
  }

  await doctor.deleteOne();

  sendSuccess(res, null, 'Doctor deleted successfully');
});

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor
};