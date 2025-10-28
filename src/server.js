const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('express-async-errors');

// Load environment variables from .env file
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

// Connect to database
connectDB();

// Security middlewares
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check routes (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Animal Vaccination Dashboard API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API Health check for frontend
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'Animal Vaccination Dashboard API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rate limiting - More generous limits for authenticated users
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased from 100 to 500 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Apply rate limiting only to auth routes (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit login attempts
  message: { success: false, message: 'Too many login attempts, please try again later.' }
});

// Root route - Redirect to dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Login page route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

// Old API info route for developers
app.get('/info', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>نظام إدارة عيادة الحيوانات</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                border: 1px solid rgba(255, 255, 255, 0.18);
                max-width: 800px;
                width: 90%;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .status {
                background: rgba(46, 204, 113, 0.3);
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                border: 1px solid rgba(46, 204, 113, 0.5);
            }
            .endpoints {
                background: rgba(255, 255, 255, 0.1);
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: right;
            }
            .endpoint {
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            .endpoint:last-child {
                border-bottom: none;
            }
            .endpoint a {
                color: #74b9ff;
                text-decoration: none;
                transition: color 0.3s;
            }
            .endpoint a:hover {
                color: #0984e3;
            }
            .version {
                margin-top: 20px;
                opacity: 0.8;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">🏥</div>
            <h1>نظام إدارة عيادة الحيوانات</h1>
            <div class="status">
                <h3>✅ السيرفر يعمل بنجاح</h3>
                <p>MongoDB متصل | PORT: 3000</p>
            </div>
            
            <div class="endpoints">
                <h3>📝 نقاط النهاية المتاحة:</h3>
                <div class="endpoint">🔐 <a href="/api/auth/login">المصادقة</a> - /api/auth</div>
                <div class="endpoint">📊 <a href="/api/dashboard/stats">لوحة التحكم</a> - /api/dashboard</div>
                <div class="endpoint">👥 <a href="/api/customers">العملاء</a> - /api/customers</div>
                <div class="endpoint">📅 <a href="/api/bookings">الحجوزات</a> - /api/bookings</div>
                <div class="endpoint">🏢 <a href="/api/branches">الفروع</a> - /api/branches</div>
                <div class="endpoint">👨‍⚕️ <a href="/api/doctors">الأطباء</a> - /api/doctors</div>
                <div class="endpoint">📞 <a href="/api/consultations">الاستشارات</a> - /api/consultations</div>
                <div class="endpoint">🎁 <a href="/api/offers">العروض</a> - /api/offers</div>
                <div class="endpoint">🔔 <a href="/api/notifications">الإشعارات</a> - /api/notifications</div>
                <div class="endpoint">⚙️ <a href="/api/settings">الإعدادات</a> - /api/settings</div>
            </div>
            
            <div class="version">
                <p>الإصدار 1.0.0 | تم التطوير بـ ❤️</p>
                <p>Node.js + Express.js + MongoDB</p>
            </div>
        </div>

        <script>
            // Add some interactivity
            document.querySelectorAll('.endpoint a').forEach(link => {
                link.addEventListener('click', function(e) {
                    if (this.getAttribute('href').includes('/api/')) {
                        e.preventDefault();
                        window.open(this.getAttribute('href'), '_blank');
                    }
                });
            });
        </script>
    </body>
    </html>
  `);
});

// API Info endpoint (for developers)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في API نظام إدارة عيادة الحيوانات',
    status: 'Server is running',
    version: '1.0.0',
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
      settings: '/api/settings'
    },
    documentation: {
      readme: 'Check README.md for complete documentation',
      postman: 'Import API endpoints to Postman for testing'
    }
  });
});

// Favicon route to avoid 404
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API Test page
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>اختبار API - نظام إدارة عيادة الحيوانات</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; }
            h1 { color: #333; text-align: center; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
            .method { color: #28a745; font-weight: bold; }
            button { background: #007bff; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .result { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 4px; white-space: pre-wrap; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🧪 اختبار API</h1>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/dashboard/stats
                <button onclick="testEndpoint('/api/dashboard/stats')">اختبار</button>
                <div id="result-stats" class="result" style="display:none;"></div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/customers
                <button onclick="testEndpoint('/api/customers')">اختبار</button>
                <div id="result-customers" class="result" style="display:none;"></div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/bookings
                <button onclick="testEndpoint('/api/bookings')">اختبار</button>
                <div id="result-bookings" class="result" style="display:none;"></div>
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/branches
                <button onclick="testEndpoint('/api/branches')">اختبار</button>
                <div id="result-branches" class="result" style="display:none;"></div>
            </div>
        </div>

        <script>
            async function testEndpoint(url) {
                const resultId = 'result' + url.replace('/api', '').replace('/', '-');
                const resultDiv = document.getElementById(resultId);
                
                try {
                    resultDiv.style.display = 'block';
                    resultDiv.textContent = 'جاري التحميل...';
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    resultDiv.textContent = JSON.stringify(data, null, 2);
                } catch (error) {
                    resultDiv.textContent = 'خطأ: ' + error.message;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// API routes with appropriate rate limiting
app.use('/api/auth', authLimiter, authRoutes); // Strict limit for auth
app.use('/api/dashboard', apiLimiter, dashboardRoutes); // Higher limit for dashboard
app.use('/api/customers', apiLimiter, customerRoutes);
app.use('/api/bookings', apiLimiter, bookingRoutes);
app.use('/api/branches', apiLimiter, branchRoutes);
app.use('/api/doctors', apiLimiter, doctorRoutes);
app.use('/api/consultations', apiLimiter, consultationRoutes);
app.use('/api/offers', apiLimiter, offerRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/settings', apiLimiter, settingRoutes);
app.use('/api/vaccinations', apiLimiter, vaccinationRoutes);
app.use('/api/customer-api', customerApiRoutes); // No rate limit for customer API (Flutter app)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}`);
  console.log(`🏥 Animal Vaccination Management System`);
});