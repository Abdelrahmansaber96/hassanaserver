const http = require('http');

const customerId = '68df8e48cd10e6f83af9b888'; // Real customer ID

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/customer-api/${customerId}/bookings`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🧪 Testing GET Bookings with Frequency Fields...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Method:', options.method);
console.log('\n⏳ Waiting for response...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}\n`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      
      if (parsed.success) {
        console.log(`✅ Found ${parsed.data.bookings.length} bookings\n`);
        
        if (parsed.data.bookings.length > 0) {
          const booking = parsed.data.bookings[0];
          console.log('📋 First Booking:');
          console.log('   Booking Number:', booking.bookingNumber);
          console.log('   Status:', booking.status);
          console.log('   Date:', new Date(booking.appointmentDate).toLocaleDateString('ar-SA'));
          console.log('   Time:', booking.appointmentTime);
          
          console.log('\n💉 Vaccination Details:');
          console.log('   Name:', booking.vaccination?.name || 'N/A');
          console.log('   Name (AR):', booking.vaccination?.nameAr || 'N/A');
          console.log('   Price:', booking.vaccination?.price || 'N/A', 'SAR');
          console.log('   Duration:', booking.vaccination?.duration || 'N/A', 'minutes');
          console.log('   ⭐ Frequency:', booking.vaccination?.frequency || '❌ NOT SET');
          console.log('   ⭐ Frequency Months:', booking.vaccination?.frequencyMonths || '❌ NOT SET');
          
          if (booking.vaccination?.frequency && booking.vaccination?.frequencyMonths) {
            console.log('\n✅ ✅ ✅ Frequency fields are present in GET bookings!');
          } else {
            console.log('\n❌ ❌ ❌ Frequency fields are MISSING in GET bookings!');
          }
        } else {
          console.log('⚠️ No bookings found for this customer');
        }
      } else {
        console.log('❌ FAILED:', parsed.message);
      }
    } catch (e) {
      console.log('Response Body:', body);
      console.log('Parse Error:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.end();
