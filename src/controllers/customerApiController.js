const Customer = require('../models/Customer');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');

// @desc    Add animal by customer (with JWT)
// @route   POST /api/customer/animals
// @access  Private (Customer JWT)
const addAnimal = asyncHandler(async (req, res) => {
  const { name, type, age, weight, breed, notes } = req.body;

  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Check if animal name already exists for this customer
  const existingAnimal = customer.animals.find(animal => 
    animal.name.toLowerCase() === name.toLowerCase() && animal.isActive
  );
  
  if (existingAnimal) {
    return sendError(res, 'Animal with this name already exists for this customer');
  }

  // Add new animal
  const newAnimal = {
    name,
    type,
    age: age || 0,
    weight: weight || 0,
    breed: breed || '',
    notes: notes || '',
    isActive: true
  };

  customer.animals.push(newAnimal);
  await customer.save();

  const addedAnimal = customer.animals[customer.animals.length - 1];

  sendSuccess(res, {
    animal: addedAnimal,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone
    }
  }, 'Animal added successfully', 201);
});

// @desc    Get customer animals (with JWT)
// @route   GET /api/customer/animals
// @access  Private (Customer JWT)
const getMyAnimals = asyncHandler(async (req, res) => {
  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  const activeAnimals = customer.animals.filter(animal => animal.isActive);

  sendSuccess(res, {
    animals: activeAnimals,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      totalAnimals: customer.animals.length,
      activeAnimals: activeAnimals.length
    }
  });
});

// @desc    Update animal (with JWT)
// @route   PUT /api/customer/animals/:animalId
// @access  Private (Customer JWT)
const updateAnimal = asyncHandler(async (req, res) => {
  const { animalId } = req.params;
  const { name, type, age, weight, breed, notes } = req.body;

  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Find the animal
  const animal = customer.animals.id(animalId);
  if (!animal) {
    return sendError(res, 'Animal not found', 404);
  }

  // Check if new name conflicts with existing animals
  if (name && name !== animal.name) {
    const existingAnimal = customer.animals.find(a => 
      a.name.toLowerCase() === name.toLowerCase() && 
      a.isActive && 
      a._id.toString() !== animalId
    );
    
    if (existingAnimal) {
      return sendError(res, 'Animal with this name already exists for this customer');
    }
  }

  // Update animal
  if (name) animal.name = name;
  if (type) animal.type = type;
  if (age !== undefined) animal.age = age;
  if (weight !== undefined) animal.weight = weight;
  if (breed !== undefined) animal.breed = breed;
  if (notes !== undefined) animal.notes = notes;

  await customer.save();

  sendSuccess(res, {
    animal: animal,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone
    }
  }, 'Animal updated successfully');
});

// @desc    Delete animal (with JWT)
// @route   DELETE /api/customer/animals/:animalId
// @access  Private (Customer JWT)
const deleteAnimal = asyncHandler(async (req, res) => {
  const { animalId } = req.params;

  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Find and remove the animal
  const animal = customer.animals.id(animalId);
  if (!animal) {
    return sendError(res, 'Animal not found', 404);
  }

  // Soft delete - mark as inactive
  animal.isActive = false;
  await customer.save();

  sendSuccess(res, {
    message: 'Animal deleted successfully',
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      activeAnimals: customer.animals.filter(a => a.isActive).length
    }
  });
});

// @desc    Get vaccinations for animal (with JWT)
// @route   GET /api/customer/animals/:animalId/vaccinations
// @access  Private (Customer JWT)
const getVaccinationsForAnimal = asyncHandler(async (req, res) => {
  const { animalId } = req.params;

  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Find the animal
  const animal = customer.animals.id(animalId);
  if (!animal || !animal.isActive) {
    return sendError(res, 'Animal not found', 404);
  }

  // Get vaccinations suitable for this animal type
  const Vaccination = require('../models/Vaccination');
  const vaccinations = await Vaccination.find({
    isActive: true,
    $or: [
      { animalTypes: animal.type },
      { animalTypes: 'all' }
    ]
  }).select('name nameAr description descriptionAr price frequency sideEffects animalTypes ageRange');

  // Filter by age if specified
  const suitableVaccinations = vaccinations.filter(vaccination => {
    if (!vaccination.ageRange || !animal.age) return true;
    
    const { min, max } = vaccination.ageRange;
    return (!min || animal.age >= min) && (!max || animal.age <= max);
  });

  sendSuccess(res, {
    animal: {
      id: animal._id,
      name: animal.name,
      type: animal.type,
      age: animal.age
    },
    vaccinations: suitableVaccinations,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone
    }
  });
});

// @desc    Book vaccination (with JWT)
// @route   POST /api/customer/bookings
// @access  Private (Customer JWT)
const bookVaccination = asyncHandler(async (req, res) => {
  const { animalId, vaccinationId, branchId, appointmentDate, timeSlot, notes } = req.body;

  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Verify animal belongs to customer
  const animal = customer.animals.id(animalId);
  if (!animal || !animal.isActive) {
    return sendError(res, 'Animal not found', 404);
  }

  // Verify vaccination exists
  const Vaccination = require('../models/Vaccination');
  const vaccination = await Vaccination.findById(vaccinationId);
  if (!vaccination || !vaccination.isActive) {
    return sendError(res, 'Vaccination not found', 404);
  }

  // Verify branch exists
  const Branch = require('../models/Branch');
  const branch = await Branch.findById(branchId);
  if (!branch || !branch.isActive) {
    return sendError(res, 'Branch not found', 404);
  }

  // Check if vaccination is suitable for animal type
  if (!vaccination.animalTypes.includes(animal.type) && !vaccination.animalTypes.includes('all')) {
    return sendError(res, 'This vaccination is not suitable for this animal type');
  }

  // Create booking
  const Booking = require('../models/Booking');
  const booking = await Booking.create({
    customer: customer._id,
    animal: {
      id: animal._id,
      name: animal.name,
      type: animal.type,
      age: animal.age,
      weight: animal.weight
    },
    vaccination: {
      id: vaccination._id,
      name: vaccination.name,
      nameAr: vaccination.nameAr,
      price: vaccination.price,
      duration: vaccination.duration
    },
    branch: branchId,
    appointmentDate: new Date(appointmentDate),
    timeSlot,
    status: 'pending',
    totalAmount: vaccination.price,
    notes: notes || '',
    customerPhone: customer.phone
  });

  await booking.save();

  // Update customer booking stats
  customer.totalBookings = (customer.totalBookings || 0) + 1;
  customer.lastBookingDate = new Date();
  await customer.save();

  sendSuccess(res, {
    booking: booking
  }, 'Vaccination appointment booked successfully', 201);
});

// @desc    Get customer bookings (with JWT)
// @route   GET /api/customer/bookings
// @access  Private (Customer JWT)
const getMyBookings = asyncHandler(async (req, res) => {
  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  const Booking = require('../models/Booking');
  const bookings = await Booking.find({ 
    customer: customer._id,
    status: { $ne: 'cancelled' }
  })
  .populate('branch', 'name nameAr address phone')
  .sort({ appointmentDate: -1 });

  sendSuccess(res, {
    bookings: bookings,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      totalBookings: customer.totalBookings || 0
    }
  });
});

// @desc    Cancel booking (with JWT)
// @route   PUT /api/customer/bookings/:bookingId/cancel
// @access  Private (Customer JWT)
const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  // Get customer from JWT token
  const customer = await Customer.findById(req.customer.id);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  const Booking = require('../models/Booking');
  const booking = await Booking.findOne({ 
    _id: bookingId, 
    customer: customer._id 
  });

  if (!booking) {
    return sendError(res, 'Booking not found', 404);
  }

  if (booking.status === 'cancelled') {
    return sendError(res, 'Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    return sendError(res, 'Cannot cancel completed booking');
  }

  // Check if booking is within cancellation period (24 hours before appointment)
  const appointmentTime = new Date(booking.appointmentDate);
  const now = new Date();
  const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);

  if (hoursDifference < 24) {
    return sendError(res, 'Bookings can only be cancelled 24 hours before the appointment');
  }

  booking.status = 'cancelled';
  booking.cancelledAt = new Date();
  await booking.save();

  sendSuccess(res, {
    booking: booking
  }, 'Booking cancelled successfully');
});

module.exports = {
  addAnimal,
  getMyAnimals,
  updateAnimal,
  deleteAnimal,
  getVaccinationsForAnimal,
  bookVaccination,
  getMyBookings,
  cancelBooking
};