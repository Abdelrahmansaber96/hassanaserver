// Test API with modern fetch (requires Node 18+)
(async () => {
    try {
        console.log('Testing API with fetch...');
        
        const response = await fetch('http://localhost:3000/api/auth/register-customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "تجربة بـ fetch",
                phone: "0501111111",
                animalType: "إبل",
                notes: "اختبار بـ fetch"
            })
        });
        
        const result = await response.json();
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));
        
        if (response.status === 201) {
            console.log('✅ SUCCESS: Customer registered successfully!');
        } else {
            console.log('⚠️ Non-success status');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
})();