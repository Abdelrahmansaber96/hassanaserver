const BASE_URL = 'http://localhost:3000/api';

async function testConsultation() {
  console.log('🧪 Testing Consultation Endpoints...\n');

  try {
    // Step 1: Get doctors to get a valid doctor ID
    console.log('📋 Step 1: Getting doctors list...');
    const doctorsResponse = await fetch(`${BASE_URL}/doctors`);
    const doctorsData = await doctorsResponse.json();
    
    if (!doctorsData.success || doctorsData.data.length === 0) {
      console.error('❌ No doctors found!');
      return;
    }
    
    const doctorId = doctorsData.data[0]._id;
    console.log(`✅ Found doctor: ${doctorsData.data[0].name} (${doctorId})\n`);

    // Step 2: Get or create customer
    console.log('📋 Step 2: Login as customer...');
    const loginResponse = await fetch(`${BASE_URL}/customer-api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0512345678' })
    });
    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }
    
    const customerId = loginData.data.customer.id;
    console.log(`✅ Logged in: ${loginData.data.customer.name} (${customerId})\n`);

    // Step 3: Create consultation
    console.log('📋 Step 3: Creating consultation...');
    const consultationData = {
      customer: customerId,
      doctor: doctorId,
      consultationType: 'phone',
      scheduledDate: '2025-10-28',
      scheduledTime: '14:00',
      duration: 30,
      symptoms: 'الحيوان يعاني من فقدان الشهية',
      notes: 'استشارة عاجلة'
    };

    const createResponse = await fetch(`${BASE_URL}/customer-api/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultationData)
    });
    const createData = await createResponse.json();
    
    console.log('Status:', createResponse.status);
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createData.success) {
      console.log('\n✅ Consultation created successfully!');
      console.log('Consultation Number:', createData.data.consultationNumber);
      
      // Step 4: Get customer consultations
      console.log('\n📋 Step 4: Getting customer consultations...');
      const getResponse = await fetch(`${BASE_URL}/customer-api/consultations?customerId=${customerId}`);
      const getData = await getResponse.json();
      
      console.log('✅ Found', getData.data.length, 'consultation(s)');
      console.log('\n✅ All tests passed!');
    } else {
      console.error('\n❌ Failed to create consultation:', createData.message);
    }

  } catch (error) {
    console.error('❌ Test Failed!');
    console.error('Error:', error.message);
  }
}

testConsultation();
