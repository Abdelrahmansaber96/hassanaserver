const express = require('express');
const { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const auth = require('../middlewares/auth');
const { checkActionPermission } = require('../middlewares/authorize');

const router = express.Router();

// Public routes (no authentication required) - for customer app
router.get('/', getDoctors);  // ✅ Get all doctors - Public
router.get('/:id', getDoctor); // ✅ Get single doctor - Public

// Protected routes (authentication required) - for admin/staff
router.post('/', auth, checkActionPermission('create', 'doctor'), createDoctor);
router.put('/:id', auth, checkActionPermission('update', 'doctor'), updateDoctor);
router.delete('/:id', auth, checkActionPermission('delete', 'doctor'), deleteDoctor);

module.exports = router;