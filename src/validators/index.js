const Joi = require('joi');

// Auth validators
const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('admin', 'staff', 'doctor').default('staff'),
  phone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).optional().messages({
    'string.pattern.base': 'Please enter a valid Saudi phone number'
  }),
  branch: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Branch must be a valid ID',
    'string.length': 'Branch ID must be 24 characters long'
  }),
  specialization: Joi.string().max(100).optional()
});

const loginValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const updatePasswordValidator = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Confirm password must match new password',
    'any.required': 'Confirm password is required'
  })
});

// Customer validators
const animalSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Animal name is required',
    'string.max': 'Animal name cannot exceed 50 characters',
    'any.required': 'Animal name is required'
  }),
  type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'other').required().messages({
    'any.only': 'Animal type must be one of: camel, sheep, goat, cow, other',
    'any.required': 'Animal type is required'
  }),
  count: Joi.number().min(1).max(1000).optional().default(1).messages({
    'number.min': 'Count must be at least 1',
    'number.max': 'Count cannot exceed 1000'
  }),
  age: Joi.number().min(0).max(50).optional(),
  weight: Joi.number().min(0).max(2000).optional(),
  breed: Joi.string().max(50).optional(),
  isActive: Joi.boolean().default(true)
});

// Simple customer registration with phone and name only
const simpleCustomerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters',
    'any.required': 'Customer name is required'
  }),
  phone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid Saudi phone number',
    'any.required': 'Phone number is required'
  }),
  animalType: Joi.string().valid('إبل', 'ماشية', 'أغنام', 'ماعز', 'خيول', 'أخرى').optional(),
  notes: Joi.string().max(500).optional()
});

// Customer login validator (phone only)
const customerLoginValidator = Joi.object({
  phone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid Saudi phone number',
    'any.required': 'Phone number is required'
  })
});

const customerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Customer name must be at least 2 characters long',
    'string.max': 'Customer name cannot exceed 100 characters',
    'any.required': 'Customer name is required'
  }),
  phone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).required().messages({
    'string.pattern.base': 'Please enter a valid Saudi phone number',
    'any.required': 'Phone number is required'
  }),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  animals: Joi.array().items(animalSchema).min(1).required().messages({
    'array.min': 'At least one animal is required',
    'any.required': 'Animals information is required'
  }),
  notes: Joi.string().max(500).optional()
});

// Dashboard customer validator (animals optional)
const dashboardCustomerValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'اسم العميل يجب أن يكون حرفين على الأقل',
    'string.max': 'اسم العميل لا يمكن أن يتجاوز 100 حرف',
    'any.required': 'اسم العميل مطلوب'
  }),
  phone: Joi.string().pattern(/^((\+966|00966|966|0)?5[0-9]{8})$/).required().messages({
    'string.pattern.base': 'الرجاء إدخال رقم هاتف سعودي صحيح (مثال: 0501234567)',
    'any.required': 'رقم الهاتف مطلوب'
  }),
  email: Joi.string().email().optional().allow('').messages({
    'string.email': 'الرجاء إدخال بريد إلكتروني صحيح'
  }),
  address: Joi.string().max(200).optional().allow(''),
  city: Joi.string().max(50).optional().allow(''),
  animals: Joi.array().items(animalSchema).optional(),
  notes: Joi.string().max(500).optional().allow('')
});

const updateCustomerValidator = customerValidator.fork(
  ['phone', 'animals'], 
  (schema) => schema.optional()
);

// Booking validators
const bookingValidator = Joi.object({
  customer: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Customer must be a valid ID',
    'string.length': 'Customer ID must be 24 characters long',
    'any.required': 'Customer is required'
  }),
  branch: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Branch must be a valid ID',
    'string.length': 'Branch ID must be 24 characters long',
    'any.required': 'Branch is required'
  }),
  doctor: Joi.string().hex().length(24).optional().messages({
    'string.hex': 'Doctor must be a valid ID',
    'string.length': 'Doctor ID must be 24 characters long'
  }),
  animal: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'horse', 'other').required(),
    age: Joi.number().min(0).max(50).optional(),
    weight: Joi.number().min(0).max(2000).optional(),
    breed: Joi.string().max(50).optional()
  }).required(),
  vaccination: Joi.object({
    id: Joi.string().hex().length(24).optional(),
    type: Joi.string().min(1).max(100).required(),
    name: Joi.string().min(1).max(100).required(),
    nameAr: Joi.string().min(1).max(100).optional(),
    price: Joi.number().min(0).optional(),
    duration: Joi.number().min(1).optional(),
    dosage: Joi.string().max(50).optional(),
    manufacturer: Joi.string().max(100).optional(),
    batchNumber: Joi.string().max(50).optional(),
    expiryDate: Joi.date().optional()
  }).required(),
  appointmentDate: Joi.date().min('now').required().messages({
    'date.min': 'Appointment date cannot be in the past',
    'any.required': 'Appointment date is required'
  }),
  appointmentTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Appointment time must be in HH:MM format',
    'any.required': 'Appointment time is required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer', 'online').default('cash'),
  notes: Joi.string().max(500).optional()
});

const updateBookingValidator = bookingValidator.fork(
  ['customer', 'branch', 'animal', 'vaccination', 'appointmentDate', 'appointmentTime', 'price'], 
  (schema) => schema.optional()
);

const updateBookingStatusValidator = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').required(),
  cancelReason: Joi.string().max(200).when('status', {
    is: 'cancelled',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Branch validators
const branchValidator = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  location: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  province: Joi.string().min(2).max(50).optional().allow(''),
  phone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  manager: Joi.string().optional().allow(''),
  workingHours: Joi.object({
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('08:00'),
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().default('18:00')
  }).optional().default({ start: '08:00', end: '18:00' }),
  workingDays: Joi.array().items(Joi.string()).optional().default([]),
  services: Joi.array().items(Joi.string()).optional().default([]),
  capacity: Joi.alternatives().try(
    Joi.number().min(1).max(500),
    Joi.string().allow('')
  ).optional(),
  image: Joi.string().optional().allow(''),
  rating: Joi.alternatives().try(
    Joi.number().min(0).max(5),
    Joi.string().allow('')
  ).optional().default(0),
  description: Joi.string().max(500).optional().allow(''),
  isActive: Joi.boolean().optional().default(true),
  coordinates: Joi.object({
    lat: Joi.alternatives().try(
      Joi.number().min(-90).max(90),
      Joi.string().allow('')
    ).optional().default(0),
    lng: Joi.alternatives().try(
      Joi.number().min(-180).max(180),
      Joi.string().allow('')
    ).optional().default(0),
    // Allow old field names but strip them
    latitude: Joi.any().strip(),
    longitude: Joi.any().strip()
  }).optional().default({ lat: 0, lng: 0 })
});

const updateBranchValidator = branchValidator.fork(
  ['name', 'location', 'city'], 
  (schema) => schema.optional()
);

// Consultation validators
const consultationValidator = Joi.object({
  customer: Joi.string().hex().length(24).optional(),
  doctor: Joi.string().hex().length(24).optional(),
  animal: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'horse', 'other').required(),
    age: Joi.number().min(0).max(50).optional(),
    symptoms: Joi.string().min(10).max(500).required()
  }).optional(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: Joi.number().min(15).max(120).default(30),
  consultationType: Joi.string().valid('phone', 'video', 'in-person', 'emergency').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'emergency').default('medium'),
  customerPhone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).optional(),
  price: Joi.number().min(0).optional(),
  paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer', 'online').default('cash'),
  notes: Joi.string().max(500).optional().allow(''),
  symptoms: Joi.string().max(500).optional().allow(''),
  diagnosis: Joi.string().max(1000).optional().allow(''),
  recommendations: Joi.string().max(1000).optional().allow('')
});

const updateConsultationValidator = Joi.object({
  customer: Joi.string().hex().length(24).optional(),
  doctor: Joi.string().hex().length(24).optional(),
  animal: Joi.object({
    name: Joi.string().min(1).max(50).required(),
    type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'other').required(),
    age: Joi.number().min(0).max(50).optional(),
    symptoms: Joi.string().min(10).max(500).required()
  }).optional(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  duration: Joi.number().min(15).max(120).optional(),
  consultationType: Joi.string().valid('phone', 'video', 'emergency').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'emergency').optional(),
  customerPhone: Joi.string().pattern(/^(\+966|966|0)?[0-9]{9}$/).optional(),
  price: Joi.number().min(0).optional(),
  paymentMethod: Joi.string().valid('cash', 'card', 'bank_transfer', 'online').optional(),
  notes: Joi.string().max(500).optional(),
  status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').optional(),
  diagnosis: Joi.string().max(1000).optional(),
  treatment: Joi.string().max(1000).optional(),
  recommendations: Joi.string().max(1000).optional(),
  symptoms: Joi.string().max(500).optional()
});

const consultationResultValidator = Joi.object({
  diagnosis: Joi.string().min(10).max(1000).required(),
  treatment: Joi.string().min(10).max(1000).required(),
  medications: Joi.array().items(Joi.object({
    name: Joi.string().min(1).max(100).required(),
    dosage: Joi.string().min(1).max(50).required(),
    frequency: Joi.string().min(1).max(50).required(),
    duration: Joi.string().min(1).max(50).required(),
    instructions: Joi.string().max(200).optional()
  })).optional(),
  followUpRequired: Joi.boolean().default(false),
  followUpDate: Joi.date().min('now').when('followUpRequired', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  notes: Joi.string().max(500).optional()
});

// Offer validators
const offerValidator = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  type: Joi.string().valid('vaccination', 'consultation', 'package', 'seasonal', 'loyalty').required(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  discountValue: Joi.number().min(0).required(),
  minAmount: Joi.number().min(0).default(0),
  maxDiscount: Joi.number().min(0).optional(),
  applicableServices: Joi.array().items(Joi.string().max(100)).optional(),
  targetCustomers: Joi.string().valid('all', 'new', 'existing', 'loyalty').default('all'),
  branches: Joi.array().items(Joi.string().hex().length(24)).min(1).optional(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().min(Joi.ref('startDate')).required(),
  usageLimit: Joi.number().min(1).optional(),
  terms: Joi.string().max(1000).optional()
});

const updateOfferValidator = offerValidator.fork(
  ['title', 'description', 'type', 'discountType', 'discountValue', 'startDate', 'endDate'], 
  (schema) => schema.optional()
);

// Notification validators
const notificationValidator = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  message: Joi.string().min(10).max(1000).required(),
  type: Joi.string().valid(
    'general',
    'booking',
    'booking_reminder',
    'booking_confirmed',
    'consultation',
    'consultation_scheduled',
    'payment_received',
    'offer',
    'reminder',
    'system'
  ).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  recipients: Joi.string().valid('all', 'customers', 'staff', 'doctors', 'admins', 'specific').required(),
  specificRecipients: Joi.array().items(Joi.string().hex().length(24)).when('recipients', {
    is: 'specific',
    then: Joi.array().min(1).required(),
    otherwise: Joi.array().optional()
  }),
  channels: Joi.array().items(Joi.string().valid('app', 'email', 'sms', 'whatsapp', 'push')).min(1).default(['app']),
  scheduledAt: Joi.date().min('now').optional().allow(''),
  status: Joi.string().valid('draft', 'scheduled', 'sent', 'failed').optional(),
  relatedEntity: Joi.object({
    entityType: Joi.string().valid('booking', 'consultation', 'offer', 'customer', 'user'),
    entityId: Joi.string().hex().length(24)
  }).optional(),
  actions: Joi.array().items(Joi.object({
    label: Joi.string().max(50).required(),
    action: Joi.string().max(100).required(),
    url: Joi.string().uri().optional()
  })).optional(),
  // New fields for filtering notifications
  animalType: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'horse').optional().allow(''),
  branchSpecific: Joi.boolean().optional(),
  userRole: Joi.string().optional(),
  userBranch: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.object()
  ).optional().allow('', null)
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

// Vaccination validators
const vaccinationValidator = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Vaccination name must be at least 2 characters long',
    'string.max': 'Vaccination name cannot exceed 100 characters',
    'any.required': 'Vaccination name is required'
  }),
  nameAr: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Arabic vaccination name must be at least 2 characters long',
    'string.max': 'Arabic vaccination name cannot exceed 100 characters',
    'any.required': 'Arabic vaccination name is required'
  }),
  description: Joi.string().max(500).optional(),
  descriptionAr: Joi.string().max(500).optional(),
  animalTypes: Joi.array().items(
    Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'horse', 'other')
  ).min(1).required().messages({
    'array.min': 'At least one animal type is required',
    'any.required': 'Animal types are required'
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price cannot be negative',
    'any.required': 'Price is required'
  }),
  duration: Joi.number().min(1).max(300).optional().messages({
    'number.min': 'Duration must be at least 1 minute',
    'number.max': 'Duration cannot exceed 300 minutes'
  }),
  ageRange: Joi.object({
    min: Joi.number().min(0).default(0),
    max: Joi.number().min(0).default(20)
  }).optional(),
  frequency: Joi.string().valid('once', 'annually', 'biannually', 'monthly', 'custom').optional(),
  frequencyMonths: Joi.number().min(1).max(120).optional(),
  sideEffects: Joi.array().items(Joi.string().max(200)).optional(),
  sideEffectsAr: Joi.array().items(Joi.string().max(200)).optional(),
  instructions: Joi.string().max(1000).optional(),
  instructionsAr: Joi.string().max(1000).optional(),
  isActive: Joi.boolean().optional()
});

const updateVaccinationValidator = vaccinationValidator.fork(
  ['name', 'nameAr', 'animalTypes', 'price'], 
  (schema) => schema.optional()
);

// Animal validators for customer API
const animalValidator = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Animal name must be at least 2 characters long',
    'string.max': 'Animal name cannot exceed 50 characters',
    'any.required': 'Animal name is required'
  }),
  type: Joi.string().valid('camel', 'sheep', 'goat', 'cow', 'horse', 'other').required().messages({
    'any.only': 'Animal type must be one of: camel, sheep, goat, cow, horse, other',
    'any.required': 'Animal type is required'
  }),
  count: Joi.number().min(1).max(1000).required().messages({
    'number.min': 'Count must be at least 1',
    'number.max': 'Count cannot exceed 1000',
    'any.required': 'Count is required'
  }),
  age: Joi.number().min(0).max(50).optional().messages({
    'number.min': 'Age cannot be negative',
    'number.max': 'Age cannot exceed 50 years'
  }),
  weight: Joi.number().min(0).max(2000).optional().messages({
    'number.min': 'Weight cannot be negative',
    'number.max': 'Weight cannot exceed 2000 kg'
  }),
  breed: Joi.string().max(100).optional(),
  notes: Joi.string().max(500).optional()
});

const updateAnimalValidator = animalValidator.fork(
  ['name', 'type'], 
  (schema) => schema.optional()
);

// Customer booking validator (with JWT - no phone needed)
const customerBookingValidator = Joi.object({
  animalId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Animal ID must be a valid ID',
    'string.length': 'Animal ID must be 24 characters long',
    'any.required': 'Animal ID is required'
  }),
  vaccinationId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Vaccination ID must be a valid ID',
    'string.length': 'Vaccination ID must be 24 characters long',
    'any.required': 'Vaccination ID is required'
  }),
  branchId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Branch ID must be a valid ID',
    'string.length': 'Branch ID must be 24 characters long',
    'any.required': 'Branch ID is required'
  }),
  appointmentDate: Joi.date().min('now').required().messages({
    'date.min': 'Appointment date must be in the future',
    'any.required': 'Appointment date is required'
  }),
  timeSlot: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Time slot must be in HH:MM format',
    'any.required': 'Time slot is required'
  }),
  notes: Joi.string().max(500).optional()
});

module.exports = {
  // Auth validators
  registerValidator,
  loginValidator,
  updatePasswordValidator,
  
  // Customer validators
  customerValidator,
  dashboardCustomerValidator,
  simpleCustomerValidator,
  customerLoginValidator,
  updateCustomerValidator,
  
  // Booking validators
  bookingValidator,
  updateBookingValidator,
  updateBookingStatusValidator,
  customerBookingValidator,
  
  // Branch validators
  branchValidator,
  updateBranchValidator,
  
  // Consultation validators
  consultationValidator,
  updateConsultationValidator,
  consultationResultValidator,
  
  // Offer validators
  offerValidator,
  updateOfferValidator,
  
  // Notification validators
  notificationValidator,
  
  // Vaccination validators
  vaccinationValidator,
  updateVaccinationValidator,
  
  // Animal validators (for customer API)
  animalValidator,
  updateAnimalValidator,
  
  // Validation middleware
  validate
};