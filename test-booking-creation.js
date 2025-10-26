const http = require('http');

const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

const testBookingCreation = async () => {
  console.log('======================================================================');
  console.log('🧪 Testing Booking Creation Flow');
  console.log('======================================================================\n');

  try {
    // الخطوة 1: تسجيل عميل جديد أو استخدام عميل موجود
    console.log('📝 Step 1: Register/Login Customer');
    const loginData = {
      phone: '0512345678'
    };
    
    let loginResponse = await makeRequest('POST', '/api/customer-api/login', loginData);
    
    let customerId;
    if (loginResponse.statusCode === 404) {
      console.log('   Customer not found, registering new customer...');
      const registerData = {
        name: 'أحمد محمد',
        phone: '0512345678'
      };
      const registerResponse = await makeRequest('POST', '/api/customer-api/register', registerData);
      customerId = registerResponse.body.data.customer.id;
      console.log(`   ✅ New customer registered: ${customerId}`);
    } else {
      customerId = loginResponse.body.data.customer.id;
      console.log(`   ✅ Customer logged in: ${customerId}`);
    }

    // الخطوة 2: إضافة حيوان إذا لم يكن موجوداً
    console.log('\n🐪 Step 2: Get/Add Animal');
    const animalsResponse = await makeRequest('GET', `/api/customer-api/${customerId}/animals`);
    
    let animalId;
    if (animalsResponse.body.data && animalsResponse.body.data.length > 0) {
      animalId = animalsResponse.body.data[0]._id;
      console.log(`   ✅ Using existing animal: ${animalsResponse.body.data[0].name} (${animalId})`);
    } else {
      console.log('   No animals found, adding new animal...');
      const animalData = {
        name: 'صقر',
        type: 'camel',
        age: 3,
        weight: 450,
        breed: 'مجاهيم',
        count: 1
      };
      const addAnimalResponse = await makeRequest('POST', `/api/customer-api/${customerId}/animals`, animalData);
      animalId = addAnimalResponse.body.data.animal._id;
      console.log(`   ✅ New animal added: ${animalId}`);
    }

    // الخطوة 3: الحصول على التطعيمات المناسبة
    console.log('\n💉 Step 3: Get Available Vaccinations');
    const vaccinationsResponse = await makeRequest('GET', `/api/customer-api/${customerId}/animals/${animalId}/vaccinations`);
    
    if (!vaccinationsResponse.body.data.vaccinations || vaccinationsResponse.body.data.vaccinations.length === 0) {
      console.log('   ❌ No vaccinations available for this animal');
      return;
    }
    
    // اختر أول تطعيم نشط
    const activeVaccination = vaccinationsResponse.body.data.vaccinations.find(v => v.isActive === true);
    if (!activeVaccination) {
      console.log('   ❌ No active vaccinations available');
      return;
    }
    
    const vaccinationId = activeVaccination._id;
    console.log(`   ✅ Found vaccination: ${activeVaccination.nameAr} (${vaccinationId})`);
    console.log(`      Price: ${activeVaccination.price} SAR`);

    // الخطوة 4: الحصول على الفروع
    console.log('\n🏥 Step 4: Get Available Branches');
    const branchesResponse = await makeRequest('GET', '/api/branches');
    
    if (!branchesResponse.body.data || branchesResponse.body.data.length === 0) {
      console.log('   ❌ No branches available');
      return;
    }
    
    const branchId = branchesResponse.body.data[0]._id;
    console.log(`   ✅ Selected branch: ${branchesResponse.body.data[0].name} (${branchId})`);

    // الخطوة 5: إنشاء الحجز
    console.log('\n📅 Step 5: Create Booking');
    const bookingData = {
      animalId: animalId,
      vaccinationId: vaccinationId,
      branchId: branchId,
      appointmentDate: '2025-10-30',
      timeSlot: '10:00',
      notes: 'حجز تجريبي - يرجى التعامل بحذر مع الحيوان'
    };

    console.log('\n📦 Booking Request Data:');
    console.log(JSON.stringify(bookingData, null, 2));

    const bookingResponse = await makeRequest('POST', `/api/customer-api/${customerId}/bookings`, bookingData);

    console.log('\n📊 Response:');
    console.log('======================================================================');
    console.log(`Status Code: ${bookingResponse.statusCode}`);
    console.log('\n📦 Response Body:');
    console.log(JSON.stringify(bookingResponse.body, null, 2));
    console.log('======================================================================');

    if (bookingResponse.statusCode === 201) {
      console.log('\n✅ SUCCESS! Booking created successfully!');
      console.log(`   Booking Number: ${bookingResponse.body.data.booking.bookingNumber}`);
      console.log(`   Status: ${bookingResponse.body.data.booking.status}`);
      console.log(`   Total Amount: ${bookingResponse.body.data.booking.totalAmount} SAR`);
      console.log(`   Appointment: ${bookingResponse.body.data.booking.appointmentDate} at ${bookingResponse.body.data.booking.timeSlot}`);
    } else {
      console.log('\n❌ FAILED! Booking creation failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n======================================================================');
  console.log('🏁 Test Complete');
  console.log('======================================================================');
};

testBookingCreation();
