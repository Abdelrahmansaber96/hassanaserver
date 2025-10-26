const express = require('express');
const {
  getConsultations,
  getConsultation,
  createConsultation,
  updateConsultation,
  addConsultationResult,
  addDoctorReview
} = require('../controllers/consultationController');
const {
  createCustomerConsultation,
  getCustomerConsultations
} = require('../controllers/customerApiController');
const auth = require('../middlewares/auth');
const { checkActionPermission } = require('../middlewares/authorize');
const { validate } = require('../validators');
const {
  consultationValidator,
  updateConsultationValidator,
  consultationResultValidator
} = require('../validators');

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No Authentication)
// ========================================
// Customer consultation routes - BEFORE auth middleware
router.post('/customer/create', createCustomerConsultation);
router.get('/customer/list', getCustomerConsultations);

// ========================================
// PROTECTED ROUTES (Require Authentication)
// ========================================
// Apply auth middleware to all routes below
router.use(auth);

// Consultation CRUD
router.route('/')
  .get(checkActionPermission('read', 'consultation'), getConsultations)
  .post(checkActionPermission('create', 'consultation'), validate(consultationValidator), createConsultation);

router.route('/:id')
  .get(checkActionPermission('read', 'consultation'), getConsultation)
  .put(checkActionPermission('update', 'consultation'), validate(updateConsultationValidator), updateConsultation);

// Consultation result management
router.patch('/:id/result', 
  checkActionPermission('update', 'consultation'), 
  validate(consultationResultValidator), 
  addConsultationResult
);

// Add review to doctor (for customers via API)
router.post('/:id/review', auth, addDoctorReview);

module.exports = router;