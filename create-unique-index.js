const mongoose = require('mongoose');
const Customer = require('./src/models/Customer');

async function createUniqueIndex() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect('mongodb://localhost:27017/animal_vaccination_db');
    console.log('✅ Connected to MongoDB\n');

    // عرض جميع الـ indexes الحالية أولاً
    console.log('📋 Current indexes before update:');
    const oldIndexes = await Customer.collection.indexes();
    oldIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? '(unique)' : '(not unique)');
    });
    console.log('');

    // حذف الـ index القديم إذا كان موجوداً
    try {
      await Customer.collection.dropIndex('phone_1');
      console.log('🗑️  Dropped old phone index');
    } catch (error) {
      console.log('ℹ️  No existing phone index to drop:', error.message);
    }

    // الانتظار قليلاً
    await new Promise(resolve => setTimeout(resolve, 1000));

    // إنشاء unique index جديد
    try {
      await Customer.collection.createIndex({ phone: 1 }, { unique: true, name: 'phone_unique_idx' });
      console.log('✅ Created unique index on phone field\n');
    } catch (error) {
      console.log('⚠️  Error creating index:', error.message);
      // محاولة استخدام syncIndexes
      await Customer.syncIndexes();
      console.log('✅ Synced indexes from schema\n');
    }

    // عرض جميع الـ indexes النهائية
    const indexes = await Customer.collection.indexes();
    console.log('📋 Final indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, index.key, index.unique ? '(unique ✓)' : '(not unique)');
    });

    // اختبار: البحث عن أرقام مكررة
    console.log('\n🔍 Checking for duplicate phone numbers...');
    const duplicates = await Customer.aggregate([
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate phone numbers:');
      duplicates.forEach(dup => {
        console.log(`  Phone: ${dup._id}, Count: ${dup.count}, IDs: ${dup.ids.join(', ')}`);
      });
      console.log('\n💡 You may want to manually remove or update these duplicates.');
    } else {
      console.log('✅ No duplicate phone numbers found!');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 11000) {
      console.log('\n⚠️  Duplicate key error detected!');
      console.log('There are existing duplicate phone numbers in the database.');
      console.log('Please remove duplicates before creating unique index.');
    }
    process.exit(1);
  }
}

createUniqueIndex();
