const http = require('http');

// اختبار أرقام هواتف مختلفة
const testCases = [
  {
    name: 'محمد أحمد',
    phone: '0501234567',
    email: 'mohammed@test.com',
    address: 'الرياض'
  },
  {
    name: 'أحمد علي',
    phone: '0551234567',
    email: '',
    address: ''
  },
  {
    name: 'سارة خالد',
    phone: '966501234567',
    email: 'sara@test.com',
    address: 'جدة'
  },
  {
    name: 'فاطمة محمد',
    phone: '123456', // رقم خاطئ - للاختبار
    email: 'test@test.com',
    address: 'الدمام'
  }
];

async function loginAndTest() {
  // تسجيل الدخول
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

  return new Promise((resolve, reject) => {
    const loginReq = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const loginResponse = JSON.parse(data);
          if (!loginResponse.success) {
            console.log('❌ Login failed:', loginResponse.message);
            reject(loginResponse);
            return;
          }
          
          const token = loginResponse.data.token;
          console.log('✅ Login successful!\n');
          
          // اختبار كل حالة
          testCases.forEach((testCase, index) => {
            setTimeout(() => {
              testCustomerCreation(token, testCase, index + 1);
            }, index * 1000);
          });
          
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    loginReq.on('error', reject);
    loginReq.write(loginData);
    loginReq.end();
  });
}

function testCustomerCreation(token, customerData, testNumber) {
  console.log(`\n📝 Test ${testNumber}: ${customerData.name}`);
  console.log('Phone:', customerData.phone);
  
  const postData = JSON.stringify(customerData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${token}`
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ Success! Customer created:', response.data._id);
        } else {
          console.log('❌ Failed! Status:', res.statusCode);
          if (response.errors) {
            console.log('Validation errors:');
            response.errors.forEach(err => {
              console.log(`  - ${err.field}: ${err.message}`);
            });
          } else if (response.message) {
            console.log('Error:', response.message);
          }
        }
      } catch (error) {
        console.error('Parse error:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

console.log('🧪 Testing Customer Creation with Different Phone Formats\n');
console.log('='.repeat(60));

loginAndTest().catch(error => {
  console.error('Error:', error);
});
