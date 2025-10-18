const express = require('express');
const {
  getDashboardStats,
  getAllChartsData,
  getOperationsChartData,
  getRevenueChartData,
  getOperationsDistributionData,
  getTransactionsChartData,
  getVaccinationsOverTime,
  getAnimalsDistribution,
  getBranchesUsage,
  getBookingsStatus,
  getRecentActivities,
  getPerformanceMetrics
} = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/charts', getAllChartsData);
router.get('/recent-activities', getRecentActivities);
router.get('/performance', getPerformanceMetrics);

// Individual chart routes
router.get('/charts/operations', getOperationsChartData);
router.get('/charts/revenue', getRevenueChartData);
router.get('/charts/operations-distribution', getOperationsDistributionData);
router.get('/charts/transactions', getTransactionsChartData);
router.get('/charts/vaccinations-over-time', getVaccinationsOverTime);
router.get('/charts/animals-distribution', getAnimalsDistribution);
router.get('/charts/branches-usage', getBranchesUsage);
router.get('/charts/bookings-status', getBookingsStatus);

module.exports = router;