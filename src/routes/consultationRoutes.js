const express = require('express');
const {
  getConsultations,
  getConsultation,
  createConsultation,
  updateConsultation,
  addConsultationResult
} = require('../controllers/consultationController');
const auth = require('../middlewares/auth');
const { checkActionPermission } = require('../middlewares/authorize');
const { validate } = require('../validators');
const {
  consultationValidator,
  updateConsultationValidator,
  consultationResultValidator
} = require('../validators');

const router = express.Router();

// Apply auth middleware to all routes
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

module.exports = router;