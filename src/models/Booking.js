const mongoose = require('mongoose');
const { BOOKING_STATUS, ANIMAL_TYPES } = require('../config/constants');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  animal: {
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ANIMAL_TYPES,
      required: [true, 'Animal type is required']
    },
    age: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0
    },
    breed: {
      type: String,
      trim: true
    },
    count: {
      type: Number,
      min: 1,
      default: 1
    }
  },
  vaccination: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccination'
    },
    type: {
      type: String,
      required: [true, 'Vaccination type is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Vaccination name is required'],
      trim: true
    },
    nameAr: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Vaccination price is required'],
      min: 0
    },
    duration: {
      type: Number,
      default: 30
    },
    frequency: {
      type: String,
      enum: ['once', 'annually', 'biannually', 'monthly', 'custom'],
      default: 'once'
    },
    frequencyMonths: {
      type: Number,
      default: 12
    },
    dosage: {
      type: String,
      trim: true
    },
    manufacturer: {
      type: String,
      trim: true
    },
    batchNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    }
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  timeSlot: {
    type: String,
    trim: true
  },
  totalAmount: {
    type: Number,
    min: 0
  },
  customerPhone: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  status: {
    type: String,
    enum: BOOKING_STATUS,
    default: 'pending'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  paid: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'online'],
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true
  },
  completedAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancelReason: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for customer bookings via app
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ branch: 1 });
bookingSchema.index({ doctor: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ appointmentDate: 1 });
bookingSchema.index({ 'animal.type': 1 });
bookingSchema.index({ createdAt: -1 });

// Generate booking number before save
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber || this.isNew) {
    const count = await this.constructor.countDocuments();
    this.bookingNumber = `BK${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update status timestamps
bookingSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
  }
  next();
});

// Virtual for days until appointment
bookingSchema.virtual('daysUntilAppointment').get(function() {
  const now = new Date();
  const appointment = new Date(this.appointmentDate);
  const diffTime = appointment - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for appointment datetime
bookingSchema.virtual('appointmentDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status) && 
         this.daysUntilAppointment >= 1;
};

module.exports = mongoose.model('Booking', bookingSchema);