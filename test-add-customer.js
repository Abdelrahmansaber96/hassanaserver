const http = require('http');

// استخدم التوكن الخاص بك هنا (احصل عليه من localStorage في المتصفح)
const token = 'YOUR_TOKEN_HERE'; // سنحتاج لتسجيل الدخول أولاً

const testData = {
  name: 'محمد أحمد',
  phone: '0501234567',
  email: 'mohammed@example.com',
  address: 'الرياض، حي النخيل'
};

const postData = JSON.stringify(testData);

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

console.log('🧪 Testing customer creation...\n');
console.log('Data to send:', testData);
console.log('\n---\n');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('\n✅ Customer created successfully!');
      } else {
        console.log('\n❌ Failed to create customer');
        console.log('Error details:', jsonData.message || jsonData.error);
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
