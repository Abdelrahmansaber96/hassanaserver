const mongoose = require('mongoose');
const Customer = require('./src/models/Customer');

async function checkIndexes() {
  try {
    await mongoose.connect('mongodb://localhost:27017/animal_vaccination_db');
    console.log('✅ Connected to MongoDB\n');

    const indexes = await Customer.collection.indexes();
    console.log('📋 Current indexes on customers collection:\n');
    indexes.forEach(index => {
      console.log(`  Name: ${index.name}`);
      console.log(`  Keys: ${JSON.stringify(index.key)}`);
      console.log(`  Unique: ${index.unique ? '✓ Yes' : '✗ No'}`);
      console.log(`  Background: ${index.background ? 'Yes' : 'No'}`);
      console.log('');
    });

    // اختبار البحث عن مكررات
    console.log('🔍 Checking for any remaining duplicates...\n');
    const duplicates = await Customer.aggregate([
      {
        $group: {
          _id: '$phone',
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found! All phone numbers are unique.\n');
    } else {
      console.log('⚠️  Still found duplicates:', duplicates);
    }

    // عرض إجمالي عدد العملاء
    const totalCustomers = await Customer.countDocuments();
    console.log(`📊 Total customers: ${totalCustomers}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkIndexes();
