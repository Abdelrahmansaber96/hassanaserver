const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');
const { Pagination } = require('../utils/pagination');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  let query;
  
  // إذا كان admin، يستطيع رؤية جميع الإشعارات
  if (req.user.role === 'admin') {
    query = Notification.find({ isActive: true });
  } else {
    // للمستخدمين الآخرين، فقط الإشعارات الخاصة بهم
    query = Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: req.user.role === 'doctor' ? 'doctors' : 'staff' },
        { specificRecipients: req.user.id }
      ],
      isActive: true
    });
  }

  const pagination = new Pagination(query, req.query)
    .filter()
    .search(['title', 'message'])
    .sort()
    .limitFields()
    .paginate();

  pagination.query = pagination.query.populate('createdBy', 'name');

  const result = await pagination.execute();

  // Mark notifications as read
  const notificationIds = result.docs.map(n => n._id);
  await Notification.updateMany(
    { 
      _id: { $in: notificationIds },
      'readBy.user': { $ne: req.user.id }
    },
    { 
      $push: { readBy: { user: req.user.id } }
    }
  );

  sendSuccess(res, { notifications: result.docs }, 'Notifications fetched successfully', 200, { pagination: result.pagination });
});

// @desc    Create new notification
// @route   POST /api/notifications
// @access  Private (Admin only)
const createNotification = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  
  // تحديد عدد المستلمين بناءً على نوع المستلمين
  let recipientsCount = 0;
  if (req.body.recipients === 'specific' && req.body.specificRecipients) {
    recipientsCount = req.body.specificRecipients.length;
  } else if (req.body.recipients === 'all') {
    // يمكنك حساب عدد جميع المستخدمين/العملاء
    recipientsCount = 100; // قيمة افتراضية للتوضيح
  }

  const notification = await Notification.create({
    ...req.body,
    recipientsCount,
    status: req.body.scheduledAt ? 'scheduled' : 'sent' // إذا كان مجدول -> scheduled، وإلا -> sent
  });

  await notification.populate('createdBy', 'name');

  sendSuccess(res, notification, 'Notification created successfully', 201);
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return sendNotFound(res, 'Notification');
  }

  await notification.markAsRead(req.user.id);

  sendSuccess(res, null, 'Notification marked as read');
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user.id);

  sendSuccess(res, { count }, 'Unread count fetched successfully');
});

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  getUnreadCount
};