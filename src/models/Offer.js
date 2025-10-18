const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Offer description is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['vaccination', 'consultation', 'package', 'seasonal', 'loyalty'],
    required: [true, 'Offer type is required']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0
  },
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  applicableServices: [{
    type: String,
    trim: true
  }],
  targetCustomers: {
    type: String,
    enum: ['all', 'new', 'existing', 'loyalty'],
    default: 'all'
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch'
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  terms: {
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
offerSchema.index({ type: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ startDate: 1, endDate: 1 });
offerSchema.index({ branches: 1 });

// Validate dates
offerSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Virtual for offer status
offerSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startDate) return 'upcoming';
  if (now > this.endDate) return 'expired';
  if (!this.isActive) return 'inactive';
  if (this.usageLimit && this.usedCount >= this.usageLimit) return 'exhausted';
  return 'active';
});

// Virtual for days remaining
offerSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Method to check if offer is valid
offerSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
};

// Method to apply offer
offerSchema.methods.apply = function(amount) {
  if (!this.isValid()) {
    throw new Error('Offer is not valid');
  }
  
  if (amount < this.minAmount) {
    throw new Error(`Minimum amount required: ${this.minAmount}`);
  }
  
  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (amount * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }
  
  this.usedCount += 1;
  return discount;
};

module.exports = mongoose.model('Offer', offerSchema);