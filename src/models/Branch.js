const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Branch code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Code cannot exceed 10 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workingHours: {
    start: {
      type: String,
      default: '08:00'
    },
    end: {
      type: String,
      default: '18:00'
    }
  },
  workingDays: [{
    type: String,
    enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  }],
  capacity: {
    type: Number,
    default: 50,
    min: 1
  },
  facilities: [{
    type: String,
    trim: true
  }],
  coordinates: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
branchSchema.index({ code: 1 });
branchSchema.index({ city: 1 });
branchSchema.index({ isActive: 1 });
branchSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Virtual for branch's full address
branchSchema.virtual('fullAddress').get(function() {
  return `${this.address}, ${this.city}`;
});

// Method to check if branch is open
branchSchema.methods.isOpenNow = function() {
  const now = new Date();
  const currentDay = now.toLocaleLowerCase().substring(0, 3); // e.g., 'sun', 'mon'
  const currentTime = now.toTimeString().substring(0, 5); // e.g., '14:30'
  
  const dayMap = {
    'sun': 'sunday',
    'mon': 'monday',
    'tue': 'tuesday',
    'wed': 'wednesday',
    'thu': 'thursday',
    'fri': 'friday',
    'sat': 'saturday'
  };
  
  const fullDay = dayMap[currentDay];
  
  return this.workingDays.includes(fullDay) && 
         currentTime >= this.workingHours.start && 
         currentTime <= this.workingHours.end;
};

module.exports = mongoose.model('Branch', branchSchema);