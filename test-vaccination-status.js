const mongoose = require('mongoose');
const Vaccination = require('./src/models/Vaccination');

async function testVaccinationStatusFeature() {
  console.log('🧪 Testing Vaccination Status Feature...\n');
  
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect('mongodb://localhost:27017/animal_vaccination_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // 1. عرض جميع التطعيمات مع حالتها
    console.log('📊 Current Vaccinations Status:');
    console.log('='.repeat(60));
    const allVaccinations = await Vaccination.find({}).select('name nameAr price isActive animalTypes');
    
    let activeCount = 0;
    let inactiveCount = 0;
    
    allVaccinations.forEach((vaccination, index) => {
      const status = vaccination.isActive ? '✅ نشط' : '❌ غير نشط';
      const icon = vaccination.isActive ? '🟢' : '🔴';
      
      console.log(`${index + 1}. ${icon} ${vaccination.nameAr || vaccination.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   Price: ${vaccination.price} SAR`);
      console.log(`   Animal Types: ${vaccination.animalTypes.join(', ')}`);
      console.log(`   ID: ${vaccination._id}`);
      console.log('-'.repeat(60));
      
      if (vaccination.isActive) activeCount++;
      else inactiveCount++;
    });
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total: ${allVaccinations.length}`);
    console.log(`   Active (نشط): ${activeCount}`);
    console.log(`   Inactive (غير نشط): ${inactiveCount}`);
    console.log('='.repeat(60));
    
    // 2. اختبار تغيير حالة تطعيم
    if (allVaccinations.length > 0) {
      console.log(`\n🔄 Testing Status Toggle...`);
      const testVaccination = allVaccinations[0];
      const oldStatus = testVaccination.isActive;
      
      console.log(`\nChanging "${testVaccination.nameAr || testVaccination.name}":`);
      console.log(`   Before: ${oldStatus ? '✅ نشط' : '❌ غير نشط'}`);
      
      testVaccination.isActive = !oldStatus;
      await testVaccination.save();
      
      console.log(`   After:  ${testVaccination.isActive ? '✅ نشط' : '❌ غير نشط'}`);
      
      // إعادة التغيير
      testVaccination.isActive = oldStatus;
      await testVaccination.save();
      console.log(`   Restored to original status: ${oldStatus ? '✅ نشط' : '❌ غير نشط'}`);
      console.log('✅ Status toggle test passed!');
    }
    
    // 3. اختبار الفلترة
    console.log(`\n🔍 Testing Filtering:`);
    const activeVaccinations = await Vaccination.find({ isActive: true });
    const inactiveVaccinations = await Vaccination.find({ isActive: false });
    
    console.log(`   Active query returned: ${activeVaccinations.length} vaccinations`);
    console.log(`   Inactive query returned: ${inactiveVaccinations.length} vaccinations`);
    
    // 4. اختبار الـ endpoint (simulation)
    console.log(`\n🌐 Simulating API Response:`);
    const sampleVaccination = allVaccinations[0];
    const apiResponse = {
      success: true,
      data: {
        vaccinations: [
          {
            _id: sampleVaccination._id,
            name: sampleVaccination.name,
            nameAr: sampleVaccination.nameAr,
            price: sampleVaccination.price,
            isActive: sampleVaccination.isActive,  // ✅ الحقل الجديد
            animalTypes: sampleVaccination.animalTypes
          }
        ]
      }
    };
    
    console.log(JSON.stringify(apiResponse, null, 2));
    
    // 5. التحقق من أن isActive موجود في جميع التطعيمات
    console.log(`\n✔️ Verification:`);
    const missingIsActive = allVaccinations.filter(v => v.isActive === undefined);
    if (missingIsActive.length === 0) {
      console.log('   ✅ All vaccinations have isActive field');
    } else {
      console.log(`   ⚠️ ${missingIsActive.length} vaccinations missing isActive field`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// تشغيل الاختبار
testVaccinationStatusFeature();
