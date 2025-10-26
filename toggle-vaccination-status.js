const mongoose = require('mongoose');
const Vaccination = require('./src/models/Vaccination');

async function toggleVaccinationStatus() {
  console.log('🔄 Testing Active/Inactive Status Feature...\n');
  
  try {
    await mongoose.connect('mongodb://localhost:27017/animal_vaccination_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database\n');
    
    // جلب التطعيمات
    const vaccinations = await Vaccination.find({});
    
    if (vaccinations.length < 2) {
      console.log('⚠️ Not enough vaccinations to test. Run add-vaccinations.js first.');
      return;
    }
    
    // تغيير حالة أول تطعيمين لغير نشط
    console.log('📝 Setting some vaccinations to inactive...\n');
    
    const firstVaccination = vaccinations[0];
    const secondVaccination = vaccinations[1];
    
    firstVaccination.isActive = false;
    await firstVaccination.save();
    console.log(`❌ Set "${firstVaccination.nameAr}" to inactive`);
    
    secondVaccination.isActive = false;
    await secondVaccination.save();
    console.log(`❌ Set "${secondVaccination.nameAr}" to inactive\n`);
    
    // عرض النتائج
    console.log('📊 Current Status:');
    console.log('='.repeat(60));
    
    const updated = await Vaccination.find({});
    let activeCount = 0;
    let inactiveCount = 0;
    
    updated.forEach((v) => {
      const icon = v.isActive ? '🟢' : '🔴';
      const status = v.isActive ? '✅ نشط' : '❌ غير نشط';
      console.log(`${icon} ${v.nameAr.padEnd(30)} - ${status}`);
      
      if (v.isActive) activeCount++;
      else inactiveCount++;
    });
    
    console.log('='.repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`   Total: ${updated.length}`);
    console.log(`   Active: ${activeCount}`);
    console.log(`   Inactive: ${inactiveCount}`);
    
    console.log('\n✅ Done! Now you can test the API endpoint to see both active and inactive vaccinations.');
    console.log('\n💡 To test the endpoint, run: node test-http-request.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

toggleVaccinationStatus();
