const http = require('http');

async function testDuplicatePhone() {
  // تسجيل الدخول أولاً
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
            console.log('❌ Login failed');
            reject(loginResponse);
            return;
          }
          
          const token = loginResponse.data.token;
          console.log('✅ Login successful!\n');
          
          // محاولة 1: إضافة عميل برقم جديد
          console.log('🧪 Test 1: Adding customer with new phone number...');
          testAddCustomer(token, {
            name: 'عميل اختبار جديد',
            phone: '0599999999',
            email: 'test@test.com',
            address: 'الرياض'
          });

          // محاولة 2: إضافة عميل برقم مكرر بعد ثانيتين
          setTimeout(() => {
            console.log('\n🧪 Test 2: Trying to add customer with duplicate phone...');
            testAddCustomer(token, {
              name: 'عميل مكرر',
              phone: '0501234567', // رقم موجود مسبقاً
              email: 'duplicate@test.com',
              address: 'جدة'
            });
          }, 2000);

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

function testAddCustomer(token, customerData) {
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
        
        console.log(`\n📞 Phone: ${customerData.phone}`);
        console.log(`👤 Name: ${customerData.name}`);
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ Success! Customer created');
          console.log(`ID: ${response.data._id}`);
        } else {
          console.log('❌ Failed!');
          console.log(`Message: ${response.message}`);
          if (response.errors) {
            response.errors.forEach(err => {
              console.log(`  - ${err.field}: ${err.message}`);
            });
          }
        }
        console.log('-'.repeat(60));
      } catch (error) {
        console.error('Parse error:', error.message);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

console.log('🧪 Testing Duplicate Phone Number Prevention\n');
console.log('='.repeat(60));

testDuplicatePhone().catch(error => {
  console.error('Error:', error);
});
