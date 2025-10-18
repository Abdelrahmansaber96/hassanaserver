const https = require('https');
const http = require('http');

// Simple HTTP request function
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
  });
}

// Test the charts endpoints
async function testChartsAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    console.log('Testing Dashboard Charts API (without auth)...\n');
    
    // Test operations chart
    console.log('Testing operations endpoint...');
    const operations = await makeRequest(`${baseURL}/api/dashboard/charts/operations?period=7days`);
    console.log('Operations Response:', JSON.stringify(operations, null, 2));
    
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testChartsAPI();