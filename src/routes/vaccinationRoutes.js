const express = require('express');
const {
  getVaccinations,
  getVaccination,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  getVaccinationsByAnimalType
} = require('../controllers/vaccinationController');
const auth = require('../middlewares/auth');
const { validate } = require('../validators');
const { vaccinationValidator, updateVaccinationValidator } = require('../validators');

const router = express.Router();

// Public routes
router.get('/', getVaccinations);
router.get('/animal-type/:type', getVaccinationsByAnimalType);
router.get('/:id', getVaccination);

// Protected routes (require authentication)
router.use(auth);
router.post('/', validate(vaccinationValidator), createVaccination);
router.put('/:id', validate(updateVaccinationValidator), updateVaccination);
router.delete('/:id', deleteVaccination);

module.exports = router;