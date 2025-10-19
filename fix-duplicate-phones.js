const mongoose = require('mongoose');
const Customer = require('./src/models/Customer');

async function findAndFixDuplicates() {
  try {
    await mongoose.connect('mongodb://localhost:27017/animal_vaccination_db');
    console.log('✅ Connected to MongoDB\n');

    // البحث عن الأرقام المكررة
    console.log('🔍 Searching for duplicate phone numbers...\n');
    
    const duplicates = await Customer.aggregate([
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          ids: { $push: '$_id' },
          names: { $push: '$name' },
          createdAt: { $push: '$createdAt' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicate phone numbers found!');
      console.log('You can now create the unique index safely.\n');
      
      // إنشاء الـ index
      try {
        await Customer.collection.dropIndex('phone_1');
        console.log('🗑️  Dropped old index');
      } catch (e) {}
      
      await Customer.syncIndexes();
      console.log('✅ Created unique index on phone field');
      
      await mongoose.connection.close();
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate phone numbers:\n`);
    
    let totalDuplicates = 0;
    for (const dup of duplicates) {
      console.log(`📞 Phone: ${dup._id}`);
      console.log(`   Count: ${dup.count} occurrences`);
      console.log(`   Customers:`);
      
      for (let i = 0; i < dup.ids.length; i++) {
        const customer = await Customer.findById(dup.ids[i]);
        console.log(`     ${i + 1}. ${customer.name} (ID: ${dup.ids[i]})`);
        console.log(`        Created: ${new Date(customer.createdAt).toLocaleString('ar-SA')}`);
        console.log(`        Animals: ${customer.animals.length}`);
        console.log(`        Bookings: ${customer.totalBookings}`);
      }
      console.log('');
      
      // حذف النسخ المكررة (نبقي الأقدم)
      console.log(`   🔧 Fixing: Keeping oldest record, removing ${dup.count - 1} duplicates...`);
      
      // ترتيب حسب تاريخ الإنشاء
      const sortedIds = dup.ids
        .map((id, index) => ({ id, createdAt: dup.createdAt[index] }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // حذف جميع النسخ ماعدا الأقدم
      for (let i = 1; i < sortedIds.length; i++) {
        await Customer.findByIdAndDelete(sortedIds[i].id);
        console.log(`     ✓ Deleted duplicate: ${sortedIds[i].id}`);
        totalDuplicates++;
      }
      
      console.log(`     ✅ Kept original: ${sortedIds[0].id}\n`);
    }

    console.log(`\n✅ Fixed ${totalDuplicates} duplicate records!`);
    console.log('\n🔄 Now creating unique index...');
    
    // حذف الـ index القديم
    try {
      await Customer.collection.dropIndex('phone_1');
      console.log('🗑️  Dropped old index');
    } catch (e) {}
    
    // الانتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // إنشاء unique index جديد
    await Customer.syncIndexes();
    console.log('✅ Created unique index on phone field');
    
    // التحقق من الـ indexes النهائية
    const indexes = await Customer.collection.indexes();
    console.log('\n📋 Final indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? '(unique ✓)' : '');
    });

    await mongoose.connection.close();
    console.log('\n✅ All done! Phone numbers are now unique.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findAndFixDuplicates();
