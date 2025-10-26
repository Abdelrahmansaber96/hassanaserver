const http = require('http');

const customerId = '68f93996180bf0f12e7761fe';

console.log('Testing notifications endpoint...\n');
console.log(`URL: http://localhost:3000/api/customer-api/${customerId}/notifications\n`);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/customer-api/${customerId}/notifications`,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      const parsed = JSON.parse(data);
      console.log('\n✅ SUCCESS!');
      console.log('Notifications count:', parsed.data.notifications.length);
    } else {
      console.log('\n❌ ERROR!');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
