const http = require('http');

const testCustomerRegistration = () => {
    const data = JSON.stringify({
        name: "أحمد التجريبي",
        phone: "0501111111",
        animalType: "إبل",
        notes: "عميل تجريبي للاختبار"
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
            console.log('Status Code:', res.statusCode);
            console.log('Response:', responseData);
            
            try {
                const parsedResponse = JSON.parse(responseData);
                console.log('Parsed Response:', JSON.stringify(parsedResponse, null, 2));
            } catch (error) {
                console.log('Response is not valid JSON');
            }
        });
    });

    req.on('error', (error) => {
        console.error('Request error:', error.message);
    });

    req.write(data);
    req.end();
};

console.log('Testing customer registration API...');
testCustomerRegistration();