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
    trim: true
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

// Indexes for performance
customerSchema.index({ name: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ city: 1 });
customerSchema.index({ 'animals.type': 1 });

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