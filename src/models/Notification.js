const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: [true, 'Notification type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  recipients: {
    type: String,
    enum: ['all', 'customers', 'staff', 'doctors', 'admins', 'specific'],
    required: [true, 'Recipients type is required']
  },
  specificRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  specificCustomers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  channels: [{
    type: String,
    enum: ['app', 'email', 'sms', 'whatsapp', 'push'],
    default: 'app'
  }],
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['booking', 'consultation', 'offer', 'customer', 'user']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  actions: [{
    label: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    url: {
      type: String
    }
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  recipientsCount: {
    type: Number,
    default: 0
  },
  deliveryStats: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledAt: 1 });
notificationSchema.index({ recipients: 1 });
notificationSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

// Virtual for delivery rate
notificationSchema.virtual('deliveryRate').get(function() {
  if (this.deliveryStats.sent === 0) return 0;
  return (this.deliveryStats.delivered / this.deliveryStats.sent) * 100;
});

// Virtual for open rate
notificationSchema.virtual('openRate').get(function() {
  if (this.deliveryStats.delivered === 0) return 0;
  return (this.deliveryStats.opened / this.deliveryStats.delivered) * 100;
});

// Virtual for click rate
notificationSchema.virtual('clickRate').get(function() {
  if (this.deliveryStats.opened === 0) return 0;
  return (this.deliveryStats.clicked / this.deliveryStats.opened) * 100;
});

// Method to mark as read by user
notificationSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if read by user
notificationSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    $or: [
      { recipients: 'all' },
      { recipients: 'staff' },
      { recipients: 'doctors' },
      { recipients: 'admins' },
      { specificRecipients: userId }
    ],
    status: 'sent',
    isActive: true,
    'readBy.user': { $ne: userId }
  });
};

module.exports = mongoose.model('Notification', notificationSchema);