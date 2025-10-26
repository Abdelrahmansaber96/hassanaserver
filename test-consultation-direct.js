const axios = require('axios');

const baseURL = 'http://localhost:3000';

async function testConsultation() {
  console.log('🧪 Testing Consultation Endpoint...\n');

  try {
    // First, get a customer ID
    console.log('1️⃣ Getting customers...');
    const customersResponse = await axios.get(`${baseURL}/api/customers`);
    const customer = customersResponse.data.data[0];
    console.log(`✅ Found customer: ${customer.name} (ID: ${customer._id})\n`);

    // Get a doctor ID
    console.log('2️⃣ Getting doctors...');
    const doctorsResponse = await axios.get(`${baseURL}/api/doctors`);
    const doctor = doctorsResponse.data.data.find(d => d.role === 'doctor');
    console.log(`✅ Found doctor: ${doctor.name} (ID: ${doctor._id})\n`);

    // Test consultation creation WITHOUT authentication
    console.log('3️⃣ Creating consultation WITHOUT token...');
    const consultationData = {
      customer: customer._id,
      doctor: doctor._id,
      consultationType: 'phone',
      scheduledDate: '2025-10-28',
      scheduledTime: '14:00',
      symptoms: 'الحيوان يعاني من فقدان الشهية',
      animalName: 'صقر',
      animalType: 'camel',
      animalAge: 3,
      notes: 'اختبار من الـ API'
    };

    console.log('Request URL:', `${baseURL}/api/customer-api/consultations`);
    console.log('Request Method: POST');
    console.log('Request Headers:', { 'Content-Type': 'application/json' });
    console.log('Request Body:', JSON.stringify(consultationData, null, 2));
    console.log('\n');

    const response = await axios.post(
      `${baseURL}/api/customer-api/consultations`,
      consultationData,
      {
        headers: {
          'Content-Type': 'application/json'
          // NO TOKEN - Testing public access
        }
      }
    );

    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));

    // Test getting consultations
    console.log('\n4️⃣ Getting consultations for customer...');
    const getResponse = await axios.get(
      `${baseURL}/api/customer-api/consultations?customerId=${customer._id}`
    );
    console.log('✅ Found consultations:', getResponse.data.data.length);
    console.log('✅ Response:', JSON.stringify(getResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    }
  }
}

testConsultation();
