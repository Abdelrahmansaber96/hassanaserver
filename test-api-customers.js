const http = require('http');

// Test login first to get token
async function loginAndTestCustomers() {
  console.log('🔐 Logging in to get token...');

  const loginData = JSON.stringify({
    email: 'admin@clinic.com',
    password: 'password123'
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

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('Login response status:', res.statusCode);

        if (res.statusCode === 200 && response.success) {
          const token = response.data.token;
          console.log('✅ Login successful, got token');

          // Now test customers endpoint
          testCustomersAPI(token);
        } else {
          console.log('❌ Login failed:', response.message);
        }
      } catch (error) {
        console.error('❌ Error parsing login response:', error.message);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.error('❌ Login request error:', error.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testCustomersAPI(token) {
  console.log('\n📋 Testing /api/customers endpoint...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/customers',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Customers API response status:', res.statusCode);

      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200) {
          console.log(`✅ API returned ${response.customers ? response.customers.length : 0} customers`);
        } else {
          console.log('❌ API returned error');
        }
      } catch (error) {
        console.error('❌ Error parsing customers response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Customers API request error:', error.message);
  });

  req.end();
}

// Start the test
loginAndTestCustomers();