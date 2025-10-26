// Consultation Controller - إدارة الاستشارات الهاتفية
const Consultation = require('../models/Consultation');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination } = require('../utils/pagination');
const APIFilters = require('../utils/filters');

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Private
const getConsultations = asyncHandler(async (req, res) => {
  let query = Consultation.find();

  // Apply role-based filtering
  if (req.user.role === 'doctor') {
    query = query.find({ doctor: req.user.id });
  }

  const filters = new APIFilters(query, req.query)
    .applyConsultationFilters();

  const pagination = new Pagination(filters.query, req.query)
    .filter()
    .search(['consultationNumber', 'animal.name', 'animal.symptoms'])
    .sort()
    .limitFields()
    .paginate();

  pagination.query = pagination.query
    .populate('customer', 'name phone email')
    .populate('doctor', 'name specialization')
    .populate('createdBy', 'name');

  const result = await pagination.execute();

  sendSuccess(res, result.docs, 'Consultations fetched successfully', 200, { pagination: result.pagination });
});

// @desc    Get single consultation
// @route   GET /api/consultations/:id
// @access  Private
const getConsultation = asyncHandler(async (req, res) => {
  let query = Consultation.findById(req.params.id);

  if (req.user.role === 'doctor') {
    query = query.find({ doctor: req.user.id });
  }

  const consultation = await query
    .populate('customer', 'name phone email address city')
    .populate('doctor', 'name phone specialization')
    .populate('createdBy', 'name');

  if (!consultation) {
    return sendNotFound(res, 'Consultation');
  }

  sendSuccess(res, consultation, 'Consultation details fetched successfully');
});

// @desc    Create new consultation
// @route   POST /api/consultations
// @access  Private
const createConsultation = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;

  const consultation = await Consultation.create(req.body);

  await consultation.populate([
    { path: 'customer', select: 'name phone email' },
    { path: 'doctor', select: 'name specialization' },
    { path: 'createdBy', select: 'name' }
  ]);

  sendSuccess(res, consultation, 'Consultation created successfully', 201);
});

// @desc    Update consultation
// @route   PUT /api/consultations/:id
// @access  Private
const updateConsultation = asyncHandler(async (req, res) => {
  let consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return sendNotFound(res, 'Consultation');
  }

  // Check permissions
  if (req.user.role === 'doctor' && consultation.doctor.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this consultation', 403);
  }

  consultation = await Consultation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'customer', select: 'name phone email' },
    { path: 'doctor', select: 'name specialization' }
  ]);

  sendSuccess(res, consultation, 'Consultation updated successfully');
});

// @desc    Add consultation result
// @route   PATCH /api/consultations/:id/result
// @access  Private (Doctor only)
const addConsultationResult = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return sendNotFound(res, 'Consultation');
  }

  if (consultation.doctor.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to add result to this consultation', 403);
  }

  if (consultation.status !== 'in_progress') {
    return sendError(res, 'Can only add results to consultations in progress', 400);
  }

  // Update consultation with results
  Object.assign(consultation, req.body);
  consultation.status = 'completed';

  await consultation.save();

  sendSuccess(res, consultation, 'Consultation result added successfully');
});

// @desc    Add review to doctor
// @route   POST /api/consultations/:id/review
// @access  Private (Customer only)
const addDoctorReview = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return sendNotFound(res, 'Consultation');
  }

  // Only completed consultations can be reviewed
  if (consultation.status !== 'completed') {
    return sendError(res, 'يمكن تقييم الاستشارات المكتملة فقط', 400);
  }

  // Check if customer already reviewed this consultation
  const User = require('../models/User');
  const doctor = await User.findById(consultation.doctor);

  if (!doctor) {
    return sendNotFound(res, 'Doctor');
  }

  const existingReview = doctor.reviews.find(
    review => review.consultation && review.consultation.toString() === req.params.id
  );

  if (existingReview) {
    return sendError(res, 'لقد قمت بالفعل بتقييم هذه الاستشارة', 400);
  }

  // Add review
  doctor.reviews.push({
    customer: req.body.customerId || consultation.customer,
    consultation: consultation._id,
    rating: req.body.rating,
    comment: req.body.comment
  });

  await doctor.save();

  sendSuccess(res, doctor, 'تم إضافة التقييم بنجاح');
});

module.exports = {
  getConsultations,
  getConsultation,
  createConsultation,
  updateConsultation,
  addConsultationResult,
  addDoctorReview
};