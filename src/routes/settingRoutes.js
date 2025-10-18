const express = require('express');
const {
  getSettings,
  getUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser
} = require('../controllers/settingController');
const auth = require('../middlewares/auth');
const { authorize } = require('../middlewares/authorize');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// All settings routes require admin access
router.use(authorize('admin'));

// Settings routes
router.get('/', getSettings);

// User management routes
router.route('/users')
  .get(getUsers)
  .post(createUser);

router.route('/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;