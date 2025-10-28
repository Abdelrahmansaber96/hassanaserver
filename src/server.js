const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('express-async-errors');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔑 Environment Variables Loaded:');
console.log('  - WHATSAPP_API_KEY:', process.env.WHATSAPP_API_KEY ? 'EXISTS' : 'MISSING');
console.log('  - WHATSAPP_PHONE_ID:', process.env.WHATSAPP_PHONE_ID || 'MISSING');

const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const branchRoutes = require('./routes/branchRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const offerRoutes = require('./routes/offerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingRoutes = require('./routes/settingRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');
const customerApiRoutes = require('./routes/customerApiRoutes');

const app = express();

// Connect to DB
connectDB();

// Security middlewares
app.use(helmet());
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 🔹 Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Animal Vaccination Dashboard API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 🔹 Developer info route
app.get('/', (req, res) => {
  res.redirect('/info');
});

// 🔹 Info page (HTML)
app.get('/info', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>نظام إدارة عيادة الحيوانات</title>
        <style>
            body {
              font-family: sans-serif;
              background: linear-gradient(135deg, #667eea, #764ba2);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .box {
              text-align: center;
              padding: 30px;
              border-radius: 15px;
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            }
            a { color: #74b9ff; }
        </style>
    </head>
    <body>
      <div class="box">
        <h1>🐾 نظام إدارة التطعيمات البيطرية</h1>
        <p>✅ السيرفر يعمل بنجاح</p>
        <p>MongoDB متصل | PORT: ${process.env.PORT || 3000}</p>
        <p><a href="/api">عرض واجهة API JSON</a></p>
      </div>
    </body>
    </html>
  `);
});

// 🔹 API info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في API نظام إدارة عيادة الحيوانات',
    version: '1.0.0',
    status: 'Server running',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      customers: '/api/customers',
      bookings: '/api/bookings',
      branches: '/api/branches',
      doctors: '/api/doctors',
      consultations: '/api/consultations',
      offers: '/api/offers',
      notifications: '/api/notifications',
      settings: '/api/settings',
      vaccinations: '/api/vaccinations',
      'customer-api': '/api/customer-api'
    }
  });
});

// 🔹 Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

// 🔹 API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/customers', apiLimiter, customerRoutes);
app.use('/api/bookings', apiLimiter, bookingRoutes);
app.use('/api/branches', apiLimiter, branchRoutes);
app.use('/api/doctors', apiLimiter, doctorRoutes);
app.use('/api/consultations', apiLimiter, consultationRoutes);
app.use('/api/offers', apiLimiter, offerRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/settings', apiLimiter, settingRoutes);
app.use('/api/vaccinations', apiLimiter, vaccinationRoutes);
app.use('/api/customer-api', customerApiRoutes);

// 🔹 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// 🔹 Error handling
app.use(errorHandler);

// 🔹 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
});
