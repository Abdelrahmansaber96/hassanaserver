const express = require('express');
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  getAvailableSlots
} = require('../controllers/bookingController');
const auth = require('../middlewares/auth');
const { authorize, checkActionPermission } = require('../middlewares/authorize');
const { validate } = require('../validators');
const {
  bookingValidator,
  updateBookingValidator,
  updateBookingStatusValidator
} = require('../validators');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Booking utilities
router.get('/stats', checkActionPermission('read', 'booking'), getBookingStats);
router.get('/available-slots', checkActionPermission('read', 'booking'), getAvailableSlots);

// Booking CRUD
router.route('/')
  .get(checkActionPermission('read', 'booking'), getBookings)
  .post(checkActionPermission('create', 'booking'), validate(bookingValidator), createBooking);

router.route('/:id')
  .get(checkActionPermission('read', 'booking'), getBooking)
  .put(checkActionPermission('update', 'booking'), validate(updateBookingValidator), updateBooking)
  .delete(authorize('admin'), deleteBooking);

// Booking status management
router.patch('/:id/status', 
  checkActionPermission('update', 'booking'), 
  validate(updateBookingStatusValidator), 
  updateBookingStatus
);

module.exports = router;