const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  manager: {
    type: String,
    trim: true
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
    type: String
  }],
  services: [{
    type: String,
    trim: true
  }],
  capacity: {
    type: Number,
    default: 50,
    min: 1
  },
  image: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  coordinates: {
    lat: {
      type: Number
    },
    lng: {
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
branchSchema.index({ city: 1 });
branchSchema.index({ isActive: 1 });
branchSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

// Virtual for branch's full address
branchSchema.virtual('fullAddress').get(function() {
  return `${this.location}, ${this.city}`;
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