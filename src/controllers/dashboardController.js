const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Consultation = require('../models/Consultation');
const Branch = require('../models/Branch');
const User = require('../models/User');
const { asyncHandler } = require('../utils/AppError');
const { sendSuccess } = require('../utils/helpers');
const { getDateRange } = require('../utils/helpers');

// @desc    Get dashboard quick stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  
  let startDate, endDate;
  
  // If month and year are provided, use them for filtering
  if (month !== undefined && year !== undefined) {
    const selectedMonth = parseInt(month);
    const selectedYear = parseInt(year);
    
    // Start of the selected month
    startDate = new Date(selectedYear, selectedMonth, 1);
    // End of the selected month
    endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
  } else {
    // Default to today
    const todayRange = getDateRange('today');
    startDate = todayRange.startDate;
    endDate = todayRange.endDate;
  }

  // Build filter based on user role
  const branchFilter = {};
  if (req.user.role === 'doctor' && req.user.branch) {
    branchFilter.branch = req.user.branch;
  }

  // Get stats for the selected period
  const [
    periodBookings,
    periodConsultations,
    totalCustomers,
    totalBranches,
    totalDoctors,
    pendingBookings,
    confirmedBookings,
    completedBookings
  ] = await Promise.all([
    Booking.countDocuments({
      ...branchFilter,
      appointmentDate: { $gte: startDate, $lte: endDate }
    }),
    Consultation.countDocuments({
      ...branchFilter,
      scheduledDate: { $gte: startDate, $lte: endDate }
    }),
    Customer.countDocuments({ isActive: true }),
    Branch.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'doctor', isActive: true }),
    Booking.countDocuments({ 
      ...branchFilter,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: 'pending' 
    }),
    Booking.countDocuments({ 
      ...branchFilter,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: 'confirmed' 
    }),
    Booking.countDocuments({ 
      ...branchFilter,
      appointmentDate: { $gte: startDate, $lte: endDate },
      status: 'completed' 
    })
  ]);

  // Calculate revenue for the selected period
  const periodRevenue = await Booking.aggregate([
    {
      $match: {
        ...branchFilter,
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: 'completed',
        paid: true
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$price' }
      }
    }
  ]);

  const stats = {
    quickStats: {
      todayBookings: periodBookings || 0,
      todayConsultations: periodConsultations || 0,
      totalCustomers: totalCustomers || 0,
      totalBranches: totalBranches || 0,
      totalDoctors: totalDoctors || 0,
      pendingBookings: pendingBookings || 0,
      confirmedBookings: confirmedBookings || 0,
      completedBookings: completedBookings || 0,
      todayRevenue: periodRevenue[0]?.total || 0,
      todayVaccinations: periodBookings || 0, // Same as bookings for vaccinations
      monthlyRevenue: periodRevenue[0]?.total || 0
    },
    bookingStats: {
      pending: pendingBookings || 0,
      confirmed: confirmedBookings || 0,
      completed: completedBookings || 0,
      total: (pendingBookings || 0) + (confirmedBookings || 0) + (completedBookings || 0)
    },
    chartData: {
      vaccinationTrends: generateVaccinationTrends(),
      animalDistribution: generateAnimalDistribution(),
      branchUsage: generateBranchUsage(),
      bookingStatus: {
        confirmed: confirmedBookings || 0,
        pending: pendingBookings || 0,
        cancelled: 0
      }
    }
  };

  sendSuccess(res, stats, 'Dashboard stats fetched successfully');
});

// @desc    Get vaccinations over time chart data
// @route   GET /api/dashboard/charts/vaccinations-over-time
// @access  Private
const getVaccinationsOverTime = asyncHandler(async (req, res) => {
  const { period = 'thisMonth' } = req.query;
  const { startDate, endDate } = getDateRange(period);

  let groupFormat;
  switch (period) {
    case 'today':
    case 'yesterday':
      groupFormat = { $hour: '$appointmentDate' };
      break;
    case 'thisWeek':
    case 'lastWeek':
      groupFormat = { $dayOfWeek: '$appointmentDate' };
      break;
    case 'thisMonth':
    case 'lastMonth':
      groupFormat = { $dayOfMonth: '$appointmentDate' };
      break;
    case 'thisYear':
      groupFormat = { $month: '$appointmentDate' };
      break;
    default:
      groupFormat = { $dayOfMonth: '$appointmentDate' };
  }

  const vaccinationData = await Booking.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        revenue: { $sum: '$price' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Format data for chart
  const chartData = vaccinationData.map(item => ({
    period: item._id,
    vaccinations: item.count,
    revenue: item.revenue
  }));

  sendSuccess(res, {
    period,
    data: chartData,
    total: chartData.reduce((sum, item) => sum + item.vaccinations, 0),
    totalRevenue: chartData.reduce((sum, item) => sum + item.revenue, 0)
  }, 'Vaccinations over time data fetched successfully');
});

// @desc    Get animals distribution chart data
// @route   GET /api/dashboard/charts/animals-distribution
// @access  Private
const getAnimalsDistribution = asyncHandler(async (req, res) => {
  const { period = 'thisMonth' } = req.query;
  const { startDate, endDate } = getDateRange(period);

  const animalDistribution = await Booking.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: '$animal.type',
        count: { $sum: 1 },
        revenue: { $sum: '$price' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Calculate percentages
  const total = animalDistribution.reduce((sum, item) => sum + item.count, 0);
  const chartData = animalDistribution.map(item => ({
    type: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    revenue: item.revenue
  }));

  sendSuccess(res, {
    period,
    data: chartData,
    total
  }, 'Animals distribution data fetched successfully');
});

// @desc    Get branches usage chart data
// @route   GET /api/dashboard/charts/branches-usage
// @access  Private
const getBranchesUsage = asyncHandler(async (req, res) => {
  const { period = 'thisMonth' } = req.query;
  const { startDate, endDate } = getDateRange(period);

  const branchUsage = await Booking.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'completed'] }
      }
    },
    {
      $group: {
        _id: '$branch',
        count: { $sum: 1 },
        revenue: { $sum: '$price' }
      }
    },
    {
      $lookup: {
        from: 'branches',
        localField: '_id',
        foreignField: '_id',
        as: 'branchInfo'
      }
    },
    {
      $unwind: '$branchInfo'
    },
    {
      $project: {
        _id: 1,
        name: '$branchInfo.name',
        code: '$branchInfo.code',
        city: '$branchInfo.city',
        count: 1,
        revenue: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  sendSuccess(res, {
    period,
    data: branchUsage,
    total: branchUsage.reduce((sum, item) => sum + item.count, 0)
  }, 'Branches usage data fetched successfully');
});

// @desc    Get bookings status chart data
// @route   GET /api/dashboard/charts/bookings-status
// @access  Private
const getBookingsStatus = asyncHandler(async (req, res) => {
  const { period = 'thisMonth' } = req.query;
  const { startDate, endDate } = getDateRange(period);

  const statusDistribution = await Booking.aggregate([
    {
      $match: {
        appointmentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$paid', true] }, '$price', 0] } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Calculate percentages
  const total = statusDistribution.reduce((sum, item) => sum + item.count, 0);
  const chartData = statusDistribution.map(item => ({
    status: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    revenue: item.revenue
  }));

  sendSuccess(res, {
    period,
    data: chartData,
    total
  }, 'Bookings status data fetched successfully');
});

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  // Get recent bookings
  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customer', 'name phone')
    .populate('branch', 'name code')
    .select('bookingNumber status appointmentDate animal.name animal.type createdAt');

  // Get recent consultations
  const recentConsultations = await Consultation.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('customer', 'name phone')
    .populate('doctor', 'name')
    .select('consultationNumber status scheduledDate animal.name animal.type createdAt');

  // Combine and sort by creation date
  const allActivities = [
    ...recentBookings.map(booking => ({
      type: 'booking',
      id: booking._id,
      number: booking.bookingNumber,
      status: booking.status,
      customer: booking.customer,
      branch: booking.branch,
      animal: booking.animal,
      date: booking.appointmentDate,
      createdAt: booking.createdAt
    })),
    ...recentConsultations.map(consultation => ({
      type: 'consultation',
      id: consultation._id,
      number: consultation.consultationNumber,
      status: consultation.status,
      customer: consultation.customer,
      doctor: consultation.doctor,
      animal: consultation.animal,
      date: consultation.scheduledDate,
      createdAt: consultation.createdAt
    }))
  ].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);

  sendSuccess(res, allActivities, 'Recent activities fetched successfully');
});

// @desc    Get performance metrics
// @route   GET /api/dashboard/performance
// @access  Private
const getPerformanceMetrics = asyncHandler(async (req, res) => {
  const { period = 'thisMonth' } = req.query;
  const { startDate, endDate } = getDateRange(period);
  
  // Get previous period for comparison
  const periodLength = endDate - startDate;
  const prevEndDate = new Date(startDate - 1);
  const prevStartDate = new Date(prevEndDate - periodLength);

  const [currentMetrics, previousMetrics] = await Promise.all([
    getMetricsForPeriod(startDate, endDate),
    getMetricsForPeriod(prevStartDate, prevEndDate)
  ]);

  // Calculate growth rates
  const growth = {
    bookings: calculateGrowth(currentMetrics.bookings, previousMetrics.bookings),
    revenue: calculateGrowth(currentMetrics.revenue, previousMetrics.revenue),
    customers: calculateGrowth(currentMetrics.customers, previousMetrics.customers),
    consultations: calculateGrowth(currentMetrics.consultations, previousMetrics.consultations)
  };

  sendSuccess(res, {
    current: currentMetrics,
    previous: previousMetrics,
    growth
  }, 'Performance metrics fetched successfully');
});

// Helper function to get metrics for a period
const getMetricsForPeriod = async (startDate, endDate) => {
  const [bookings, revenue, customers, consultations] = await Promise.all([
    Booking.countDocuments({
      appointmentDate: { $gte: startDate, $lte: endDate }
    }),
    Booking.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate, $lte: endDate },
          status: 'completed',
          paid: true
        }
      },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]),
    Customer.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    }),
    Consultation.countDocuments({
      scheduledDate: { $gte: startDate, $lte: endDate }
    })
  ]);

  return {
    bookings,
    revenue: revenue[0]?.total || 0,
    customers,
    consultations
  };
};

// Helper function to calculate growth percentage
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

// Helper functions to generate dummy chart data
const generateVaccinationTrends = () => {
  const labels = [];
  const data = [];
  const currentDate = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    labels.push(date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }));
    data.push(Math.floor(Math.random() * 25) + 5);
  }
  
  return { labels, data };
};

const generateAnimalDistribution = () => {
  return {
    labels: ['الإبل 🐪', 'الأغنام 🐑', 'الماعز 🐐'],
    data: [
      Math.floor(Math.random() * 50) + 30,
      Math.floor(Math.random() * 80) + 40,
      Math.floor(Math.random() * 60) + 25
    ]
  };
};

const generateBranchUsage = () => {
  return {
    labels: ['الفرع الرئيسي', 'فرع الشرق', 'فرع الغرب', 'فرع الشمال', 'فرع الجنوب'],
    data: [
      Math.floor(Math.random() * 100) + 60,
      Math.floor(Math.random() * 80) + 40,
      Math.floor(Math.random() * 70) + 35,
      Math.floor(Math.random() * 60) + 25,
      Math.floor(Math.random() * 50) + 20
    ]
  };
};

// @desc    Get all charts data
// @route   GET /api/dashboard/charts
// @access  Private
const getAllChartsData = asyncHandler(async (req, res) => {
  try {
    const [
      vaccinations,
      animals,
      branches,
      bookings
    ] = await Promise.all([
      getVaccinationsOverTimeData(),
      getAnimalsDistributionData(),
      getBranchesUsageData(),
      getBookingsStatusData()
    ]);

    const chartsData = {
      vaccinations,
      animals,
      branches,
      bookings
    };

    sendSuccess(res, chartsData, 'Charts data fetched successfully');
  } catch (error) {
    console.error('Error fetching charts data:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسوم البيانية'
    });
  }
});

// @desc    Get operations chart data (bookings over time)
// @route   GET /api/dashboard/charts/operations
// @access  Private
const getOperationsChartData = asyncHandler(async (req, res) => {
  try {
    const { period = '7days', month, year } = req.query;
    
    let startDate, endDate, groupBy, dateFormat;
    const currentDate = new Date();
    
    // Build filter based on user role
    const matchFilter = {};
    if (req.user.role === 'doctor' && req.user.branch) {
      matchFilter.branch = req.user.branch;
    }
    
    // If month and year are provided, use them for filtering
    if (month !== undefined && year !== undefined) {
      const selectedMonth = parseInt(month);
      const selectedYear = parseInt(year);
      
      // Start of the selected month
      startDate = new Date(selectedYear, selectedMonth, 1);
      // End of the selected month
      endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
      
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
      dateFormat = 'monthly';
    } else {
      // Use period-based filtering (existing logic)
      switch (period) {
        case '7days':
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = currentDate;
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
          dateFormat = 'daily';
          break;
        case '30days':
          startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = currentDate;
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
          dateFormat = 'daily';
          break;
        case '6months':
          startDate = new Date(currentDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
          endDate = currentDate;
          groupBy = { $dateToString: { format: "%Y-%m", date: "$appointmentDate" } };
          dateFormat = 'monthly_range';
          break;
        default:
          startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = currentDate;
          groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
          dateFormat = 'daily';
      }
    }

    matchFilter.appointmentDate = { $gte: startDate, $lte: endDate };

    const operationsData = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill missing dates with zero values
    const labels = [];
    const data = [];
    
    if (dateFormat === 'monthly') {
      // For monthly view (when month/year provided), show all days in that month
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(startDate.getFullYear(), startDate.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const found = operationsData.find(item => item._id === dateStr);
        
        labels.push(date.toLocaleDateString('ar-SA', { day: 'numeric' }));
        data.push(found ? found.count : 0);
      }
    } else if (dateFormat === 'daily') {
      const days = period === '7days' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const found = operationsData.find(item => item._id === dateStr);
        
        labels.push(date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }));
        data.push(found ? found.count : 0);
      }
    } else {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
        const dateStr = date.toISOString().substr(0, 7);
        const found = operationsData.find(item => item._id === dateStr);
        
        labels.push(date.toLocaleDateString('ar-SA', { month: 'long' }));
        data.push(found ? found.count : 0);
      }
    }

    sendSuccess(res, { labels, data }, 'Operations chart data fetched successfully');
  } catch (error) {
    console.error('Error fetching operations chart data:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسم البياني للعمليات'
    });
  }
});

// @desc    Get revenue chart data by branches
// @route   GET /api/dashboard/charts/revenue
// @access  Private
const getRevenueChartData = asyncHandler(async (req, res) => {
  try {
    // Build filter based on user role
    const matchFilter = {
      status: 'completed',
      paid: true
    };
    
    if (req.user.role === 'doctor' && req.user.branch) {
      matchFilter.branch = req.user.branch;
    }

    const revenueData = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branchInfo'
        }
      },
      {
        $unwind: '$branchInfo'
      },
      {
        $group: {
          _id: '$branchInfo.name',
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      }
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
    
    const chartData = revenueData.map(item => ({
      name: item._id,
      value: Math.round((item.revenue / totalRevenue) * 100),
      revenue: item.revenue,
      count: item.count
    }));

    sendSuccess(res, { 
      data: chartData, 
      totalRevenue,
      currency: 'ريال'
    }, 'Revenue chart data fetched successfully');
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسم البياني للإيرادات'
    });
  }
});

// @desc    Get operations distribution chart data
// @route   GET /api/dashboard/charts/operations-distribution
// @access  Private
const getOperationsDistributionData = asyncHandler(async (req, res) => {
  try {
    // Build filter based on user role
    const matchFilter = {};
    if (req.user.role === 'doctor' && req.user.branch) {
      matchFilter.branch = req.user.branch;
    }

    const distributionData = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      {
        $unwind: '$customerInfo'
      },
      {
        $unwind: '$customerInfo.animals'
      },
      {
        $group: {
          _id: '$customerInfo.animals.type',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeMap = {
      'camel': 'الإبل 🐪',
      'sheep': 'الأغنام 🐑', 
      'goat': 'الماعز 🐐',
      'cow': 'الأبقار 🐄',
      'horse': 'الخيول 🐎'
    };

    const chartData = distributionData.map(item => ({
      name: typeMap[item._id] || item._id,
      value: item.count,
      percentage: Math.round((item.count / distributionData.reduce((sum, d) => sum + d.count, 0)) * 100)
    }));

    sendSuccess(res, chartData, 'Operations distribution data fetched successfully');
  } catch (error) {
    console.error('Error fetching operations distribution data:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات توزيع العمليات'
    });
  }
});

// @desc    Get transactions chart data
// @route   GET /api/dashboard/charts/transactions
// @access  Private
const getTransactionsChartData = asyncHandler(async (req, res) => {
  try {
    const { period = '7days' } = req.query;
    
    let startDate, groupBy;
    const currentDate = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
        break;
      case '30days':
        startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
        break;
      default:
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } };
    }

    // Build filter based on user role
    const matchFilter = {
      appointmentDate: { $gte: startDate, $lte: currentDate },
      paid: true
    };
    
    if (req.user.role === 'doctor' && req.user.branch) {
      matchFilter.branch = req.user.branch;
    }

    const transactionsData = await Booking.aggregate([
      {
        $match: matchFilter
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$price' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill missing dates
    const labels = [];
    const revenue = [];
    const transactions = [];
    
    const days = period === '7days' ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const found = transactionsData.find(item => item._id === dateStr);
      
      labels.push(date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }));
      revenue.push(found ? found.revenue : 0);
      transactions.push(found ? found.count : 0);
    }

    sendSuccess(res, { 
      labels, 
      revenue, 
      transactions,
      currency: 'ريال'
    }, 'Transactions chart data fetched successfully');
  } catch (error) {
    console.error('Error fetching transactions chart data:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسم البياني للمعاملات'
    });
  }
});

// Helper functions to get chart data
const getVaccinationsOverTimeData = async () => {
  return {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    data: [65, 59, 80, 81, 56, 55]
  };
};

const getAnimalsDistributionData = async () => {
  const animalCounts = await Customer.aggregate([
    { $unwind: '$animals' },
    { $group: { _id: '$animals.type', count: { $sum: 1 } } }
  ]);

  return {
    labels: animalCounts.map(item => {
      const typeMap = { 'camel': 'إبل', 'sheep': 'أغنام', 'goat': 'ماعز' };
      return typeMap[item._id] || item._id;
    }),
    data: animalCounts.map(item => item.count)
  };
};

const getBranchesUsageData = async () => {
  const branchUsage = await Booking.aggregate([
    { $lookup: { from: 'branches', localField: 'branch', foreignField: '_id', as: 'branchInfo' } },
    { $unwind: '$branchInfo' },
    { $group: { _id: '$branchInfo.name', count: { $sum: 1 } } }
  ]);

  return {
    labels: branchUsage.map(item => item._id),
    data: branchUsage.map(item => item.count)
  };
};

const getBookingsStatusData = async () => {
  const statusCounts = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  return {
    labels: statusCounts.map(item => {
      const statusMap = {
        'pending': 'في الانتظار',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
      };
      return statusMap[item._id] || item._id;
    }),
    data: statusCounts.map(item => item.count)
  };
};

module.exports = {
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
};