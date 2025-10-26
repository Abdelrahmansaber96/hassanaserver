const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
 
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Saudi phone number validation
        return /^(05|5|\+9665|9665)[0-9]{8}$/.test(v.replace(/\s+/g, ''));
      },
      message: 'Invalid phone number format. Use Saudi format: 05xxxxxxxx'
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
 
  animals: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['camel', 'sheep', 'goat', 'cow', 'horse', 'other'],
      required: true
    },
    count: {
      type: Number,
      required: [true, 'Count is required'],
      min: [1, 'Count must be at least 1'],
      default: 1
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
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  lastBookingDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance and uniqueness
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 }, { unique: true }); // Ensure unique phone at DB level
customerSchema.index({ city: 1 });
customerSchema.index({ 'animals.type': 1 });

// Add lastLogin field tracking
customerSchema.add({
  lastLogin: {
    type: Date
  }
});

// Virtual for customer's full address
customerSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}`.replace(/^, |, $/, '');
});

// Update totalBookings when booking is created
customerSchema.methods.incrementBookings = function() {
  this.totalBookings += 1;
  this.lastBookingDate = new Date();
  return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);