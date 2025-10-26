const express = require('express');
const {
  getNotifications,
  createNotification,
  markAsRead,
  getUnreadCount
} = require('../controllers/notificationController');
const auth = require('../middlewares/auth');
const { authorize, checkActionPermission } = require('../middlewares/authorize');
const { validate } = require('../validators');
const { notificationValidator } = require('../validators');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Notification routes
router.get('/unread-count', getUnreadCount);

router.route('/')
  .get(checkActionPermission('read', 'notification'), getNotifications)
  .post(authorize('admin', 'doctor'), validate(notificationValidator), createNotification);

router.patch('/:id/read', markAsRead);

module.exports = router;