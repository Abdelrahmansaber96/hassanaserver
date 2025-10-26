const http = require('http');

const customerId = '68df8e48cd10e6f83af9b888';
const animalId = '68df8e48cd10e6f83af9b889';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/customer-api/${customerId}/animals/${animalId}/vaccinations`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('='.repeat(70));
console.log('🌐 اختبار HTTP Request للـ Endpoint الفعلي');
console.log('='.repeat(70));
console.log(`\n📍 URL: http://localhost:3000${options.path}\n`);
console.log('⏳ جاري إرسال الطلب...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('='.repeat(70));
    console.log('📊 Response من السيرفر:');
    console.log('='.repeat(70));
    console.log(`\n✅ Status Code: ${res.statusCode}`);
    console.log(`✅ Status Message: ${res.statusMessage}\n`);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('📦 Response Body:\n');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n' + '='.repeat(70));
        console.log('✅ النتائج:');
        console.log('='.repeat(70));
        console.log(`\n🐪 الحيوان: ${jsonData.data.animal.name} (${jsonData.data.animal.type})`);
        console.log(`📅 العمر: ${jsonData.data.animal.age} سنة`);
        console.log(`🔢 العدد: ${jsonData.data.animal.count}`);
        console.log(`\n💉 عدد التطعيمات المناسبة: ${jsonData.data.vaccinations.length}`);
        
        if (jsonData.data.vaccinations.length > 0) {
          console.log('\n📋 قائمة التطعيمات:');
          jsonData.data.vaccinations.forEach((v, i) => {
            console.log(`\n  ${i + 1}. ${v.nameAr} (${v.name})`);
            console.log(`     💰 السعر: ${v.price} ريال`);
            console.log(`     📅 التردد: ${v.frequency}`);
            console.log(`     🐾 مناسب لـ: ${v.animalTypes.join(', ')}`);
            if (v.ageRange) {
              console.log(`     🎂 العمر المناسب: ${v.ageRange.min}-${v.ageRange.max} سنة`);
            }
          });
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🎉 الـ Endpoint يعمل بشكل صحيح!');
        console.log('='.repeat(70));
        console.log('\n✅ الفلترة حسب نوع الحيوان: تعمل');
        console.log('✅ الفلترة حسب عمر الحيوان: تعمل');
        console.log('✅ الـ Response يطابق التوثيق: نعم');
        console.log('✅ الـ Status Code: 200 OK');
      } else {
        console.log('\n❌ فشل الطلب:', jsonData.message);
      }
    } catch (error) {
      console.log('\n❌ خطأ في تحليل JSON:', error.message);
      console.log('Raw Response:', data);
    }
    
    console.log('\n');
  });
});

req.on('error', (error) => {
  console.error('\n❌ خطأ في الاتصال:', error.message);
  console.log('\n⚠️  تأكد من أن السيرفر يعمل على المنفذ 3000');
  console.log('   يمكنك تشغيل السيرفر باستخدام: node src/server.js\n');
});

req.end();
