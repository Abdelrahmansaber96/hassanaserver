const express = require('express');
const { getDoctors, getDoctor, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const auth = require('../middlewares/auth');
const { checkActionPermission } = require('../middlewares/authorize');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Doctor routes
router.get('/', checkActionPermission('read', 'doctor'), getDoctors);
router.post('/', checkActionPermission('create', 'doctor'), createDoctor);
router.get('/:id', checkActionPermission('read', 'doctor'), getDoctor);
router.put('/:id', checkActionPermission('update', 'doctor'), updateDoctor);
router.delete('/:id', checkActionPermission('delete', 'doctor'), deleteDoctor);

module.exports = router;