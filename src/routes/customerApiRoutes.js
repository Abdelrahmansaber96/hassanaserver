const express = require('express');
const {
  addAnimal,
  getMyAnimals,
  updateAnimal,
  deleteAnimal,
  getVaccinationsForAnimal,
  bookVaccination,
  getMyBookings,
  cancelBooking
} = require('../controllers/customerApiController');
const { validate } = require('../validators');
const {
  animalValidator,
  updateAnimalValidator,
  customerBookingValidator
} = require('../validators');
const customerAuth = require('../middlewares/customerAuth');

const router = express.Router();

// Apply customer authentication to all routes
router.use(customerAuth);

// Animal management routes
router.post('/animals', validate(animalValidator), addAnimal);
router.get('/animals', getMyAnimals);
router.put('/animals/:animalId', validate(updateAnimalValidator), updateAnimal);
router.delete('/animals/:animalId', deleteAnimal);

// Vaccination routes
router.get('/animals/:animalId/vaccinations', getVaccinationsForAnimal);

// Booking routes
router.post('/bookings', validate(customerBookingValidator), bookVaccination);
router.get('/bookings', getMyBookings);
router.put('/bookings/:bookingId/cancel', cancelBooking);
router.post('/bookings', validate(customerBookingValidator), bookVaccination);
router.get('/bookings', getMyBookings);
router.delete('/bookings/:id', cancelBooking);

module.exports = router;