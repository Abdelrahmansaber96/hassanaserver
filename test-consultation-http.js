const http = require('http');

const data = JSON.stringify({
  customer: '67397c2e69ff69c77098edda',
  doctor: '67397c2e69ff69c77098ede0',
  consultationType: 'phone',
  scheduledDate: '2025-10-28',
  scheduledTime: '14:00',
  symptoms: 'test symptoms from http module'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/consultations/customer/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing consultation endpoint...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Method:', options.method);
console.log('Body:', data);
console.log('\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log(`✅ Headers:`, JSON.stringify(res.headers, null, 2));
  console.log('\n📦 Response Body:');
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.success) {
        console.log('\n✅ SUCCESS: Consultation created without authentication!');
      } else {
        console.log('\n❌ FAILED:', parsed.message);
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.write(data);
req.end();
