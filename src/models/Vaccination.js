const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vaccination name is required'],
    trim: true
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic vaccination name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  descriptionAr: {
    type: String,
    trim: true
  },
  animalTypes: [{
    type: String,
    enum: ['camel', 'sheep', 'goat', 'cow', 'horse', 'other'],
    required: true
  }],
  ageRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 20
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  duration: {
    type: Number, // Duration in minutes
    default: 30
  },
  frequency: {
    type: String,
    enum: ['once', 'annually', 'biannually', 'monthly', 'custom'],
    default: 'once'
  },
  frequencyMonths: {
    type: Number, // For custom frequency
    default: 12
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  sideEffectsAr: [{
    type: String,
    trim: true
  }],
  instructions: {
    type: String,
    trim: true
  },
  instructionsAr: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
vaccinationSchema.index({ name: 1 });
vaccinationSchema.index({ animalTypes: 1 });
vaccinationSchema.index({ isActive: 1 });
vaccinationSchema.index({ price: 1 });

module.exports = mongoose.model('Vaccination', vaccinationSchema);