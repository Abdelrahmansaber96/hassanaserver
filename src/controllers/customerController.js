const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess, sendError, sendNotFound } = require('../utils/helpers');

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find();
  sendSuccess(res, customers, 'Customers fetched successfully');
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  sendSuccess(res, customer, 'Customer details fetched successfully');
});

const createCustomer = asyncHandler(async (req, res) => {
  // التحقق من عدم وجود رقم الهاتف مسبقاً
  const existingCustomer = await Customer.findOne({ phone: req.body.phone });
  if (existingCustomer) {
    return sendError(res, 'رقم الهاتف موجود مسبقاً. الرجاء استخدام رقم آخر', 400);
  }
  
  const customer = await Customer.create(req.body);
  sendSuccess(res, customer, 'Customer created successfully', 201);
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  sendSuccess(res, customer, 'Customer updated successfully');
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  sendSuccess(res, null, 'Customer deleted successfully');
});

const deactivateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  sendSuccess(res, customer, 'Customer deactivated successfully');
});

const activateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  sendSuccess(res, customer, 'Customer activated successfully');
});

const addAnimal = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  customer.animals.push(req.body);
  await customer.save();
  sendSuccess(res, customer, 'Animal added successfully');
});

const updateAnimal = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  const animal = customer.animals.id(req.params.animalId);
  if (!animal) {
    return sendNotFound(res, 'Animal');
  }
  Object.assign(animal, req.body);
  await customer.save();
  sendSuccess(res, customer, 'Animal updated successfully');
});

const deleteAnimal = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return sendNotFound(res, 'Customer');
  }
  customer.animals.id(req.params.animalId).remove();
  await customer.save();
  sendSuccess(res, customer, 'Animal deleted successfully');
});

const getCustomerStats = asyncHandler(async (req, res) => {
  const totalCustomers = await Customer.countDocuments();
  const activeCustomers = await Customer.countDocuments({ isActive: true });
  sendSuccess(res, { totalCustomers, activeCustomers }, 'Customer statistics fetched successfully');
});

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  deactivateCustomer,
  activateCustomer,
  addAnimal,
  updateAnimal,
  deleteAnimal,
  getCustomerStats
};
