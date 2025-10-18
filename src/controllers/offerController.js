// Controllers for Offers and Notifications
const Offer = require('../models/Offer');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination } = require('../utils/pagination');

// OFFER CONTROLLERS
// @desc    Get all offers
// @route   GET /api/offers
// @access  Private
const getOffers = asyncHandler(async (req, res) => {
  let query = Offer.find();

  const pagination = new Pagination(query, req.query)
    .filter()
    .search(['title', 'description'])
    .sort()
    .limitFields()
    .paginate();

  pagination.query = pagination.query
    .populate('branches', 'name code')
    .populate('createdBy', 'name');

  const result = await pagination.execute();

  sendSuccess(res, result.docs, 'Offers fetched successfully', 200, { pagination: result.pagination });
});

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Private
const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id)
    .populate('branches', 'name code city')
    .populate('createdBy', 'name email');

  if (!offer) {
    return sendNotFound(res, 'Offer');
  }

  sendSuccess(res, offer, 'Offer details fetched successfully');
});

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private (Admin only)
const createOffer = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;

  const offer = await Offer.create(req.body);

  await offer.populate([
    { path: 'branches', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  sendSuccess(res, offer, 'Offer created successfully', 201);
});

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private (Admin only)
const updateOffer = asyncHandler(async (req, res) => {
  let offer = await Offer.findById(req.params.id);

  if (!offer) {
    return sendNotFound(res, 'Offer');
  }

  offer = await Offer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'branches', select: 'name code' },
    { path: 'createdBy', select: 'name' }
  ]);

  sendSuccess(res, offer, 'Offer updated successfully');
});

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private (Admin only)
const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return sendNotFound(res, 'Offer');
  }

  await Offer.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Offer deleted successfully');
});

module.exports = {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer
};