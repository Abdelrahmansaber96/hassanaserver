const mongoose = require('mongoose');
const { CONSULTATION_STATUS } = require('../config/constants');

const consultationSchema = new mongoose.Schema({
  consultationNumber: {
    type: String,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Doctor is required']
  },
  animal: {
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['camel', 'sheep', 'goat', 'cow', 'other'],
      required: [true, 'Animal type is required']
    },
    age: {
      type: Number,
      min: 0
    },
    symptoms: {
      type: String,
      required: [true, 'Symptoms description is required'],
      trim: true
    }
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  duration: {
    type: Number,
    default: 30, // in minutes
    min: 15,
    max: 120
  },
  status: {
    type: String,
    enum: CONSULTATION_STATUS,
    default: 'scheduled'
  },
  consultationType: {
    type: String,
    enum: ['phone', 'video', 'emergency'],
    default: 'phone'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  diagnosis: {
    type: String,
    trim: true
  },
  treatment: {
    type: String,
    trim: true
  },
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      required: true,
      trim: true
    },
    frequency: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Consultation price is required'],
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
  startedAt: {
    type: Date
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
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
consultationSchema.index({ consultationNumber: 1 });
consultationSchema.index({ customer: 1 });
consultationSchema.index({ doctor: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ scheduledDate: 1 });
consultationSchema.index({ priority: 1 });
consultationSchema.index({ createdAt: -1 });

// Generate consultation number before save
consultationSchema.pre('save', async function(next) {
  if (!this.consultationNumber) {
    const count = await this.constructor.countDocuments();
    this.consultationNumber = `CON${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Update status timestamps
consultationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'in_progress' && !this.startedAt) {
      this.startedAt = now;
    } else if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = now;
    } else if (this.status === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = now;
    }
  }
  next();
});

// Virtual for scheduled datetime
consultationSchema.virtual('scheduledDateTime').get(function() {
  const date = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  date.setHours(parseInt(hours), parseInt(minutes));
  return date;
});

// Virtual for duration in hours
consultationSchema.virtual('durationInHours').get(function() {
  return this.duration / 60;
});

// Method to check if consultation can be cancelled
consultationSchema.methods.canBeCancelled = function() {
  return ['scheduled'].includes(this.status);
};

module.exports = mongoose.model('Consultation', consultationSchema);