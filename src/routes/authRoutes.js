const express = require('express');
const {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,
  registerCustomer,
  customerLogin
} = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { validate } = require('../validators');
const {
  registerValidator,
  loginValidator,
  updatePasswordValidator,
  simpleCustomerValidator,
  customerLoginValidator
} = require('../validators');

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidator), register);
router.post('/register-customer', validate(simpleCustomerValidator), registerCustomer);
router.post('/customer-login', validate(customerLoginValidator), customerLogin);
router.post('/login', validate(loginValidator), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Private routes
router.use(auth); // Apply auth middleware to all routes below

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/password', validate(updatePasswordValidator), updatePassword);
router.post('/logout', logout);

module.exports = router;