const http = require('http');

// Test booking with proper data
const testData = {
  animalId: '68df8e48cd10e6f83af9b889', // Real animal ID
  vaccinationId: '68fb84f5d1dd5abfaafecfc0', // Anthrax Vaccine (Active)
  branchId: '68df8e48cd10e6f83af9b86e', // Real branch ID - فرع الرياض
  appointmentDate: '2025-10-30',
  timeSlot: '10:00',
  notes: 'Testing frequency fields'
};

const customerId = '68df8e48cd10e6f83af9b888'; // Real customer ID

const data = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/customer-api/${customerId}/bookings`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing Booking with Frequency Fields...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Method:', options.method);
console.log('Body:', testData);
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
        console.log('✅ SUCCESS: Booking created!\n');
        console.log('📋 Booking Details:');
        console.log('   Booking Number:', parsed.data.booking.bookingNumber);
        console.log('   Status:', parsed.data.booking.status);
        console.log('\n💉 Vaccination Details:');
        console.log('   Name:', parsed.data.booking.vaccination.name);
        console.log('   Name (AR):', parsed.data.booking.vaccination.nameAr);
        console.log('   Price:', parsed.data.booking.vaccination.price, 'SAR');
        console.log('   Duration:', parsed.data.booking.vaccination.duration, 'minutes');
        console.log('   ⭐ Frequency:', parsed.data.booking.vaccination.frequency || '❌ NOT SET');
        console.log('   ⭐ Frequency Months:', parsed.data.booking.vaccination.frequencyMonths || '❌ NOT SET');
        
        if (parsed.data.booking.vaccination.frequency && parsed.data.booking.vaccination.frequencyMonths) {
          console.log('\n✅ ✅ ✅ Frequency fields are present!');
        } else {
          console.log('\n❌ ❌ ❌ Frequency fields are MISSING!');
        }
      } else {
        console.log('❌ FAILED:', parsed.message);
        console.log('Full Response:', JSON.stringify(parsed, null, 2));
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

req.write(data);
req.end();
