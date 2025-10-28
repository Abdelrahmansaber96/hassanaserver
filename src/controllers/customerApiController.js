const Customer = require('../models/Customer');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const whatsappService = require('../services/whatsappService');

// @desc    Register new customer (Simple - No Password)
// @route   POST /api/customer-api/register
// @access  Public
const registerCustomer = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  // Validate required fields
  if (!name || !phone) {
    return sendError(res, 'Name and phone are required', 400);
  }

  // Validate phone format (Saudi numbers)
  const phoneRegex = /^(05|5|\+9665|9665)[0-9]{8}$/;
  const cleanPhone = phone.replace(/\s+/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return sendError(res, 'Invalid phone number format. Use Saudi format: 05xxxxxxxx', 400);
  }

  // Normalize phone number (remove +966 or 966, keep 05xxxxxxxx format)
  let normalizedPhone = cleanPhone;
  if (cleanPhone.startsWith('+966')) {
    normalizedPhone = '0' + cleanPhone.substring(4);
  } else if (cleanPhone.startsWith('966')) {
    normalizedPhone = '0' + cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('5')) {
    normalizedPhone = '0' + cleanPhone;
  }

  // Check if customer already exists
  const existingCustomer = await Customer.findOne({ phone: normalizedPhone });
  if (existingCustomer) {
    return sendError(res, 'هذا الرقم مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول.', 400);
  }

  try {
    // Create new customer (without password)
    const customer = await Customer.create({
      name,
      phone: normalizedPhone,
      isActive: true
    });

    sendSuccess(res, {
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        city: customer.city,
        address: customer.address,
        email: customer.email,
        animals: customer.animals
      }
    }, 'تم التسجيل بنجاح', 201);
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return sendError(res, 'هذا الرقم مسجل مسبقاً. يرجى استخدام رقم آخر أو تسجيل الدخول.', 400);
    }
    throw error; // Re-throw other errors to be handled by asyncHandler
  }
});

// @desc    Login customer (Simple - Phone Only)
// @route   POST /api/customer-api/login
// @access  Public
const loginCustomer = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  // Validate phone
  if (!phone) {
    return sendError(res, 'Phone number is required', 400);
  }

  // Normalize phone number
  const phoneRegex = /^(05|5|\+9665|9665)[0-9]{8}$/;
  const cleanPhone = phone.replace(/\s+/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    return sendError(res, 'Invalid phone number format', 400);
  }

  let normalizedPhone = cleanPhone;
  if (cleanPhone.startsWith('+966')) {
    normalizedPhone = '0' + cleanPhone.substring(4);
  } else if (cleanPhone.startsWith('966')) {
    normalizedPhone = '0' + cleanPhone.substring(3);
  } else if (cleanPhone.startsWith('5')) {
    normalizedPhone = '0' + cleanPhone;
  }

  // Find customer
  const customer = await Customer.findOne({ phone: normalizedPhone });
  
  if (!customer) {
    return sendError(res, 'Customer not found. Please register first.', 404);
  }

  if (!customer.isActive) {
    return sendError(res, 'Customer account is deactivated', 403);
  }

  // Update last login
  customer.lastLogin = new Date();
  await customer.save();

  sendSuccess(res, {
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      email: customer.email,
      animals: customer.animals.filter(a => a.isActive),
      totalBookings: customer.totalBookings || 0,
      lastBookingDate: customer.lastBookingDate
    }
  }, 'Login successful');
});

// @desc    Get customer profile by ID (No Auth Required)
// @route   GET /api/customer-api/profile/:customerId
// @access  Public
const getCustomerProfile = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customer = await Customer.findById(customerId);
  
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  if (!customer.isActive) {
    return sendError(res, 'Customer account is deactivated', 403);
  }

  sendSuccess(res, {
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      email: customer.email,
      animals: customer.animals.filter(a => a.isActive),
      totalBookings: customer.totalBookings || 0,
      lastBookingDate: customer.lastBookingDate
    }
  });
});

// @desc    Update customer profile (No Auth Required - using customer ID)
// @route   PUT /api/customer-api/profile/:customerId
// @access  Public
const updateCustomerProfile = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { name, email, city, address } = req.body;

  const customer = await Customer.findById(customerId);
  
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Update fields
  if (name) customer.name = name;
  if (email) customer.email = email;
  if (city) customer.city = city;
  if (address) customer.address = address;

  await customer.save();

  sendSuccess(res, {
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      email: customer.email
    }
  }, 'Profile updated successfully');
});

// @desc    Add animal by customer (No Auth Required - using customer ID)
// @route   POST /api/customer-api/:customerId/animals
// @access  Public
const addAnimal = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { name, type, count, age, weight, breed, notes } = req.body;

  // Get customer by ID
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Validate count
  if (!count || count < 1) {
    return sendError(res, 'Count must be at least 1', 400);
  }

  // Check if animal name already exists for this customer
  const existingAnimal = customer.animals.find(animal => 
    animal.name.toLowerCase() === name.toLowerCase() && animal.isActive
  );
  
  if (existingAnimal) {
    return sendError(res, 'Animal with this name already exists for this customer', 400);
  }

  // Add new animal
  const newAnimal = {
    name,
    type,
    count: count || 1,
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

// @desc    Get customer animals (No Auth Required)
// @route   GET /api/customer-api/:customerId/animals
// @access  Public
const getMyAnimals = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  
  // Get customer by ID
  const customer = await Customer.findById(customerId);
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

// @desc    Update animal (No Auth Required)
// @route   PUT /api/customer-api/:customerId/animals/:animalId
// @access  Public
const updateAnimal = asyncHandler(async (req, res) => {
  const { customerId, animalId } = req.params;
  const { name, type, count, age, weight, breed, notes } = req.body;

  // Get customer by ID
  const customer = await Customer.findById(customerId);
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
      return sendError(res, 'Animal with this name already exists for this customer', 400);
    }
  }

  // Validate count if provided
  if (count !== undefined && count < 1) {
    return sendError(res, 'Count must be at least 1', 400);
  }

  // Update animal
  if (name) animal.name = name;
  if (type) animal.type = type;
  if (count !== undefined) animal.count = count;
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

// @desc    Delete animal (No Auth Required)
// @route   DELETE /api/customer-api/:customerId/animals/:animalId
// @access  Public
const deleteAnimal = asyncHandler(async (req, res) => {
  const { customerId, animalId } = req.params;

  // Get customer by ID
  const customer = await Customer.findById(customerId);
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

// @desc    Get vaccinations for animal (No Auth Required)
// @route   GET /api/customer-api/:customerId/animals/:animalId/vaccinations
// @access  Public
const getVaccinationsForAnimal = asyncHandler(async (req, res) => {
  const { customerId, animalId } = req.params;

  // Get customer by ID
  const customer = await Customer.findById(customerId);
  if (!customer) {
    return sendError(res, 'Customer not found', 404);
  }

  // Find the animal
  const animal = customer.animals.id(animalId);
  if (!animal || !animal.isActive) {
    return sendError(res, 'Animal not found', 404);
  }

  // Get vaccinations suitable for this animal type (including inactive ones)
  const Vaccination = require('../models/Vaccination');
  const vaccinations = await Vaccination.find({
    $or: [
      { animalTypes: animal.type },
      { animalTypes: 'all' }
    ]
  }).select('name nameAr description descriptionAr price frequency sideEffects animalTypes ageRange isActive');

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
      age: animal.age,
      count: animal.count || 1
    },
    vaccinations: suitableVaccinations,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone
    }
  });
});

// @desc    Book vaccination (No Auth Required)
// @route   POST /api/customer-api/:customerId/bookings
// @access  Public
const bookVaccination = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { animalId, vaccinationId, branchId, appointmentDate, timeSlot, notes } = req.body;

  // Get customer by ID
  const customer = await Customer.findById(customerId);
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
      weight: animal.weight,
      count: animal.count || 1
    },
    vaccination: {
      id: vaccination._id,
      type: vaccination.type || 'vaccination', // Added required field
      name: vaccination.name,
      nameAr: vaccination.nameAr,
      price: vaccination.price,
      duration: vaccination.duration,
      frequency: vaccination.frequency, // ✅ Add frequency
      frequencyMonths: vaccination.frequencyMonths // ✅ Add custom frequency months
    },
    branch: branchId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime: timeSlot, // Changed from timeSlot to appointmentTime
    status: 'pending',
    price: vaccination.price, // Added required field
    totalAmount: vaccination.price,
    notes: notes || '',
    customerPhone: customer.phone
  });

  await booking.save();

  // Populate branch and customer to get full details
  await booking.populate('branch', 'name phone');
  await booking.populate('customer', 'name phone');

  console.log('🔔 Attempting to send WhatsApp notification...');
  console.log('📍 Branch data:', booking.branch);
  console.log('👤 Customer data:', booking.customer);

  // Try to send WhatsApp notification to branch (don't fail booking if it fails)
  try {
    if (booking.branch && booking.branch.phone) {
      // إرسال إلى رقم الاختبار المسجل
      const testPhoneNumber = '966540217796'; // رقم الاختبار
      console.log('📱 Sending WhatsApp to test number:', testPhoneNumber);
      console.log('📍 Branch:', booking.branch.name);
      
      const result = await whatsappService.sendNewBookingNotificationToBranch(
        booking, 
        testPhoneNumber,
        booking.branch.name
      );
      
      if (!result.success) {
        console.log('❌ WhatsApp failed:', result.error);
        console.log('💡 Make sure 966540217796 is added to Test Numbers in Meta Developer Console');
      } else {
        console.log('✅ WhatsApp sent successfully!');
      }
      
      console.log('📨 WhatsApp result:', result);
    } else {
      console.log('⚠️ Branch phone not available');
    }
  } catch (whatsappError) {
    console.error('❌ WhatsApp notification failed:', whatsappError);
    // Continue - booking was successful even if notification failed
  }

  // Update customer booking stats
  customer.totalBookings = (customer.totalBookings || 0) + 1;
  customer.lastBookingDate = new Date();
  await customer.save();

  // Convert booking to plain object and fix customer field for response
  const bookingResponse = booking.toObject();
  bookingResponse.customer = customer._id; // إرجاع ID فقط للـ Flutter
  bookingResponse.branch = booking.branch._id; // إرجاع ID فقط للفرع

  sendSuccess(res, {
    booking: bookingResponse
  }, 'Vaccination appointment booked successfully', 201);
});

// @desc    Get customer bookings (No Auth Required)
// @route   GET /api/customer-api/:customerId/bookings
// @access  Public
const getMyBookings = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  
  // Get customer by ID
  const customer = await Customer.findById(customerId);
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

// @desc    Cancel booking (No Auth Required)
// @route   PUT /api/customer-api/:customerId/bookings/:bookingId/cancel
// @access  Public
const cancelBooking = asyncHandler(async (req, res) => {
  const { customerId, bookingId } = req.params;

  // Get customer by ID
  const customer = await Customer.findById(customerId);
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

// @desc    Create consultation (Customer)
// @route   POST /api/customer-api/consultations
// @access  Public (No auth required)
const createCustomerConsultation = asyncHandler(async (req, res) => {
  const Consultation = require('../models/Consultation');
  
  const { 
    customer, 
    doctor, 
    consultationType, 
    scheduledDate, 
    scheduledTime, 
    duration, 
    symptoms, 
    notes,
    animalName,
    animalType,
    animalAge,
    price
  } = req.body;

  // Validate required fields
  if (!customer || !doctor || !scheduledDate || !scheduledTime || !symptoms) {
    return sendError(res, 'Customer, doctor, date, time, and symptoms are required', 400);
  }

  // Check if customer exists
  const customerExists = await Customer.findById(customer);
  if (!customerExists) {
    return sendError(res, 'Customer not found', 404);
  }

  // Check if doctor exists
  const User = require('../models/User');
  const doctorExists = await User.findById(doctor);
  if (!doctorExists || doctorExists.role !== 'doctor') {
    return sendError(res, 'Doctor not found', 404);
  }

  // Map consultation type from Flutter (call -> phone)
  let validConsultationType = consultationType;
  if (consultationType === 'call' || !consultationType) {
    validConsultationType = 'phone';
  }
  
  // Validate consultation type
  if (!['phone', 'video', 'emergency'].includes(validConsultationType)) {
    validConsultationType = 'phone'; // default to phone
  }

  // Create consultation
  const consultation = await Consultation.create({
    customer,
    doctor,
    consultationType: validConsultationType,
    scheduledDate,
    scheduledTime,
    duration: duration || 30,
    animal: {
      name: animalName || 'Not specified',
      type: animalType || 'other',
      age: animalAge || 0,
      symptoms: symptoms
    },
    customerPhone: customerExists.phone,
    notes,
    status: 'scheduled',
    price: price || 100, // Default price if not provided
    createdBy: doctor, // Use doctor as creator for customer bookings
    paid: false
  });

  await consultation.populate([
    { path: 'customer', select: 'name phone email' },
    { path: 'doctor', select: 'name specialization phone' }
  ]);

  sendSuccess(res, consultation, 'Consultation booked successfully', 201);
});

// @desc    Get customer consultations
// @route   GET /api/customer-api/consultations?customerId=xxx
// @access  Public (No auth required)
const getCustomerConsultations = asyncHandler(async (req, res) => {
  const Consultation = require('../models/Consultation');
  
  const { customerId } = req.query;

  if (!customerId) {
    return sendError(res, 'Customer ID is required', 400);
  }

  const consultations = await Consultation.find({ customer: customerId })
    .populate('doctor', 'name specialization phone')
    .populate('customer', 'name phone')
    .sort('-scheduledDate');

  sendSuccess(res, consultations, 'Consultations retrieved successfully');
});

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  addAnimal,
  getMyAnimals,
  updateAnimal,
  deleteAnimal,
  getVaccinationsForAnimal,
  bookVaccination,
  getMyBookings,
  cancelBooking,
  createCustomerConsultation,
  getCustomerConsultations
};