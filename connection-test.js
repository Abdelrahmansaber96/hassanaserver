// Test if server is running by trying to connect to the main page
const http = require('http');

console.log('Testing server connection...');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log('✅ Server is running! Status:', res.statusCode);
    
    // Now test the API endpoint
    testAPI();
});

req.on('error', (error) => {
    console.error('❌ Server connection failed:', error.message);
});

req.end();

function testAPI() {
    console.log('\n--- Testing API Endpoint ---');
    
    const data = JSON.stringify({
        name: "تجربة بسيطة",
        phone: "0501111111"
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/register-customer',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log('API Response Status:', res.statusCode);
            console.log('API Response Body:', responseData);
            
            if (res.statusCode === 201) {
                console.log('✅ API Test SUCCESS!');
            } else {
                console.log('⚠️ API returned non-success status');
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ API request failed:', error.message);
    });

    req.write(data);
    req.end();
}