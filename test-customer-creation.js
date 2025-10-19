const http = require('http');

// بيانات اختبار
const testCustomer = {
  name: 'محمد أحمد السعيد',
  phone: '0501234567',
  email: 'mohammed@example.com',
  address: 'الرياض، حي النخيل، شارع الملك فهد'
};

console.log('🧪 Testing customer creation with new validator...\n');
console.log('📝 Customer data:', JSON.stringify(testCustomer, null, 2));
console.log('\n⏳ Attempting to create customer...\n');

// أولاً: تسجيل الدخول للحصول على token
const loginData = JSON.stringify({
  email: 'admin@clinic.com',
  password: 'admin123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const loginResponse = JSON.parse(data);
      
      if (!loginResponse.success) {
        console.log('❌ Login failed:', loginResponse.message);
        return;
      }
      
      const token = loginResponse.data.token;
      console.log('✅ Login successful! Token obtained.\n');
      
      // الآن: إنشاء العميل
      const customerData = JSON.stringify(testCustomer);
      
      const customerOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/customers',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(customerData),
          'Authorization': `Bearer ${token}`
        }
      };
      
      const customerReq = http.request(customerOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('Status Code:', res.statusCode);
            console.log('Response:', JSON.stringify(response, null, 2));
            
            if (res.statusCode === 201 || res.statusCode === 200) {
              console.log('\n✅ Customer created successfully!');
              console.log('Customer ID:', response.data._id);
            } else {
              console.log('\n❌ Failed to create customer');
              if (response.errors) {
                console.log('Validation errors:');
                response.errors.forEach(err => {
                  console.log(`  - ${err.field}: ${err.message}`);
                });
              }
            }
          } catch (error) {
            console.error('Parse error:', error.message);
            console.log('Raw response:', data);
          }
        });
      });
      
      customerReq.on('error', (error) => {
        console.error('Request error:', error.message);
      });
      
      customerReq.write(customerData);
      customerReq.end();
      
    } catch (error) {
      console.error('Login parse error:', error.message);
      console.log('Raw data:', data);
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Login request error:', error.message);
});

loginReq.write(loginData);
loginReq.end();
