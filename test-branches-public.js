const http = require('http');

console.log('='.repeat(70));
console.log('🧪 Testing Public Branches Endpoint (No Token Required)');
console.log('='.repeat(70));

// Test 1: Get all branches
console.log('\n📍 Test 1: GET /api/branches (without token)\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/branches',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
    // ✅ No Authorization header - testing public access
  }
};

console.log('⏳ Sending request...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('='.repeat(70));
    console.log('📊 Response:');
    console.log('='.repeat(70));
    console.log(`\nStatus Code: ${res.statusCode} ${res.statusMessage}`);
    
    try {
      const jsonData = JSON.parse(data);
      
      if (res.statusCode === 200 && jsonData.success) {
        console.log('✅ SUCCESS: Endpoint is now public!\n');
        console.log('📦 Response Body:\n');
        console.log(JSON.stringify(jsonData, null, 2));
        
        if (jsonData.data && Array.isArray(jsonData.data)) {
          console.log('\n' + '='.repeat(70));
          console.log(`✅ Found ${jsonData.data.length} branches`);
          
          jsonData.data.forEach((branch, i) => {
            console.log(`\n${i + 1}. ${branch.name}`);
            console.log(`   📍 City: ${branch.city || 'N/A'}`);
            console.log(`   📞 Phone: ${branch.phone || 'N/A'}`);
            console.log(`   📧 Email: ${branch.email || 'N/A'}`);
            if (branch.location) {
              console.log(`   🗺️  Location: ${branch.location.lat}, ${branch.location.lng}`);
            }
          });
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🎉 Test PASSED! Branches endpoint is now public.');
        console.log('='.repeat(70));
        
      } else if (res.statusCode === 401 || jsonData.message?.includes('token')) {
        console.log('❌ FAILED: Endpoint still requires authentication\n');
        console.log('Error:', jsonData.message);
        console.log('\n⚠️  The endpoint is still protected. Check routes configuration.');
      } else {
        console.log('⚠️  Unexpected response:\n');
        console.log(JSON.stringify(jsonData, null, 2));
      }
      
    } catch (error) {
      console.log('\n❌ Error parsing JSON:', error.message);
      console.log('Raw Response:', data);
    }
    
    console.log('\n');
  });
});

req.on('error', (error) => {
  console.error('\n❌ Connection error:', error.message);
  console.log('\n⚠️  Make sure the server is running on port 3000');
  console.log('   Start the server: node src/server.js\n');
});

req.end();
