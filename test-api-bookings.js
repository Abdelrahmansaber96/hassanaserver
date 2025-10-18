const http = require('http');

// Test login and then bookings API
async function testBookingsAPI() {
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

          // Test bookings API
          testBookings(token);
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

function testBookings(token) {
  console.log('\n📅 Testing /api/bookings...');

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/bookings',
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
      console.log('Bookings API response status:', res.statusCode);

      try {
        const response = JSON.parse(data);
        console.log('Bookings response structure:', JSON.stringify(response, null, 2));

        if (res.statusCode === 200) {
          console.log('✅ Bookings API successful');
          if (response.data && response.data.bookings) {
            console.log(`📊 Found ${response.data.bookings.length} bookings`);
          }
        } else {
          console.log('❌ Bookings API failed');
        }
      } catch (error) {
        console.error('❌ Error parsing bookings response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Bookings API request error:', error.message);
  });

  req.end();
}

testBookingsAPI();