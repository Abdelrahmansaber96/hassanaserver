const BASE_URL = 'http://localhost:3000/api';

async function testDoctorsPublicAccess() {
  console.log('🧪 Testing Public Access to Doctors Endpoints...\n');

  try {
    // Test 1: Get all doctors (no token)
    console.log('📋 Test 1: Get all doctors (no token)');
    const response = await fetch(`${BASE_URL}/doctors`);
    const data = await response.json();
    
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Total Doctors:', data.data.length);
    
    if (data.data.length > 0) {
      console.log('\n👨‍⚕️ First Doctor:');
      const doctor = data.data[0];
      console.log('   - ID:', doctor._id);
      console.log('   - Name:', doctor.name);
      console.log('   - Specialization:', doctor.specialization);
      console.log('   - Phone:', doctor.phone);
      
      // Test 2: Get single doctor details
      console.log('\n📋 Test 2: Get single doctor details (no token)');
      const doctorResponse = await fetch(`${BASE_URL}/doctors/${doctor._id}`);
      const doctorData = await doctorResponse.json();
      console.log('✅ Status:', doctorResponse.status);
      console.log('✅ Doctor Name:', doctorData.data.name);
      console.log('✅ Branch:', doctorData.data.branch?.name || 'N/A');
    }
    
    console.log('\n✅ All tests passed! Doctors endpoint is now public.');
    
  } catch (error) {
    console.error('❌ Test Failed!');
    console.error('Error:', error.message);
  }
}

testDoctorsPublicAccess();
