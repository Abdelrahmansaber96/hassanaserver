const https = require('https');
const http = require('http');

// Simple test data
const testData = JSON.stringify({
    name: "تجربة",
    phone: "0501111111"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register-customer',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('Testing simple customer registration...');
console.log('Data:', testData);

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\n=== Response ===');
        console.log('Status:', res.statusCode);
        console.log('Body:', data);
        
        try {
            const parsed = JSON.parse(data);
            console.log('\n=== Parsed Response ===');
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('Could not parse JSON response');
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(testData);
req.end();