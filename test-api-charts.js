const http = require('http');

// Test login and then charts API
async function testChartsAPI() {
  console.log('🔐 Logging in...');

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
        if (res.statusCode === 200 && response.success) {
          const token = response.data.token;
          console.log('✅ Login successful');

          // Test charts API
          testCharts(token);
        } else {
          console.log('❌ Login failed:', response.message);
        }
      } catch (error) {
        console.error('❌ Error parsing login response');
      }
    });
  });

  loginReq.on('error', (error) => {
    console.error('❌ Login request error:', error.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testCharts(token) {
  console.log('\n📊 Testing /api/dashboard/charts...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/dashboard/charts',
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
      console.log('Charts API response status:', res.statusCode);

      try {
        const response = JSON.parse(data);
        console.log('Charts response:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200) {
          console.log('✅ Charts API successful');
        } else {
          console.log('❌ Charts API failed');
        }
      } catch (error) {
        console.error('❌ Error parsing charts response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Charts API request error:', error.message);
  });

  req.end();
}

testChartsAPI();