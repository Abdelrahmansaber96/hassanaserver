const http = require('http');

const postData = JSON.stringify({
  email: 'admin@clinic.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing login API...\n');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n✅ Login successful!');
        console.log('Token:', jsonData.data.token.substring(0, 20) + '...');
        console.log('User:', jsonData.data.user.name);
      } else {
        console.log('\n❌ Login failed:', jsonData.message);
      }
    } catch (error) {
      console.error('Parse error:', error.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(postData);
req.end();
